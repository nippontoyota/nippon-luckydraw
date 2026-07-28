"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { useDebounce } from "use-debounce";

export function EntriesSearch({ initialSearch }: { initialSearch: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [value, setValue] = useState(initialSearch);
  const [debouncedValue] = useDebounce(value, 300);

  useEffect(() => {
    // When the debounced value changes, update the URL
    // But don't do it if it's the very first render and equal to initialSearch
    // Wait, it's fine to do it, it's idempotent.
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedValue) {
      params.set("search", debouncedValue);
    } else {
      params.delete("search");
    }

    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  }, [debouncedValue, router, searchParams]);

  return (
    <div className="flex items-center gap-2 mt-4 max-w-lg relative">
      <input 
        type="text" 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by Ticket ID, Name, Phone, or VIN..."
        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary pr-8"
      />
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 rounded-full border-2 border-gray-200 border-t-primary animate-spin" />
        </div>
      )}
      
      {/* We can hide the Search/Clear buttons since it's search-as-you-type, or keep Clear */}
      {value && !isPending && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          title="Clear search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      )}
    </div>
  );
}
