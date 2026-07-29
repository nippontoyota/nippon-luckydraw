import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { DeleteEntryButton } from "@/components/admin/DeleteEntryButton";
import { ExcludeEntryButton } from "@/components/admin/ExcludeEntryButton";
import { EntriesSearch } from "@/components/admin/EntriesSearch";

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
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Entries</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and export lucky draw submissions.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:w-72">
            <EntriesSearch initialSearch={search} />
          </div>
          <a
            href="/api/export?type=entries"
            className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-sm font-medium transition-colors shadow-sm shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export
          </a>
        </div>
      </div>

      {groups.length === 0 && search && (
        <div className="text-center py-16 text-sm text-gray-500 bg-gray-50/50 rounded-lg border border-gray-200 border-dashed">
          No entries found matching "{search}".
        </div>
      )}

      {groups.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white shadow-sm relative">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
            <thead className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-200 text-gray-500 font-medium text-xs sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 font-medium">Participant</th>
                <th className="px-5 py-3 font-medium">Ticket & Date</th>
                <th className="px-5 py-3 font-medium">Vehicle & VIN</th>
                <th className="px-5 py-3 font-medium">Flags</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            {groups.map((group) => (
              <tbody key={group.branch.id} className="group/branch divide-y divide-gray-100">
                <tr className="bg-gray-50/50">
                  <td colSpan={6} className="px-5 py-2.5 text-xs font-semibold text-gray-900 border-t border-gray-200 group-first/branch:border-t-0">
                    {group.branch.name} <span className="text-gray-500 font-normal ml-2">{group.entries.length} {group.entries.length === 1 ? "entry" : "entries"}</span>
                  </td>
                </tr>
                {group.entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-500">
                      No entries have been submitted for this branch yet.
                    </td>
                  </tr>
                ) : (
                  group.entries.map((entry) => (
                    <tr 
                      key={entry.id} 
                      className={`group/row transition-colors hover:bg-gray-50/50 ${entry.excluded ? "bg-gray-50/30 opacity-75 grayscale-[0.2]" : "bg-white"}`}
                    >
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-900">{entry.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{entry.phone}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-mono text-xs text-gray-900">{entry.id.slice(0, 8).toUpperCase()}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{format(entry.createdAt, "MMM d, h:mm a")}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-gray-900">{entry.model.name} <span className="text-gray-400 mx-1">&middot;</span> {entry.colour.name}</div>
                        <div className="font-mono text-xs text-gray-500 mt-0.5" title="VIN">{entry.vin}</div>
                      </td>
                      <td className="px-5 py-3">
                        {entry.flag ? (() => {
                          let flags: string[] = [];
                          try {
                            const parsed = JSON.parse(entry.flag);
                            flags = Array.isArray(parsed) ? parsed : [String(parsed)];
                          } catch {
                            flags = [entry.flag];
                          }
                          return (
                            <div className="flex flex-wrap gap-1">
                              {flags.map((f) => (
                                <span key={f} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-100/50">
                                  {f.replace(/_/g, " ")}
                                </span>
                              ))}
                            </div>
                          );
                        })() : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {entry.excluded ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200/50">
                            Excluded
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 focus-within:opacity-100 transition-opacity">
                          <ExcludeEntryButton id={entry.id} excluded={entry.excluded} />
                          <DeleteEntryButton id={entry.id} name={entry.name} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            ))}
          </table>
        </div>
      )}
    </div>
  );
}
