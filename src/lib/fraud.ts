import { prisma } from "@/lib/prisma";
import type { EntryInput } from "@/schemas/entry";

export enum FraudFlag {
  MULTI_BRANCH_PHONE = "MULTI_BRANCH_PHONE",
  SUSPICIOUS_NAME = "SUSPICIOUS_NAME",
  MULTI_PHONE_DEVICE = "MULTI_PHONE_DEVICE",
  SUSPICIOUS_VIN = "SUSPICIOUS_VIN",
}

export async function assessEntry(data: EntryInput, ip: string, branchId: string): Promise<FraudFlag[]> {
  const flags: FraudFlag[] = [];
  const normalizedPhone = `+91${data.phone}`;

  // 1. MULTI_BRANCH_PHONE: Same phone submitted to different branch in last 5 mins
  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recentPhoneEntries = await prisma.entry.findMany({
    where: {
      phone: normalizedPhone,
      createdAt: { gte: fiveMinsAgo },
    },
  });
  if (recentPhoneEntries.some((e) => e.branchId !== branchId)) {
    flags.push(FraudFlag.MULTI_BRANCH_PHONE);
  }

  // 2. SUSPICIOUS_NAME: Check for common test strings
  const lowerName = data.name.toLowerCase();
  const testNames = ["test", "asdf", "demo", "dummy", "fake", "unknown"];
  if (testNames.some((t) => lowerName.includes(t)) || lowerName.length < 3) {
    flags.push(FraudFlag.SUSPICIOUS_NAME);
  }

  // 3. MULTI_PHONE_DEVICE: Same IP submitted > 2 different phones in last 2 mins
  const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);
  const recentIpEntries = await prisma.entry.findMany({
    where: {
      ip,
      createdAt: { gte: twoMinsAgo },
    },
  });
  const uniquePhonesFromIp = new Set(recentIpEntries.map((e) => e.phone));
  if (uniquePhonesFromIp.size >= 2 && !uniquePhonesFromIp.has(normalizedPhone)) {
    flags.push(FraudFlag.MULTI_PHONE_DEVICE);
  }

  // 4. SUSPICIOUS_VIN: Repeated characters or sequential patterns
  const vin = data.vin.toUpperCase();
  const hasRepeatedSequence = /(.)\1{4,}/.test(vin); // 5 or more of the same char
  if (hasRepeatedSequence) {
    flags.push(FraudFlag.SUSPICIOUS_VIN);
  }

  return flags;
}
