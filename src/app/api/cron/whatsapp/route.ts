import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/doubletick";

// Protect the cron route with a secret key
const CRON_SECRET = process.env.CRON_SECRET || "local_dev_cron_secret";

export async function GET(request: Request) {
  // Verify authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch pending messages or failed messages with retries < 3
    const messagesToProcess = await prisma.whatsAppLog.findMany({
      where: {
        OR: [
          { status: "PENDING" },
          { status: "FAILED", retries: { lt: 3 } },
        ],
      },
      take: 20, // Process max 20 at a time to avoid Vercel function timeout
    });

    if (messagesToProcess.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: "No messages to process." });
    }

    // Manually fetch entries since there is no Prisma relation defined on WhatsAppLog
    const entryIds = messagesToProcess.map(m => m.entryId);
    const entries = await prisma.entry.findMany({
      where: { id: { in: entryIds } },
      include: { branch: true, model: true, colour: true },
    });
    
    // Create a map for quick lookup
    const entryMap = new Map(entries.map(e => [e.id, e]));

    let successCount = 0;
    let failCount = 0;

    // 2. Process each message
    for (const log of messagesToProcess) {
      try {
        const entry = entryMap.get(log.entryId);
        if (!entry) throw new Error("Associated entry not found");
        
        // Prepare variables for the template
        const variables = {
          name: entry.name,
          branchName: entry.branch.name,
          vehicle: `${entry.model.name} (${entry.colour.name})`,
          vin: entry.vin,
          confirmationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/confirmation/${entry.id}`,
        };

        await sendWhatsAppMessage(entry.phone, "luckydraw_confirmation", variables);

        // Update log on success
        await prisma.whatsAppLog.update({
          where: { id: log.id },
          data: {
            status: "SENT",
            error: null,
          },
        });
        
        successCount++;
      } catch (error: unknown) {
        // Update log on failure and increment retries
        await prisma.whatsAppLog.update({
          where: { id: log.id },
          data: {
            status: "FAILED",
            error: error instanceof Error ? error.message : "Unknown error",
            retries: { increment: 1 },
          },
        });
        
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: messagesToProcess.length,
      successCount,
      failCount,
    });
  } catch (error) {
    console.error("WhatsApp Cron Error:", error);
    return NextResponse.json({ error: "Failed to process WhatsApp queue." }, { status: 500 });
  }
}
