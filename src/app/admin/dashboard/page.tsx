import { prisma } from "@/lib/prisma";
import { BranchDrawCard } from "@/components/admin/BranchDrawCard";
import { Trophy } from "lucide-react";

export default async function AdminDashboardPage() {
  const branches = await prisma.branch.findMany({
    orderBy: { name: "asc" },
  });

  const winners = await prisma.winner.findMany({
    include: {
      entry: {
        include: { model: true, colour: true },
      },
      branch: true,
    },
    orderBy: [
      { branch: { name: "asc" } },
      { place: "asc" },
    ],
  });

  // Group winners by branch ID
  const winnersByBranch = winners.reduce((acc, winner) => {
    if (!acc[winner.branchId]) {
      acc[winner.branchId] = [];
    }
    acc[winner.branchId].push(winner);
    return acc;
  }, {} as Record<string, typeof winners>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Draw Winners</h1>
          <p className="text-muted-foreground mt-1">Manage the lucky draw and select winners by branch.</p>
        </div>
        {winners.length > 0 && (
          <a
            href="/api/export?type=winners"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-semibold bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors shadow-sm"
          >
            ↓ Export All Winners
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {branches.map((branch) => (
          <BranchDrawCard
            key={branch.id}
            branch={branch}
            winners={winnersByBranch[branch.id] || []}
          />
        ))}
      </div>
    </div>
  );
}
