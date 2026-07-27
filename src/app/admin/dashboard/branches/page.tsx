import { prisma } from "@/lib/prisma";
import { BranchesClient } from "@/components/admin/BranchesClient";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  const branches = await prisma.branch.findMany({
    orderBy: { name: "asc" },
  });

  // Get the base URL from env or request headers for QR codes
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Branch Management</h1>
        <p className="text-muted-foreground mt-1">Create new branches and generate QR codes.</p>
      </div>
      
      <BranchesClient branches={branches} appUrl={appUrl} />
    </div>
  );
}
