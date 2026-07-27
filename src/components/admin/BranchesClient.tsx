"use client";

import { useState } from "react";
import { createBranch } from "@/app/actions/admin";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Plus } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  location: string | null;
  slug: string;
}

export function BranchesClient({ branches, appUrl }: { branches: Branch[], appUrl: string }) {
  const [loading, setLoading] = useState(false);
  const [qrModal, setQrModal] = useState<{ isOpen: boolean; url: string; dataUrl: string; branchName: string }>({
    isOpen: false,
    url: "",
    dataUrl: "",
    branchName: "",
  });

  const handleCreate = async (formData: FormData) => {
    setLoading(true);
    const result = await createBranch(formData);
    setLoading(false);
    
    if (result?.error) {
      alert(result.error);
    } else {
      // Clear form
      const form = document.getElementById("create-branch-form") as HTMLFormElement;
      if (form) form.reset();
    }
  };

  const showQrCode = async (branch: Branch) => {
    // Dynamically get the current domain so the QR code ALWAYS points to the active Vercel deployment
    const origin = typeof window !== "undefined" ? window.location.origin : appUrl;
    const url = `${origin}/enter/${branch.slug}`;
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrModal({ isOpen: true, url, dataUrl, branchName: branch.name });
    } catch (err) {
      console.error(err);
      alert("Failed to generate QR code");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Existing Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Branch Name</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">URL Slug</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        No branches created yet.
                      </td>
                    </tr>
                  ) : (
                    branches.map((branch) => (
                      <tr key={branch.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{branch.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{branch.location || "-"}</td>
                        <td className="px-4 py-3 font-mono text-xs">{branch.slug}</td>
                        <td className="px-4 py-3 text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => showQrCode(branch)}
                          >
                            <QrCode className="w-4 h-4" />
                            QR Code
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Add New Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="create-branch-form" action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Branch Name</Label>
                <Input id="name" name="name" required placeholder="e.g. Kochi Edappally" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input id="location" name="location" placeholder="e.g. Kerala" />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <Plus className="w-4 h-4" />
                {loading ? "Creating..." : "Create Branch"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Modal Overlay */}
      {qrModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm animate-in zoom-in-95 duration-200">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">{qrModal.branchName}</CardTitle>
              <p className="text-sm text-muted-foreground">Scan to enter lucky draw</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="bg-white p-2 rounded-xl shadow-inner border border-gray-100">
                <img src={qrModal.dataUrl} alt="QR Code" className="w-64 h-64 object-contain" />
              </div>
              <div className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-center font-mono break-all text-gray-500">
                  {qrModal.url}
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setQrModal({ ...qrModal, isOpen: false })}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
