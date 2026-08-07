import { prisma } from "@/lib/prisma";
import { BranchesClient } from "@/components/admin/BranchesClient";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  const branches = await prisma.branch.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { entries: true },
      },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="space-y-5">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Branches</h1>
        <p className="mt-1 max-w-xl text-sm text-gray-600">
          Create dealership locations, then print or share each branch QR code for walk-in entries.
        </p>
      </div>

      <BranchesClient branches={branches} appUrl={appUrl} />
    </div>
  );
}
