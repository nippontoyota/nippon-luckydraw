import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EntryForm } from "@/components/forms/EntryForm";

export const revalidate = 300; // models/branches rarely change

export default async function EnterPage(
  props: {
    params: Promise<{ branchId: string }>
  }
) {
  const params = await props.params;

  const [branch, modelsData] = await Promise.all([
    prisma.branch.findUnique({
      where: { id: params.branchId },
      select: { id: true, name: true },
    }),
    prisma.model.findMany({
      select: {
        id: true,
        name: true,
        colours: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!branch) {
    notFound();
  }

  const models = modelsData.map((m) => ({
    id: m.id,
    name: m.name,
    colours: m.colours,
  }));

  return (
    <main className="min-h-screen bg-[#fbf9f8]">
      <EntryForm branchId={branch.id} branchName={branch.name} models={models} />
    </main>
  );
}
