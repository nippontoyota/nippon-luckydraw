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
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 disabled:opacity-50"
        title="Delete Entry"
      >
        <Trash2 className="w-4 h-4" />
        <span className="sr-only">Delete</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div 
            className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Entry</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete the entry for <span className="font-semibold text-gray-900">{name}</span>? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 disabled:opacity-50 transition-colors"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
