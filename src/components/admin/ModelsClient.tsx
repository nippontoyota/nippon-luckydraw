"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Plus, ChevronDown, ChevronRight, Check, X } from "lucide-react";
import { addModel, deleteModel, addColour, editColour, deleteColour } from "@/app/actions/models";

type Colour = { id: string; name: string; modelId: string };
type Model = { id: string; name: string; colours: Colour[] };

export function ModelsClient({ initialModels }: { initialModels: Model[] }) {
  const [models, setModels] = useState<Model[]>(initialModels);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingColourId, setEditingColourId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [addingColourToModel, setAddingColourToModel] = useState<string | null>(null);
  const [newColourName, setNewColourName] = useState("");
  const [addingModel, setAddingModel] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const refresh = () => window.location.reload();

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddModel = () => {
    if (!newModelName.trim()) return;
    const fd = new FormData();
    fd.set("name", newModelName.trim());
    startTransition(async () => {
      const res = await addModel(fd);
      if (res?.error) { setError(res.error); return; }
      setAddingModel(false);
      setNewModelName("");
      refresh();
    });
  };

  const handleDeleteModel = (id: string, name: string) => {
    if (!confirm(`Delete model "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteModel(id);
      if (res?.error) { setError(res.error); return; }
      setModels((prev) => prev.filter((m) => m.id !== id));
    });
  };

  const handleAddColour = (modelId: string) => {
    if (!newColourName.trim()) return;
    const fd = new FormData();
    fd.set("modelId", modelId);
    fd.set("name", newColourName.trim());
    startTransition(async () => {
      const res = await addColour(fd);
      if (res?.error) { setError(res.error); return; }
      setAddingColourToModel(null);
      setNewColourName("");
      refresh();
    });
  };

  const handleEditColour = (id: string) => {
    if (!editName.trim()) return;
    const fd = new FormData();
    fd.set("name", editName.trim());
    startTransition(async () => {
      const res = await editColour(id, fd);
      if (res?.error) { setError(res.error); return; }
      setEditingColourId(null);
      setEditName("");
      refresh();
    });
  };

  const handleDeleteColour = (id: string, name: string) => {
    if (!confirm(`Delete colour "${name}"?`)) return;
    startTransition(async () => {
      const res = await deleteColour(id);
      if (res?.error) { setError(res.error); return; }
      setModels((prev) =>
        prev.map((m) => ({ ...m, colours: m.colours.filter((c) => c.id !== id) }))
      );
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <X className="w-4 h-4 shrink-0" />
          {error}
          <button className="ml-auto" onClick={() => setError(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Add Model Row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{models.length} models total</p>
        {addingModel ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddModel()}
              placeholder="Model name…"
              className="h-8 text-sm px-3 rounded-md border border-input focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button onClick={handleAddModel} disabled={isPending} className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setAddingModel(false); setNewModelName(""); }} className="h-8 px-3 rounded-md border border-input text-sm hover:bg-gray-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button onClick={() => setAddingModel(true)} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
            <Plus className="w-3.5 h-3.5" /> Add Model
          </button>
        )}
      </div>

      {/* Models List */}
      <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm">
        {models.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">No models yet. Add one above.</div>
        )}
        {models.map((model) => {
          const isExpanded = expandedIds.has(model.id);
          return (
            <div key={model.id}>
              {/* Model Row */}
              <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/80 group cursor-pointer" onClick={() => toggleExpand(model.id)}>
                <button className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <span className="font-semibold text-gray-900 flex-1">{model.name}</span>
                <span className="text-xs text-muted-foreground">{model.colours.length} colours</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteModel(model.id, model.name); }}
                  disabled={isPending}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-red-100 text-red-500 hover:text-red-700 disabled:opacity-30"
                  title="Delete model"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Colours sub-list */}
              {isExpanded && (
                <div className="bg-gray-50/50 border-t border-gray-100 px-5 py-2 space-y-1">
                  {model.colours.map((colour) => (
                    <div key={colour.id} className="flex items-center gap-2 py-1.5 group/colour">
                      {editingColourId === colour.id ? (
                        <>
                          <input
                            autoFocus
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleEditColour(colour.id)}
                            className="flex-1 h-7 text-sm px-2 rounded border border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button onClick={() => handleEditColour(colour.id)} disabled={isPending} className="p-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingColourId(null)} className="p-1 rounded border border-input hover:bg-gray-100">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-gray-300 shrink-0" />
                          <span className="flex-1 text-sm text-gray-700">{colour.name}</span>
                          <div className="flex gap-1 opacity-0 group-hover/colour:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setEditingColourId(colour.id); setEditName(colour.name); }}
                              className="p-1 rounded hover:bg-gray-200 text-gray-500"
                              title="Edit colour"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteColour(colour.id, colour.name)}
                              disabled={isPending}
                              className="p-1 rounded hover:bg-red-100 text-red-500 disabled:opacity-30"
                              title="Delete colour"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add Colour Row */}
                  {addingColourToModel === model.id ? (
                    <div className="flex items-center gap-2 py-1.5">
                      <span className="w-2.5 h-2.5 shrink-0" />
                      <input
                        autoFocus
                        type="text"
                        value={newColourName}
                        onChange={(e) => setNewColourName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddColour(model.id)}
                        placeholder="New colour name…"
                        className="flex-1 h-7 text-sm px-2 rounded border border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button onClick={() => handleAddColour(model.id)} disabled={isPending} className="p-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setAddingColourToModel(null); setNewColourName(""); }} className="p-1 rounded border border-input hover:bg-gray-100">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingColourToModel(model.id); setNewColourName(""); }}
                      className="flex items-center gap-1.5 py-1.5 text-xs text-primary hover:underline"
                    >
                      <Plus className="w-3 h-3" /> Add colour
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
