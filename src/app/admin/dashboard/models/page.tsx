import { prisma } from "@/lib/prisma";
import { ModelsClient } from "@/components/admin/ModelsClient";

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const models = await prisma.model.findMany({
    include: { colours: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Models & Colours</h1>
        <p className="text-muted-foreground mt-1">
          Manage the Toyota vehicle models and colour options available on the entry form.
        </p>
      </div>

      <ModelsClient initialModels={models} />
    </div>
  );
}
