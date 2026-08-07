import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { DeleteEntryButton } from "@/components/admin/DeleteEntryButton";
import { ExcludeEntryButton } from "@/components/admin/ExcludeEntryButton";
import { EntriesSearch } from "@/components/admin/EntriesSearch";
import { EntriesSort, type EntriesSortValue } from "@/components/admin/EntriesSort";
import { Download, ChevronLeft, ChevronRight, Store } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

function parseFlags(flag: string | null): string[] {
  if (!flag) return [];
  try {
    const parsed = JSON.parse(flag);
    return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
  } catch {
    return [flag];
  }
}

function parseSort(raw: string | undefined): EntriesSortValue {
  if (raw === "date_asc" || raw === "date_desc") return raw;
  return "";
}

type EntryRow = {
  id: string;
  name: string;
  phone: string;
  vin: string;
  flag: string | null;
  excluded: boolean;
  createdAt: Date;
  branchId: string;
  branch: { id: string; name: string };
  model: { name: string } | null;
  colour: { name: string } | null;
};

function EntryTableRow({
  entry,
  showBranch,
  indented,
}: {
  entry: EntryRow;
  showBranch: boolean;
  indented: boolean;
}) {
  const flags = parseFlags(entry.flag);
  return (
    <tr
      className={`transition-colors duration-150 ease-out hover:bg-gray-50/90 ${
        entry.excluded ? "bg-gray-50/70" : "bg-white"
      }`}
    >
      <td
        className={`min-w-0 max-w-[180px] py-3 pr-4 ${
          indented ? "border-l-2 border-l-slate-200 pl-6" : "pl-4"
        }`}
      >
        <div
          className={`truncate font-medium ${entry.excluded ? "text-gray-500" : "text-gray-900"}`}
          title={entry.name}
        >
          {entry.name}
        </div>
        <div className="mt-0.5 truncate text-xs text-gray-500">{entry.phone}</div>
      </td>
      {showBranch && (
        <td className="max-w-[120px] px-3 py-3">
          <span
            className="block truncate text-xs font-medium text-gray-600"
            title={entry.branch.name}
          >
            {entry.branch.name}
          </span>
        </td>
      )}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="font-mono text-xs text-gray-900">
          {entry.id.slice(0, 8).toUpperCase()}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {format(entry.createdAt, "MMM d, h:mm a")}
        </div>
      </td>
      <td className="px-4 py-3 min-w-0 max-w-[200px]">
        <div
          className="text-gray-900 truncate"
          title={`${entry.model?.name ?? "—"} · ${entry.colour?.name ?? "—"}`}
        >
          {entry.model?.name ?? "—"}
          <span className="text-gray-400 mx-1">·</span>
          {entry.colour?.name ?? "—"}
        </div>
        <div className="font-mono text-xs text-gray-500 mt-0.5 truncate" title={entry.vin}>
          {entry.vin}
        </div>
      </td>
      <td className="px-4 py-3">
        {flags.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-[160px]">
            {flags.map((f) => (
              <span
                key={f}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-100 capitalize"
                title={f.replace(/_/g, " ")}
              >
                {f.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {entry.excluded ? (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
            Excluded
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            In draw
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1.5">
          <ExcludeEntryButton id={entry.id} excluded={entry.excluded} />
          <DeleteEntryButton id={entry.id} name={entry.name} />
        </div>
      </td>
    </tr>
  );
}

export default async function EntriesPage(props: {
  searchParams?: Promise<{ search?: string; page?: string; sort?: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
  const sort = parseSort(searchParams?.sort);
  const isSorted = sort !== "";

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

  // Flagged count lives on FlagBadge; branch names come from the entry join (one less query)
  const [entries, totalEntries] = await Promise.all([
    prisma.entry.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        phone: true,
        vin: true,
        flag: true,
        excluded: true,
        createdAt: true,
        branchId: true,
        branch: { select: { id: true, name: true } },
        model: { select: { name: true } },
        colour: { select: { name: true } },
      },
      orderBy: { createdAt: sort === "date_asc" ? "asc" : "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.entry.count({ where: whereClause }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const hasEntries = entries.length > 0;

  const groups = (() => {
    if (isSorted) return null;
    const groupMap = new Map<string, { branch: { id: string; name: string }; entries: EntryRow[] }>();
    for (const entry of entries) {
      const g = groupMap.get(entry.branchId);
      if (g) g.entries.push(entry);
      else groupMap.set(entry.branchId, { branch: entry.branch, entries: [entry] });
    }
    return [...groupMap.values()];
  })();

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    return `?${params.toString()}`;
  };

  const colCount = isSorted ? 7 : 6;

  const pagerBtn =
    "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97]";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Entries</h1>
          <p className="mt-1 max-w-xl text-sm text-gray-600">
            Review submissions, exclude fraud suspects from the draw, or delete invalid entries.
          </p>
        </div>
        <a
          href="/api/export?type=entries"
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-800 transition-[background-color,transform] duration-150 ease-out hover:bg-gray-50 active:scale-[0.97]"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:gap-3 sm:p-3.5">
        <div className="min-w-0 flex-1 sm:max-w-md">
          <EntriesSearch initialSearch={search} />
        </div>
        <EntriesSort initialSort={sort} />
        <div className="flex items-center gap-2 sm:ml-auto sm:pl-2">
          {isSorted && (
            <span className="hidden rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-600 sm:inline-flex">
              {sort === "date_asc" ? "Oldest → newest" : "Newest → oldest"}
            </span>
          )}
          <p className="shrink-0 text-sm tabular-nums text-gray-500">
            {totalEntries} {totalEntries === 1 ? "entry" : "entries"}
            {search ? " matching" : ""}
          </p>
        </div>
      </div>

      {!hasEntries && search && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-14 text-center text-sm text-gray-600">
          No entries match &quot;{search}&quot;.
        </div>
      )}

      {!hasEntries && !search && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-14 text-center">
          <p className="text-sm font-medium text-gray-900">No entries yet</p>
          <p className="mt-1 text-sm text-gray-600">
            Entries appear here when customers submit the lucky draw form.
          </p>
        </div>
      )}

      {hasEntries && isSorted && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Participant</th>
                  <th className="px-3 py-3 font-medium">Branch</th>
                  <th className="px-4 py-3 font-medium">Ticket</th>
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Flags</th>
                  <th className="px-4 py-3 font-medium">Draw status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((entry) => (
                  <EntryTableRow key={entry.id} entry={entry} showBranch indented={false} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hasEntries && groups && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Participant</th>
                  <th className="px-4 py-3 font-medium">Ticket</th>
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Flags</th>
                  <th className="px-4 py-3 font-medium">Draw status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              {groups.map((group, groupIndex) => (
                <tbody key={group.branch.id} className="divide-y divide-gray-100">
                  <tr className="bg-slate-50">
                    <td
                      colSpan={colCount}
                      className={`px-4 py-3 ${
                        groupIndex > 0 ? "border-t-4 border-t-slate-100" : ""
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-white">
                          <Store className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <div className="flex min-w-0 flex-wrap items-baseline gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Branch
                          </span>
                          <span className="truncate text-sm font-semibold text-slate-900">
                            {group.branch.name}
                          </span>
                          <span className="inline-flex items-center rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-slate-600">
                            {group.entries.length}{" "}
                            {group.entries.length === 1 ? "entry" : "entries"}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                  {group.entries.length === 0 ? (
                    <tr>
                      <td colSpan={colCount} className="px-4 py-8 text-center text-sm text-gray-500">
                        No entries for this branch yet.
                      </td>
                    </tr>
                  ) : (
                    group.entries.map((entry) => (
                      <EntryTableRow
                        key={entry.id}
                        entry={entry}
                        showBranch={false}
                        indented
                      />
                    ))
                  )}
                </tbody>
              ))}
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {page > 1 ? (
            <a
              href={pageHref(page - 1)}
              className={`${pagerBtn} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </a>
          ) : (
            <span
              className={`${pagerBtn} cursor-not-allowed border border-gray-100 bg-white text-gray-300`}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </span>
          )}
          <span className="px-2 text-sm tabular-nums text-gray-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <a
              href={pageHref(page + 1)}
              className={`${pagerBtn} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </a>
          ) : (
            <span
              className={`${pagerBtn} cursor-not-allowed border border-gray-100 bg-white text-gray-300`}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
