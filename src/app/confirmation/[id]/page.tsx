import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConfirmationScreen } from "@/components/forms/ConfirmationScreen";

export default async function ConfirmationPage(
  props: {
    params: Promise<{ id: string }>
  }
) {
  const params = await props.params;
  const entry = await prisma.entry.findUnique({
    where: { id: params.id },
    include: {
      branch: true,
      model: true,
      colour: true,
    }
  });

  if (!entry) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-cover bg-center py-10 px-4 flex flex-col items-center justify-center" style={{ backgroundImage: "url('/festive-bg.jpg')" }}>
      {/* Fallback pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-100 -z-10" />
      
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Header/Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="text-primary font-black text-4xl tracking-tighter mb-2 drop-shadow-md">NIPPON TOYOTA</div>
          <div className="text-secondary font-semibold text-lg tracking-wide uppercase bg-secondary/10 px-3 py-1 rounded-full">Onam Lucky Draw</div>
        </div>

        <ConfirmationScreen 
          entryId={entry.id} 
          name={entry.name} 
          branchName={entry.branch.name}
          modelName={entry.model.name}
          colourName={entry.colour.name}
          vin={entry.vin}
        />
      </div>
    </main>
  );
}
