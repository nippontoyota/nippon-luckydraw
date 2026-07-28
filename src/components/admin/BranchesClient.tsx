"use client";

import { useState, useRef } from "react";
import { createBranch, deleteBranch } from "@/app/actions/admin";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Plus, Trash2, MapPin, Link as LinkIcon, Users, AlertTriangle, Download } from "lucide-react";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const submittingRef = useRef(false);
  
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
    
    try {
      const result = await createBranch(formData);
      
      if (result?.error) {
        alert(result.error);
      } else {
        const form = document.getElementById("create-branch-form") as HTMLFormElement;
        if (form) form.reset();
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
      }
    } finally {
      setDeletingId(null);
    }
  };

  const showQrCode = async (branch: Branch) => {
    const origin = typeof window !== "undefined" ? window.location.origin : appUrl;
    const url = `${origin}/enter/${branch.slug}`;
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

  const openDeleteModal = (branch: Branch) => {
    setDeleteConfirmText("");
    setDeleteModal({ isOpen: true, branch });
  };

  const entriesCount = deleteModal.branch?._count?.entries || 0;
  const isDeleteButtonDisabled = entriesCount > 0 && deleteConfirmText !== "delete this branch";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Branches List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Active Branches</h2>
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
              branches.map((branch) => (
                <motion.div 
                  key={branch.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl p-5 border border-amber-100 shadow-[0_4px_20px_-4px_rgba(212,147,10,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(212,147,10,0.12)] transition-shadow group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                        <div className="flex items-center gap-1.5">
                          <LinkIcon size={14} className="text-amber-500" />
                          <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">/{branch.slug}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 h-9 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 transition-colors shadow-sm"
                        onClick={() => showQrCode(branch)}
                      >
                        <QrCode className="w-4 h-4" />
                        QR Code
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => openDeleteModal(branch)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add New Branch */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <Card className="border-none shadow-[0_8px_30px_-4px_rgba(212,147,10,0.1)] overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-red-500 to-amber-400" />
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">Add New Branch</CardTitle>
              <CardDescription>Create a new registration portal for a dealership location.</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="create-branch-form" action={handleCreate} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-gray-500">Branch Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    placeholder="e.g. Nippon Toyota - Edappally" 
                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors focus-visible:ring-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-gray-500">Location (Optional)</Label>
                  <Input 
                    id="location" 
                    name="location" 
                    placeholder="e.g. Kochi, Kerala" 
                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors focus-visible:ring-amber-500"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 gap-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-bold shadow-md hover:shadow-lg transition-all" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {loading ? "Creating..." : "Create Branch"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-white/20"
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

      {/* Vercel-Style Delete Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && deleteModal.branch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-red-100 overflow-hidden"
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
    </div>
  );
}
