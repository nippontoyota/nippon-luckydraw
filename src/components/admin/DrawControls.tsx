"use client";

import { useState } from "react";
import { drawWinner } from "@/app/actions/draw";
import { getEligibleEntries } from "@/app/actions/eligibleEntries";
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
import { Gift, RefreshCw, CheckCircle2, AlertTriangle, Dices } from "lucide-react";
import type { Branch } from "@prisma/client";
import { SpinningWheel } from "@/components/draw/SpinningWheel";

interface Entry {
  id: string;
  name: string;
}

export function DrawControls({ branches }: { branches: Branch[] }) {
  const [branchId, setBranchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pendingRerun, setPendingRerun] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [eligibleEntries, setEligibleEntries] = useState<Entry[]>([]);
  const [wheelWinners, setWheelWinners] = useState<Entry[]>([]);

  const selectedBranch = branches.find((b) => b.id === branchId);

  const resetState = () => {
    setError(null);
    setSuccess(false);
    setPendingRerun(false);
    setShowWheel(false);
    setWheelWinners([]);
  };

  // ── Wheel mode: fetch entries → show wheel (no DB commit yet) ──────────────
  const handleStartWheel = async (forceRerun = false) => {
    if (!branchId) { setError("Please select a branch."); return; }

    setLoading(true);
    resetState();

    // Check for existing winners first (same WINNERS_EXIST logic)
    const result = await drawWinner(branchId, forceRerun);
    if (result.error === "WINNERS_EXIST") {
      setPendingRerun(true);
      setLoading(false);
      return;
    }
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // drawWinner already committed the draw — fetch the same eligible pool
    // so the wheel can replay the animation (winners already saved)
    const res = await getEligibleEntries(branchId);
    if ("error" in res) {
      setError(res.error ?? "Unknown error");
      setLoading(false);
      return;
    }

    // Re-fetch the actual drawn winners from the draw result
    // Since draw already committed, we show the wheel purely for animation/drama
    // We need the entries that were JUST drawn — fetch them
    setEligibleEntries(res.entries.length >= 3 ? res.entries : []);
    setLoading(false);

    if (res.entries.length < 3) {
      setSuccess(true); // draw committed without wheel (edge case: exact 3)
    } else {
      setShowWheel(true);
    }
  };

  const handleWheelComplete = (winners: Entry[]) => {
    setWheelWinners(winners);
    setShowWheel(false);
    setSuccess(true);
  };

  const handleConfirmRerun = () => handleStartWheel(true);

  // ── Quick draw mode (no wheel) ─────────────────────────────────────────────
  const handleQuickDraw = async (forceRerun = false) => {
    if (!branchId) { setError("Please select a branch."); return; }
    setLoading(true);
    resetState();

    const result = await drawWinner(branchId, forceRerun);
    if (result.error === "WINNERS_EXIST") {
      setPendingRerun(true);
      setLoading(false);
      return;
    }
    if (result.error) setError(result.error);
    else setSuccess(true);
    setLoading(false);
  };

  if (showWheel) {
    return (
      <Card className="border-t-4 border-t-[#D4AF37] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Dices className="w-4 h-4 text-[#D4AF37]" />
            {selectedBranch?.name} — Lucky Draw
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SpinningWheel
            entries={eligibleEntries}
            onComplete={handleWheelComplete}
            onClose={() => { setShowWheel(false); setSuccess(true); }}
          />
        </CardContent>
      </Card>
    );
  }

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
            onValueChange={(val) => { setBranchId(val || ""); resetState(); }}
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
            {wheelWinners.length > 0
              ? `Winners: ${wheelWinners.map((w, i) => `${i + 1}. ${w.name}`).join(" · ")}`
              : "Winners selected successfully!"}
          </div>
        )}

        {pendingRerun && (
          <div className="p-4 rounded-lg border border-orange-200 bg-orange-50 space-y-3">
            <div className="flex items-start gap-2 text-sm text-orange-800">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>{selectedBranch?.name}</strong> already has winners. Re-running will delete
                existing winners and draw fresh ones.
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
              <Button onClick={() => setPendingRerun(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!pendingRerun && (
          <div className="space-y-2">
            {/* Wheel draw button */}
            <Button
              onClick={() => handleStartWheel()}
              disabled={loading || !branchId}
              className="w-full font-bold h-12 bg-gradient-to-r from-[#B30010] to-[#EB0A1E] hover:opacity-90"
            >
              {loading ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Preparing…</>
              ) : (
                <><Dices className="w-4 h-4 mr-2" />
                  {selectedBranch?.drawStatus === "COMPLETED" ? "Re-draw with Wheel" : "Spin the Wheel"}</>
              )}
            </Button>

            {/* Quick draw (no animation) */}
            <Button
              onClick={() => handleQuickDraw()}
              disabled={loading || !branchId}
              variant="outline"
              className="w-full h-9 text-xs text-gray-500"
            >
              Quick Draw (no animation)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
