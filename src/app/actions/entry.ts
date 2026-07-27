"use server";

import { entrySchema, type EntryInput } from "@/schemas/entry";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { assessEntry } from "@/lib/fraud";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisIncr(key: string): Promise<number> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    console.warn("Upstash Redis not configured. Skipping rate limit.");
    return 1;
  }
  const res = await fetch(`${UPSTASH_URL}/incr/${key}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  const data = await res.json();
  return data.result;
}

async function redisExpire(key: string, ttlSeconds: number) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  await fetch(`${UPSTASH_URL}/expire/${key}/${ttlSeconds}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
}

async function checkRateLimit(ip: string, phone: string) {
  try {
    // Check IP (5 requests / 1 min)
    const ipKey = `rate:ip:${ip}`;
    const ipCount = await redisIncr(ipKey);
    if (ipCount === 1) await redisExpire(ipKey, 60);

    // Check Phone (1 request / 10 min)
    const phoneKey = `rate:phone:${phone}`;
    const phoneCount = await redisIncr(phoneKey);
    if (phoneCount === 1) await redisExpire(phoneKey, 10 * 60);

    if (ipCount > 5) return { error: "Too many requests from this IP. Please try again later." };
    if (phoneCount > 1) return { error: "Too many requests for this phone number." };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open if Redis is down
  }
  
  return null;
}

export async function submitEntry(data: EntryInput) {
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown";
  const userAgent = reqHeaders.get("user-agent") || "unknown";

  // 1. Validation
  const validated = entrySchema.safeParse(data);
  if (!validated.success) {
    return { error: "Invalid data provided." };
  }

  const { name, phone, modelId, colourId, vin, slug, honeypot } = validated.data;

  // 2. Honeypot check
  if (honeypot) {
    return { error: "Spam detected." };
  }

  // 3. Rate Limiting Check
  const rateLimitError = checkRateLimit(ip, phone);
  if (rateLimitError) {
    return rateLimitError;
  }

  try {
    // 4 & 5. Global Uniqueness & Branch Lookup (Parallel)
    const [branch, existingEntry] = await Promise.all([
      prisma.branch.findUnique({ where: { slug } }),
      prisma.entry.findFirst({
        where: {
          OR: [{ phone }, { vin }],
        },
      }),
    ]);

    if (!branch) {
      return { error: "Invalid branch selected." };
    }

    if (existingEntry) {
      if (existingEntry.phone === phone) {
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
          phone,
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

      // Queue WhatsApp message
      await tx.whatsAppLog.create({
        data: {
          status: "PENDING",
          entryId: newEntry.id,
        },
      });

      return newEntry;
    });

    return { id: entry.id };
  } catch (error) {
    console.error("Submission error:", error);
    return { error: "Failed to submit entry. Please try again later." };
  }
}
