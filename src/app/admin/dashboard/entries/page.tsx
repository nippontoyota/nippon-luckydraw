import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EntriesPage() {
  const entries = await prisma.entry.findMany({
    include: {
      branch: true,
      model: true,
      colour: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">All Entries</h1>
        <p className="text-muted-foreground mt-1">View all lucky draw submissions across all branches.</p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">Submissions ({entries.length})</CardTitle>
          <FileText className="w-5 h-5 text-primary" />
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg border border-dashed border-gray-200">
              No entries have been submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Date</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Branch</th>
                    <th className="px-4 py-3 font-semibold">Vehicle & Colour</th>
                    <th className="px-4 py-3 font-semibold">VIN</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-lg">Flags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {format(entry.createdAt, "MMM d, h:mm a")}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{entry.name}</td>
                      <td className="px-4 py-3">{entry.phone}</td>
                      <td className="px-4 py-3 text-muted-foreground">{entry.branch.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {entry.model.name} - {entry.colour.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{entry.vin}</td>
                      <td className="px-4 py-3">
                        {entry.flag ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            {entry.flag}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
