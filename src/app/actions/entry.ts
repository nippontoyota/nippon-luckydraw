"use server";

import { entrySchema, type EntryInput } from "@/schemas/entry";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { assessEntrySync, assessEntryDb } from "@/lib/fraud";

async function triggerWhatsAppCron() {
  try {
    const { GET } = await import("@/app/api/cron/whatsapp/route");
    const req = new Request("http://localhost/api/cron/whatsapp", {
      headers: {
        authorization: `Bearer ${process.env.CRON_SECRET || "local_dev_cron_secret"}`,
      },
    });
    await GET(req);
  } catch (e) {
    console.error("Failed to trigger WhatsApp cron:", e);
  }
}

export async function submitEntry(data: EntryInput) {
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown";
  const userAgent = reqHeaders.get("user-agent") || "unknown";

  const validated = entrySchema.safeParse(data);
  if (!validated.success) {
    return { error: "Invalid data provided." };
  }

  const { name, phone, modelId, colourId, vin, branchId, honeypot } = validated.data;
  const normalizedPhone = `+91${phone}`;

  if (honeypot) {
    return { error: "Spam detected." };
  }

  const syncFlags = assessEntrySync(validated.data);

  try {
    // One DB round-trip: uniqueness + branch/model/colour names + fraud
    const [branch, existingEntry, model, colour, dbFlags] = await Promise.all([
      prisma.branch.findUnique({
        where: { id: branchId },
        select: { id: true, name: true },
      }),
      prisma.entry.findFirst({
        where: { OR: [{ phone: normalizedPhone }, { vin }] },
        select: { phone: true, vin: true },
      }),
      prisma.model.findUnique({ where: { id: modelId }, select: { name: true } }),
      prisma.colour.findUnique({ where: { id: colourId }, select: { name: true } }),
      assessEntryDb(normalizedPhone, ip, branchId),
    ]);

    if (!branch) return { error: "Invalid branch selected." };
    if (!model || !colour) return { error: "Invalid vehicle selection." };

    if (existingEntry) {
      if (existingEntry.phone === normalizedPhone) {
        return { error: "This mobile number has already been registered." };
      }
      if (existingEntry.vin === vin) {
        return { error: "This VIN has already been registered." };
      }
    }

    const fraudFlags = [...syncFlags, ...dbFlags];

    const entry = await prisma.entry.create({
      data: {
        name,
        phone: normalizedPhone,
        phoneRaw: phone,
        modelId,
        colourId,
        vin,
        branchId: branch.id,
        ip,
        userAgent,
        flag: fraudFlags.length > 0 ? JSON.stringify(fraudFlags) : null,
      },
      select: { id: true },
    });

    // Log synchronously so a dropped background task still leaves a retryable record
    await prisma.whatsAppLog.create({
      data: { status: "PENDING", entryId: entry.id },
    });

    // Await cron inline — Vercel can kill after() callbacks before WhatsApp sends
    await triggerWhatsAppCron();

    return { id: entry.id };
  } catch (error) {
    console.error("Submission error:", error);
    return { error: "Failed to submit entry. Please try again later." };
  }
}

export async function deleteEntry(id: string) {
  try {
    await prisma.$transaction([
      prisma.winner.deleteMany({ where: { entryId: id } }),
      prisma.entry.delete({ where: { id } }),
    ]);

    revalidatePath("/admin/dashboard/entries");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return { error: "Failed to delete entry. It might have related records." };
  }
}

export async function toggleExclude(entryId: string) {
  try {
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      select: { excluded: true },
    });
    if (!entry) return { error: "Entry not found" };

    await prisma.entry.update({
      where: { id: entryId },
      data: { excluded: !entry.excluded },
    });

    revalidatePath("/admin/dashboard/entries");
    return { success: true, excluded: !entry.excluded };
  } catch (error) {
    console.error("Failed to toggle exclude:", error);
    return { error: "Failed to update entry." };
  }
}
