"use client";

import { useState, useTransition } from "react";
import { toggleExclude } from "@/app/actions/entry";
import { Ban, CheckCircle2 } from "lucide-react";

export function ExcludeEntryButton({ id, excluded }: { id: string; excluded: boolean }) {
  const [isExcluded, setIsExcluded] = useState(excluded);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleExclude(id);
      if (res && "excluded" in res && typeof res.excluded === "boolean") {
        setIsExcluded(res.excluded);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={isExcluded ? "Put back in the draw" : "Remove from the draw"}
      className={`inline-flex min-h-8 items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-[background-color,color,border-color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15 disabled:opacity-50 ${
        isExcluded
          ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
          : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {isExcluded ? (
        <>
          <CheckCircle2 className="w-3 h-3 shrink-0" />
          Include
        </>
      ) : (
        <>
          <Ban className="w-3 h-3 shrink-0" />
          Exclude
        </>
      )}
    </button>
  );
}
