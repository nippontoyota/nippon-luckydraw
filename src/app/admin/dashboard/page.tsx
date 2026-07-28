import { prisma } from "@/lib/prisma";
import { DrawControls } from "@/components/admin/DrawControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage the lucky draw and select winners.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DrawControls branches={branches} />
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Lucky Winners</CardTitle>
              <div className="flex items-center gap-2">
                {winners.length > 0 && (
                  <a
                    href="/api/export?type=winners"
                    className="inline-flex items-center gap-1 h-7 px-2.5 rounded text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
                  >
                    ↓ Export
                  </a>
                )}
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              {winners.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  No winners selected yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg rounded-bl-lg">Branch</th>
                        <th className="px-4 py-3">Place</th>
                        <th className="px-4 py-3">Winner Name</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Vehicle</th>
                        <th className="px-4 py-3 rounded-tr-lg rounded-br-lg">VIN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {winners.map((winner) => (
                        <tr key={winner.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{winner.branch.name}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                              winner.place === 1 ? "bg-yellow-100 text-yellow-800" :
                              winner.place === 2 ? "bg-gray-200 text-gray-800" :
                              "bg-orange-100 text-orange-800"
                            }`}>
                              {winner.place}{winner.place === 1 ? "st" : winner.place === 2 ? "nd" : "rd"}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold">{winner.entry.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">******{winner.entry.phone.slice(-4)}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {winner.entry.model.name} ({winner.entry.colour.name})
                          </td>
                          <td className="px-4 py-3 text-xs font-mono">*************{winner.entry.vin.slice(-4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
