"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Store } from "lucide-react";

export type EntriesSortValue = "" | "date_desc" | "date_asc";

const OPTIONS: {
  value: EntriesSortValue;
  label: string;
  shortLabel: string;
  icon: typeof Store;
}[] = [
  { value: "", label: "By branch", shortLabel: "Branch", icon: Store },
  { value: "date_desc", label: "Newest first", shortLabel: "Newest", icon: ArrowDownWideNarrow },
  { value: "date_asc", label: "Oldest first", shortLabel: "Oldest", icon: ArrowUpWideNarrow },
];

export function EntriesSort({ initialSort }: { initialSort: EntriesSortValue }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState<EntriesSortValue>(initialSort);

  useEffect(() => {
    setValue(initialSort);
  }, [initialSort]);

  function select(sortValue: EntriesSortValue) {
    if (sortValue === value) return;
    setValue(sortValue);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (sortValue) params.set("sort", sortValue);
    else params.delete("sort");

    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  }

  return (
    <div
      role="group"
      aria-label="Sort entries"
      aria-busy={isPending}
      className={`inline-flex h-9 items-center rounded-lg border border-gray-200 bg-gray-100/80 p-0.5 shadow-sm transition-opacity duration-150 ${
        isPending ? "opacity-70" : "opacity-100"
      }`}
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = value === option.value;
        return (
          <button
            key={option.value || "branch"}
            type="button"
            onClick={() => select(option.value)}
            disabled={isPending}
            aria-pressed={selected}
            title={option.label}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-[color,background-color,transform,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15 disabled:cursor-wait active:scale-[0.97] ${
              selected
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden">{option.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
