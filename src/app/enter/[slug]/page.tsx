import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EntryForm } from "@/components/forms/EntryForm";

export const revalidate = 60; // Cache this page for 60 seconds (ISR)

export default async function EnterPage(
  props: {
    params: Promise<{ slug: string }>
  }
) {
  const params = await props.params;
  
  // Parallelize DB queries
  const [branch, modelsData] = await Promise.all([
    prisma.branch.findUnique({
      where: { slug: params.slug },
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
    <main className="min-h-screen bg-cover bg-center py-10 px-4" style={{ backgroundImage: "url('/festive-bg.jpg')" }}>
      {/* Fallback pattern if image is missing */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-100 -z-10" />
      
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Header/Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="text-primary font-black text-4xl tracking-tighter mb-2 drop-shadow-md">NIPPON TOYOTA</div>
          <div className="text-secondary font-semibold text-lg tracking-wide uppercase bg-secondary/10 px-3 py-1 rounded-full">Onam Lucky Draw</div>
        </div>

        <EntryForm slug={params.slug} branchName={branch.name} models={models} />
      </div>
    </main>
  );
}
