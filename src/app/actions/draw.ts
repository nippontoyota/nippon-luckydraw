"use server";

import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "./auth";
import { revalidatePath } from "next/cache";

export async function drawWinner(branchId: string, forceRerun = false) {
  if (!(await isAuthenticated())) {
    return { error: "Unauthorized" };
  }

  // Atomically lock the branch for drawing
  const lockResult = await prisma.branch.updateMany({
    where: { id: branchId, drawStatus: "PENDING" },
    data: { drawStatus: "DRAWING" },
  });

  if (lockResult.count === 0) {
    // Check if it's COMPLETED (re-run case)
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (branch?.drawStatus === "COMPLETED") {
      if (!forceRerun) {
        return { error: "WINNERS_EXIST" }; // Signal to UI to confirm re-run
      }
      // Re-run: reset status to DRAWING
      await prisma.branch.update({ where: { id: branchId }, data: { drawStatus: "DRAWING" } });
    } else {
      return { error: "Draw is already in progress for this branch." };
    }
  }

  try {
    // Re-run: delete existing winners
    await prisma.winner.deleteMany({ where: { branchId } });

    // Get all eligible entries: not excluded (flagged entries still eligible unless manually excluded)
    const eligibleEntries = await prisma.entry.findMany({
      where: {
        branchId,
        excluded: false,
        winner: null,
      },
    });

    if (eligibleEntries.length < 3) {
      throw new Error(`Not enough eligible entries to draw 3 winners. Found: ${eligibleEntries.length}`);
    }

    // Fisher-Yates shuffle
    for (let i = eligibleEntries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [eligibleEntries[i], eligibleEntries[j]] = [eligibleEntries[j], eligibleEntries[i]];
    }

    const selectedEntries = [eligibleEntries[0], eligibleEntries[1], eligibleEntries[2]];

    // Create winners and update branch status atomically
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < 3; i++) {
        await tx.winner.create({
          data: {
            entryId: selectedEntries[i].id,
            branchId,
            place: i + 1,
          },
        });
      }

      await tx.branch.update({
        where: { id: branchId },
        data: { drawStatus: "COMPLETED" },
      });
    });

    // Enqueue winner WhatsApp notifications (fire-and-forget — cron processes them)
    await prisma.whatsAppLog.createMany({
      data: selectedEntries.map((entry, i) => ({
        entryId: entry.id,
        status: "PENDING",
        // Encode place in error field temporarily until schema supports it
        // Cron reads this to use winner template
        error: `winner:${i + 1}`,
      })),
    }).catch(e => console.error("Failed to enqueue winner notifications:", e));

    // Trigger cron immediately for fast delivery
    const CRON_SECRET = process.env.CRON_SECRET || "local_dev_cron_secret";
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    fetch(`${APP_URL}/api/cron/whatsapp`, {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    }).catch(() => {});

    revalidatePath("/admin/dashboard");
    revalidatePath("/winners");
    return { success: true };
  } catch (error: unknown) {
    console.error("Draw error:", error);
    
    // Revert the lock if we failed
    await prisma.branch.update({
      where: { id: branchId },
      data: { drawStatus: "PENDING" },
    }).catch(e => console.error("Failed to revert draw lock:", e));

    return { error: error instanceof Error ? error.message : "An error occurred while drawing the winners." };
  }
}

