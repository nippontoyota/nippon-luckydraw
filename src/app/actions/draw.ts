"use server";

import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "./auth";
import { revalidatePath } from "next/cache";

export async function drawWinner(branchId: string) {
  if (!(await isAuthenticated())) {
    return { error: "Unauthorized" };
  }

  // Atomically lock the branch for drawing
  const lockResult = await prisma.branch.updateMany({
    where: { id: branchId, drawStatus: "PENDING" },
    data: { drawStatus: "DRAWING" },
  });

  if (lockResult.count === 0) {
    return { error: "Draw is already in progress or completed for this branch." };
  }

  try {
    // Check if winners already exist for this branch
    const existingWinners = await prisma.winner.findMany({
      where: { branchId },
    });

    if (existingWinners.length >= 3) {
      throw new Error("All 3 winners have already been selected for this branch.");
    }
    
    if (existingWinners.length > 0) {
      throw new Error("Some winners were already drawn manually. Cannot run full atomic draw.");
    }

    // Get all eligible entries for this branch (not already won, not flagged)
    const eligibleEntries = await prisma.entry.findMany({
      where: {
        branchId,
        flag: null, // Ensure no fraud flags
        winner: null, // Hasn't won yet
      },
    });

    if (eligibleEntries.length < 3) {
      throw new Error(`Not enough eligible entries to draw 3 winners. Found: ${eligibleEntries.length}`);
    }

    // Implement Fisher-Yates shuffle to randomize the array
    for (let i = eligibleEntries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [eligibleEntries[i], eligibleEntries[j]] = [eligibleEntries[j], eligibleEntries[i]];
    }

    // Pick the top 3
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

    revalidatePath("/admin/dashboard");
    revalidatePath("/winners");
    return { success: true };
  } catch (error: any) {
    console.error("Draw error:", error);
    
    // Revert the lock if we failed
    await prisma.branch.update({
      where: { id: branchId },
      data: { drawStatus: "PENDING" },
    }).catch(e => console.error("Failed to revert draw lock:", e));

    return { error: error.message || "An error occurred while drawing the winners." };
  }
}
