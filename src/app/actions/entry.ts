"use server";

import { after } from "next/server";
import { entrySchema, type EntryInput } from "@/schemas/entry";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { assessEntry } from "@/lib/fraud";


export async function submitEntry(data: EntryInput) {
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown";
  const userAgent = reqHeaders.get("user-agent") || "unknown";

  // 1. Validation
  const validated = entrySchema.safeParse(data);
  if (!validated.success) {
    return { error: "Invalid data provided." };
  }

  const { name, phone, modelId, colourId, vin, branchId, honeypot } = validated.data;
  const normalizedPhone = `+91${phone}`;

  // 2. Honeypot check
  if (honeypot) {
    return { error: "Spam detected." };
  }


  try {
    // 4 & 5. Global Uniqueness & Branch Lookup (Parallel)
    const [branch, existingEntry] = await Promise.all([
      prisma.branch.findUnique({ where: { id: branchId } }),
      prisma.entry.findFirst({
        where: {
          OR: [{ phone: normalizedPhone }, { vin }],
        },
      }),
    ]);

    if (!branch) {
      return { error: "Invalid branch selected." };
    }

    if (existingEntry) {
      if (existingEntry.phone === normalizedPhone) {
        return { error: "This mobile number has already been registered." };
      }
      if (existingEntry.vin === vin) {
        return { error: "This VIN has already been registered." };
      }
    }

    // 6. Assess Fraud Flags
    const fraudFlags = await assessEntry(validated.data, ip, branch.id);

    // 7. Create Entry & WhatsAppLog in a transaction
    const entry = await prisma.$transaction(async (tx) => {
      const newEntry = await tx.entry.create({
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
      });

      await tx.whatsAppLog.create({
        data: {
          status: "PENDING",
          entryId: newEntry.id,
        },
      });

      return newEntry;
    });

    // Fire WhatsApp processing after response sent (non-blocking)
    after(async () => {
      try {
        const { GET } = await import("@/app/api/cron/whatsapp/route");
        const dummyReq = new Request("http://localhost/api/cron/whatsapp", {
          headers: {
            authorization: `Bearer ${process.env.CRON_SECRET || "local_dev_cron_secret"}`
          }
        });
        await GET(dummyReq);
      } catch (e) {
        console.error("Failed to trigger whatsapp cron:", e);
      }
    });

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
      prisma.whatsAppLog.deleteMany({ where: { entryId: id } }),
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
    const entry = await prisma.entry.findUnique({ where: { id: entryId }, select: { excluded: true } });
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