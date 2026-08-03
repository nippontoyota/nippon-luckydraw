import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/session";

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ count: 0 }, { status: 401 });
  }

  try {
    const count = await prisma.entry.count({
      where: {
        flag: { not: null },
        excluded: false,
      },
    });

    return NextResponse.json(
      { count },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ count: 0 }, { status: 503 });
  }
}
