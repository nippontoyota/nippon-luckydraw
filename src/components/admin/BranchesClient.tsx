"use client";

import { useState, useRef } from "react";
import { createBranch, deleteBranch, deleteBranches } from "@/app/actions/admin";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Plus, Trash2, MapPin, Link as LinkIcon, Users, AlertTriangle, Download, Check, X, CheckSquare, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Branch {
  id: string;
  name: string;
  location: string | null;
  slug: string;
  _count?: {
    entries: number;
  };
}

export function BranchesClient({ branches, appUrl }: { branches: Branch[], appUrl: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const submittingRef = useRef(false);
  
  // Selection state
  const [selectedBranchIds, setSelectedBranchIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  
  const [qrModal, setQrModal] = useState<{ isOpen: boolean; url: string; dataUrl: string; branchName: string }>({
    isOpen: false,
    url: "",
    dataUrl: "",
    branchName: "",
  });

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; branch: Branch | null }>({
    isOpen: false,
    branch: null,
  });
  
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleCreate = async (formData: FormData) => {
    if (submittingRef.current) return;
    
    submittingRef.current = true;
    setLoading(true);
    setSuccess(false);
    
    try {
      const result = await createBranch(formData);
      
      if (result?.error) {
        alert(result.error);
      } else {
        setSuccess(true);
        const form = document.getElementById("create-branch-form") as HTMLFormElement;
        if (form) form.reset();
        setTimeout(() => setSuccess(false), 2500);
      }
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleDelete = async () => {
    const branch = deleteModal.branch;
    if (!branch || deletingId) return;

    setDeletingId(branch.id);
    try {
      const result = await deleteBranch(branch.id);
      if (result?.error) {
        alert(result.error);
      } else {
        setDeleteModal({ isOpen: false, branch: null });
        setDeleteConfirmText("");
        // Remove from selection if deleted
        const newSelection = new Set(selectedBranchIds);
        newSelection.delete(branch.id);
        setSelectedBranchIds(newSelection);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBranchIds.size === 0 || bulkDeleting) return;

    setBulkDeleting(true);
    try {
      const result = await deleteBranches(Array.from(selectedBranchIds));
      if (result?.error) {
        alert(result.error);
      } else {
        setBulkDeleteModal(false);
        setDeleteConfirmText("");
        setSelectedBranchIds(new Set());
      }
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelection = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = new Set(selectedBranchIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedBranchIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedBranchIds.size === branches.length) {
      setSelectedBranchIds(new Set());
    } else {
      setSelectedBranchIds(new Set(branches.map(b => b.id)));
    }
  };

  const showQrCode = async (branch: Branch, e: React.MouseEvent) => {
    e.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : appUrl;
    const url = `${origin}/enter/${branch.id}`;
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      setQrModal({ isOpen: true, url, dataUrl, branchName: branch.name });
    } catch (err) {
      console.error(err);
      alert("Failed to generate QR code");
    }
  };

  const openDeleteModal = (branch: Branch, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmText("");
    setDeleteModal({ isOpen: true, branch });
  };

  const openBulkDeleteModal = () => {
    setDeleteConfirmText("");
    setBulkDeleteModal(true);
  };

  // Single delete computation
  const entriesCount = deleteModal.branch?._count?.entries || 0;
  const isDeleteButtonDisabled = entriesCount > 0 && deleteConfirmText !== "delete this branch";

  // Bulk delete computation
  const branchesToDelete = branches.filter(b => selectedBranchIds.has(b.id));
  const bulkEntriesCount = branchesToDelete.reduce((sum, b) => sum + (b._count?.entries || 0), 0);
  const isBulkDeleteButtonDisabled = bulkEntriesCount > 0 && deleteConfirmText !== "delete these branches";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative pb-20 lg:pb-0">
      {/* Branches List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Active Branches</h2>
            {branches.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSelectAll}
                className="text-gray-500 hover:text-gray-900 px-2 h-8 font-semibold text-xs transition-colors"
              >
                {selectedBranchIds.size === branches.length ? "Deselect All" : "Select All"}
              </Button>
            )}
          </div>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 shadow-sm">
            {branches.length} Branches
          </span>
        </div>
        
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {branches.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="p-8 text-center bg-white/50 border border-dashed border-gray-300 rounded-2xl"
              >
                <p className="text-gray-500 font-medium">No branches created yet. Create one to get started!</p>
              </motion.div>
            ) : (
              branches.map((branch) => {
                const isSelected = selectedBranchIds.has(branch.id);
                return (
                  <motion.div 
                    key={branch.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => toggleSelection(branch.id)}
                    className={`bg-white rounded-2xl p-5 transition-all cursor-pointer group relative overflow-hidden flex items-stretch gap-4 ${
                      isSelected 
                        ? 'border-2 border-gray-900 shadow-sm bg-gray-50/50' 
                        : 'border-2 border-transparent shadow-sm hover:border-gray-200'
                    }`}
                  >
                    <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-300 ${isSelected ? 'bg-gray-900 opacity-100' : 'bg-gray-200 opacity-0 group-hover:opacity-100'}`} />
                    
                    {/* Checkbox Column */}
                    <div className="flex items-center justify-center pt-1">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-gray-900 border-gray-900 text-white' 
                          : 'border-gray-300 text-transparent group-hover:border-gray-400'
                      }`}>
                        <Check size={14} className="stroke-[3]" />
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-900 leading-none">{branch.name}</h3>
                          {branch._count && branch._count.entries > 0 && (
                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100">
                              <Users size={12} /> {branch._count.entries}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-amber-500" />
                            {branch.location || "No location set"}
                          </div>
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <LinkIcon size={14} className="text-amber-500" />
                            <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">/{branch.id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`gap-2 h-9 transition-colors shadow-sm ${
                            isSelected 
                              ? 'border-gray-300 text-gray-800 bg-white hover:bg-gray-100' 
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-800'
                          }`}
                          onClick={(e) => showQrCode(branch, e)}
                        >
                          <QrCode className="w-4 h-4" />
                          QR Code
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          onClick={(e) => openDeleteModal(branch, e)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add New Branch */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-xl font-bold">Add New Branch</CardTitle>
              <CardDescription>Create a new registration portal for a dealership location.</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="create-branch-form" action={handleCreate} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Branch Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    placeholder="e.g. Nippon Toyota - Edappally" 
                    className="h-11 bg-white border-gray-200 focus-visible:ring-gray-400 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location (Optional)</Label>
                  <Input 
                    id="location" 
                    name="location" 
                    placeholder="e.g. Kochi, Kerala" 
                    className="h-11 bg-white border-gray-200 focus-visible:ring-gray-400 transition-colors"
                  />
                </div>
                <Button 
                  type="submit" 
                  className={`w-full h-11 gap-2 font-medium shadow-sm transition-all ${
                    success 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                  disabled={loading || success}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : success ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {loading ? "Creating..." : success ? "Branch Created!" : "Create Branch"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedBranchIds.size > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 text-gray-900 w-6 h-6 rounded-full flex items-center justify-center font-medium text-xs">
                  {selectedBranchIds.size}
                </div>
                <span className="font-medium text-sm">Branches Selected</span>
              </div>
              <div className="w-px h-6 bg-gray-700" />
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedBranchIds(new Set())}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={openBulkDeleteModal}
                  className="gap-2 shadow-lg"
                >
                  <Trash2 size={14} />
                  Delete Selected
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setQrModal({ ...qrModal, isOpen: false })}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center pb-0">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{qrModal.branchName}</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">Scan to enter lucky draw</p>
              </div>
              <div className="p-6 flex flex-col items-center">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-6">
                  <img src={qrModal.dataUrl} alt="QR Code" className="w-64 h-64 object-contain" />
                </div>
                <div className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                  <p className="text-xs text-center font-mono break-all text-gray-600">
                    {qrModal.url}
                  </p>
                </div>
                <div className="flex w-full gap-3">
                  <Button 
                    variant="outline"
                    className="flex-1 h-12 rounded-xl font-bold gap-2"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = qrModal.dataUrl;
                      link.download = `${qrModal.branchName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download size={18} />
                    Download
                  </Button>
                  <Button 
                    className="flex-1 h-12 rounded-xl font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                    onClick={() => setQrModal({ ...qrModal, isOpen: false })}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Single Delete Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && deleteModal.branch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!deletingId) {
                setDeleteModal({ isOpen: false, branch: null });
                setDeleteConfirmText("");
              }
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-red-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Branch</h3>
                    <p className="text-sm font-medium text-gray-500">{deleteModal.branch.name}</p>
                  </div>
                </div>

                {entriesCount > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                      <p className="text-sm text-red-800 font-medium leading-relaxed">
                        This branch currently has <strong className="font-black text-red-900">{entriesCount} active {entriesCount === 1 ? 'entry' : 'entries'}</strong>. 
                        Deleting this branch will permanently destroy all entries and winners associated with it. This action cannot be undone.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700">
                        To verify, type <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-red-600 select-all">delete this branch</span> below:
                      </Label>
                      <Input 
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="h-11 font-mono text-sm border-gray-300 focus:border-red-500 focus:ring-red-500"
                        placeholder="delete this branch"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 font-medium">
                    Are you sure you want to delete this branch? There are no entries yet, so it's safe to delete.
                  </p>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-100">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setDeleteModal({ isOpen: false, branch: null });
                    setDeleteConfirmText("");
                  }}
                  disabled={!!deletingId}
                  className="font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleteButtonDisabled || !!deletingId}
                  className="font-bold shadow-sm"
                >
                  {deletingId ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </div>
                  ) : (
                    "Delete Branch"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Modal */}
      <AnimatePresence>
        {bulkDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!bulkDeleting) {
                setBulkDeleteModal(false);
                setDeleteConfirmText("");
              }
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-red-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Delete {selectedBranchIds.size} Branches</h3>
                    <p className="text-sm font-medium text-gray-500">Bulk action</p>
                  </div>
                </div>

                {bulkEntriesCount > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                      <p className="text-sm text-red-800 font-medium leading-relaxed">
                        These branches contain a combined total of <strong className="font-black text-red-900">{bulkEntriesCount} active {bulkEntriesCount === 1 ? 'entry' : 'entries'}</strong>. 
                        Deleting them will permanently destroy all their entries and winners. This action cannot be undone.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700">
                        To verify, type <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-red-600 select-all">delete these branches</span> below:
                      </Label>
                      <Input 
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="h-11 font-mono text-sm border-gray-300 focus:border-red-500 focus:ring-red-500"
                        placeholder="delete these branches"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 font-medium">
                    Are you sure you want to delete these {selectedBranchIds.size} branches? There are no entries in any of them, so it's safe to proceed.
                  </p>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-100">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setBulkDeleteModal(false);
                    setDeleteConfirmText("");
                  }}
                  disabled={bulkDeleting}
                  className="font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleteButtonDisabled || bulkDeleting}
                  className="font-bold shadow-sm"
                >
                  {bulkDeleting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </div>
                  ) : (
                    "Delete All Selected"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
