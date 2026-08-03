"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL = 30_000;

// ponytail: desktop+mobile both mount FlagBadge — share one fetch/poll
let cachedCount = 0;
let inflight: Promise<number> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let subscribers = 0;
const listeners = new Set<(n: number) => void>();

function notify(n: number) {
  cachedCount = n;
  listeners.forEach((l) => l(n));
}

async function loadCount() {
  if (inflight) return inflight;
  inflight = fetch("/api/flags/count", { credentials: "include" })
    .then(async (res) => {
      if (!res.ok) return cachedCount;
      const data = await res.json();
      const next = data.count ?? 0;
      notify(next);
      return next;
    })
    .catch(() => cachedCount)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

function subscribe(listener: (n: number) => void) {
  listeners.add(listener);
  subscribers += 1;
  listener(cachedCount);
  void loadCount();
  if (!pollTimer) {
    pollTimer = setInterval(() => void loadCount(), POLL_INTERVAL);
  }
  return () => {
    listeners.delete(listener);
    subscribers -= 1;
    if (subscribers === 0 && pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };
}

export function FlagBadge() {
  const [count, setCount] = useState(cachedCount);

  useEffect(() => subscribe(setCount), []);

  if (count === 0) return null;

  return (
    <span
      className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[10px] font-bold bg-red-500 text-white leading-none"
      title={`${count} flagged entries`}
      aria-label={`${count} flagged entries`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
