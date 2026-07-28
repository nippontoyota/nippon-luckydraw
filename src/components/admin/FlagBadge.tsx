"use client";

import { useEffect, useState, useCallback } from "react";

// Poll every 30 seconds for new flagged entries
const POLL_INTERVAL = 30_000;

export function FlagBadge() {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/flags/count", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCount(data.count ?? 0);
      }
    } catch {
      // Silently fail — badge just stays at 0
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchCount]);

  if (count === 0) return null;

  return (
    <span className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-red-500 text-white leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}
