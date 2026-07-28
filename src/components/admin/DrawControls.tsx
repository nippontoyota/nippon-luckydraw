"use client";

import { useState } from "react";
import { drawWinner } from "@/app/actions/draw";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gift, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import type { Branch } from "@prisma/client";

export function DrawControls({ branches }: { branches: Branch[] }) {
  const [branchId, setBranchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pendingRerun, setPendingRerun] = useState(false);

  const selectedBranch = branches.find((b) => b.id === branchId);

  const handleDraw = async (forceRerun = false) => {
    if (!branchId) {
      setError("Please select a branch.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setPendingRerun(false);

    const result = await drawWinner(branchId, forceRerun);

    if (result.error === "WINNERS_EXIST") {
      // Branch already has winners — ask for confirmation
      setPendingRerun(true);
      setLoading(false);
      return;
    }

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  const handleConfirmRerun = () => handleDraw(true);

  return (
    <Card className="border-t-4 border-t-primary shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Conduct Draw
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Select Branch</Label>
          <Select
            value={branchId}
            onValueChange={(val) => {
              setBranchId(val || "");
              setError(null);
              setSuccess(false);
              setPendingRerun(false);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a branch..." />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                  {b.drawStatus === "COMPLETED" && " ✓"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-100 rounded-md font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Winners selected successfully!
          </div>
        )}

        {pendingRerun && (
          <div className="p-4 rounded-lg border border-orange-200 bg-orange-50 space-y-3">
            <div className="flex items-start gap-2 text-sm text-orange-800">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>{selectedBranch?.name}</strong> already has winners drawn. Re-running
                will delete the existing winners and draw fresh ones.
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleConfirmRerun}
                disabled={loading}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Yes, Re-draw
              </Button>
              <Button
                onClick={() => setPendingRerun(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!pendingRerun && (
          <Button
            onClick={() => handleDraw()}
            disabled={loading || !branchId}
            className="w-full font-bold h-12 mt-2 bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Drawing Winners...</>
            ) : selectedBranch?.drawStatus === "COMPLETED" ? (
              <><RefreshCw className="w-4 h-4 mr-2" /> Re-draw Winners</>
            ) : (
              "Draw 3 Winners"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
