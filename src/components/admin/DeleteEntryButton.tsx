"use client";

import { useTransition } from "react";
import { deleteEntry } from "@/app/actions/entry";
import { Trash2 } from "lucide-react";

export function DeleteEntryButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the entry for ${name}? This action cannot be undone.`)) {
      startTransition(async () => {
        const result = await deleteEntry(id);
        if (result?.error) {
          alert(result.error);
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 disabled:opacity-50"
      title="Delete Entry"
    >
      <Trash2 className="w-4 h-4" />
      <span className="sr-only">Delete</span>
    </button>
  );
}
