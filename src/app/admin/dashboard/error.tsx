"use client";

import { useEffect, useRef } from "react";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const tried = useRef(false);

  // one auto-retry after short wait — catches leftovers after Prisma cold-connect flake
  useEffect(() => {
    if (tried.current) return;
    const key = `admin-db-retry:${error.digest ?? "unknown"}`;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(key)) {
      return;
    }
    tried.current = true;
    try {
      sessionStorage.setItem(key, "1");
    } catch {
      // private mode / blocked storage
    }
    const t = setTimeout(() => reset(), 700);
    return () => clearTimeout(t);
  }, [error.digest, reset]);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">This page couldn&apos;t load</p>
        <p className="mt-2 text-sm text-gray-600">
          The database may be temporarily unavailable. Wait a moment and try again.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-gray-400 font-mono">Error ID: {error.digest}</p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Reload
        </button>
      </div>
    </div>
  );
}
