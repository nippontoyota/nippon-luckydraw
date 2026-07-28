import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { DeleteEntryButton } from "@/components/admin/DeleteEntryButton";

export const dynamic = "force-dynamic";

export default async function EntriesPage(props: { searchParams?: Promise<{ search?: string }> }) {
  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";

  const whereClause = search
    ? {
        OR: [
          { id: { startsWith: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
          { vin: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [branches, entries] = await Promise.all([
    prisma.branch.findMany({ orderBy: { name: "asc" } }),
    prisma.entry.findMany({
      where: whereClause,
      include: {
        branch: true,
        model: true,
        colour: true,
      },
      orderBy: { createdAt: "desc" },
    })
  ]);

  // Group entries by branch
  // If searching, only show branches that have matching results
  const groups = branches
    .map((branch) => ({
      branch,
      entries: entries.filter((e) => e.branchId === branch.id),
    }))
    .filter((group) => search === "" || group.entries.length > 0);

  return (
    <div className="space-y-10 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">All Entries</h1>
        <p className="text-muted-foreground mt-1">View all lucky draw submissions grouped by branch.</p>
        
        <form method="GET" className="flex items-center gap-2 mt-4 max-w-lg">
          <input 
            type="text" 
            name="search"
            defaultValue={search}
            placeholder="Search by Ticket ID, Name, Phone, or VIN..."
            className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
          <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            Search
          </button>
          {search && (
            <a href="/admin/dashboard/entries" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary border border-input bg-white hover:bg-gray-100 hover:text-gray-900 h-9 px-4 py-2">
              Clear
            </a>
          )}
        </form>
      </div>

      {groups.length === 0 && search && (
        <div className="text-center py-16 text-muted-foreground bg-white rounded-xl border border-gray-200 shadow-sm">
          No entries found matching "{search}".
        </div>
      )}

      <div className="space-y-12">
        {groups.map((group) => (
          <div key={group.branch.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">{group.branch.name}</h2>
              <span className="mt-2 sm:mt-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                {group.entries.length} {group.entries.length === 1 ? "Entry" : "Entries"}
              </span>
            </div>
            
            {group.entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No entries have been submitted for this branch yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[11px] text-muted-foreground uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Ticket ID</th>
                      <th className="px-5 py-3 font-semibold">Date</th>
                      <th className="px-5 py-3 font-semibold">Name</th>
                      <th className="px-5 py-3 font-semibold">Phone</th>
                      <th className="px-5 py-3 font-semibold">Vehicle & Colour</th>
                      <th className="px-5 py-3 font-semibold">VIN</th>
                      <th className="px-5 py-3 font-semibold">Flags</th>
                      <th className="px-5 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {group.entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-amber-700 whitespace-nowrap">
                          {entry.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap text-xs">
                          {format(entry.createdAt, "MMM d, h:mm a")}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-gray-900">{entry.name}</td>
                        <td className="px-5 py-3.5 text-gray-600">{entry.phone}</td>
                        <td className="px-5 py-3.5 text-gray-600">
                          {entry.model.name} <span className="text-gray-400 mx-1">&middot;</span> {entry.colour.name}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-gray-500">{entry.vin}</td>
                        <td className="px-5 py-3.5">
                          {entry.flag ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase tracking-wide">
                              {entry.flag}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <DeleteEntryButton id={entry.id} name={entry.name} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
