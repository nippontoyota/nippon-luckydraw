import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EntryForm } from "@/components/forms/EntryForm";

export const revalidate = 60; // Cache this page for 60 seconds (ISR)

export default async function EnterPage(
  props: {
    params: Promise<{ branchId: string }>
  }
) {
  const params = await props.params;
  
  // Parallelize DB queries
  const [branch, modelsData] = await Promise.all([
    prisma.branch.findUnique({
      where: { id: params.branchId },
    }),
    prisma.model.findMany({
      include: {
        colours: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  if (!branch) {
    notFound();
  }

  const models = modelsData.map((m) => ({
    id: m.id,
    name: m.name,
    colours: m.colours.map((c) => ({ id: c.id, name: c.name })),
  }));

  return (
    <main className="min-h-screen bg-[#fbf9f8]">
      <EntryForm branchId={branch.id} branchName={branch.name} models={models} />
    </main>
  );
}
