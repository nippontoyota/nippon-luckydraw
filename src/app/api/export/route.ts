import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/session";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") ?? "entries"; // entries | winners
  const branchSlug = searchParams.get("branch") ?? undefined;

  try {
    if (type === "winners") {
      const winners = await prisma.winner.findMany({
        include: {
          entry: { include: { model: true, colour: true } },
          branch: true,
        },
        orderBy: [{ branch: { name: "asc" } }, { place: "asc" }],
      });

      const rows = winners.map((w) => ({
        Branch: w.branch.name,
        Place: w.place,
        Name: w.entry.name,
        Phone: w.entry.phone,
        Model: w.entry.model?.name ?? "—",
        Colour: w.entry.colour?.name ?? "—",
        VIN: w.entry.vin,
        "Draw Date": w.createdAt.toISOString(),
      }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Winners");
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buf, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="winners.xlsx"`,
        },
      });
    }

    const where = branchSlug ? { branch: { slug: branchSlug } } : {};

    const entries = await prisma.entry.findMany({
      where,
      include: { branch: true, model: true, colour: true },
      orderBy: [{ branch: { name: "asc" } }, { createdAt: "asc" }],
    });

    const toRow = (e: (typeof entries)[number]) => {
      let flags: string[] = [];
      try {
        flags = e.flag ? JSON.parse(e.flag) : [];
      } catch {
        flags = e.flag ? [e.flag] : [];
      }
      return {
        "Ticket ID": e.id.slice(0, 8).toUpperCase(),
        Name: e.name,
        Phone: e.phone,
        Model: e.model?.name ?? "—",
        Colour: e.colour?.name ?? "—",
        VIN: e.vin,
        Flagged: flags.join(", ") || "No",
        Excluded: e.excluded ? "Yes" : "No",
        "Created At": e.createdAt.toISOString(),
      };
    };

    // One sheet per branch so Excel opens with a tab for each showroom
    const byBranch = new Map<string, typeof entries>();
    for (const e of entries) {
      const list = byBranch.get(e.branch.name);
      if (list) list.push(e);
      else byBranch.set(e.branch.name, [e]);
    }

    const wb = XLSX.utils.book_new();
    const usedNames = new Set<string>();
    if (byBranch.size === 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([]), "Entries");
    } else {
      for (const [branchName, branchEntries] of byBranch) {
        // Excel sheet names: max 31 chars, no \ / ? * [ ]
        let sheet = branchName.replace(/[\\/?*[\]]/g, "").slice(0, 31) || "Branch";
        if (usedNames.has(sheet)) {
          let i = 2;
          while (usedNames.has(`${sheet.slice(0, 28)} ${i}`)) i++;
          sheet = `${sheet.slice(0, 28)} ${i}`;
        }
        usedNames.add(sheet);
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(branchEntries.map(toRow)),
          sheet
        );
      }
    }
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="entries.xlsx"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Database temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
}
