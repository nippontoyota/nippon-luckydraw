"use client";

import { useTransition, useState } from "react";
import { deleteEntry } from "@/app/actions/entry";
import { Trash2, AlertTriangle } from "lucide-react";

export function DeleteEntryButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteEntry(id);
      if (result?.error) {
        alert(result.error);
      } else {
        setShowModal(false);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-sm font-medium text-red-600 transition-[background-color,color,border-color,transform] duration-150 ease-out hover:border-red-100 hover:bg-red-50 hover:text-red-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 disabled:opacity-50"
        title="Delete entry"
        aria-label={`Delete entry for ${name}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-entry-title"
          onClick={() => !isPending && setShowModal(false)}
        >
          <div
            className="w-full max-w-sm space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 id="delete-entry-title" className="text-base font-semibold text-gray-900">
                Delete entry?
              </h3>
              <p className="text-sm text-gray-600">
                This permanently removes{" "}
                <span className="break-words font-semibold text-gray-900">{name}</span> from the draw.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-[background-color,transform] duration-150 ease-out hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white transition-[background-color,transform] duration-150 ease-out hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
              >
                {isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
