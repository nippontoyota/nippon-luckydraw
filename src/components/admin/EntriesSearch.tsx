"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Search, X } from "lucide-react";

export function EntriesSearch({ initialSearch }: { initialSearch: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [value, setValue] = useState(initialSearch);
  const [debouncedValue] = useDebounce(value, 300);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedValue) {
      params.set("search", debouncedValue);
      params.delete("page");
    } else {
      params.delete("search");
    }

    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  }, [debouncedValue, router, searchParams]);

  return (
    <div className="relative w-full">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search name, phone, ticket, or VIN"
        aria-label="Search entries"
        className="flex h-9 w-full rounded-lg border border-gray-200 bg-white py-1 pl-9 pr-9 text-sm shadow-sm transition-[border-color,box-shadow] duration-150 placeholder:text-gray-400 focus-visible:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/10"
      />
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden>
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />
        </div>
      )}
      {value && !isPending && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-[color,transform] duration-150 ease-out hover:text-gray-700 active:scale-95"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
