"use client";

import { useState, useTransition } from "react";
import { toggleExclude } from "@/app/actions/entry";
import { EyeOff, Eye } from "lucide-react";

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
      onClick={handleToggle}
      disabled={isPending}
      title={isExcluded ? "Re-include in draw" : "Exclude from draw"}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all disabled:opacity-50 ${
        isExcluded
          ? "bg-gray-100 text-gray-500 hover:bg-orange-100 hover:text-orange-700"
          : "bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-700 border border-gray-200"
      }`}
    >
      {isExcluded ? (
        <><EyeOff className="w-3 h-3" /> Excluded</>
      ) : (
        <><Eye className="w-3 h-3" /> Exclude</>
      )}
    </button>
  );
}
