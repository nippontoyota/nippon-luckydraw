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
import { Gift } from "lucide-react";
import type { Branch } from "@prisma/client";

export function DrawControls({ branches }: { branches: Branch[] }) {
  const [branchId, setBranchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDraw = async () => {
    if (!branchId) {
      setError("Please select a branch.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    // Call atomic draw for all 3 places
    const result = await drawWinner(branchId);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  // Only show branches that have not completed the draw
  const pendingBranches = branches.filter(b => b.drawStatus === "PENDING");

  return (
    <Card className="border-t-4 border-t-primary shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Conduct Draw
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingBranches.length === 0 ? (
          <div className="p-4 text-center text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">
            All branch draws have been completed!
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Select Branch</Label>
              <Select value={branchId} onValueChange={(val) => setBranchId(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch..." />
                </SelectTrigger>
                <SelectContent>
                  {pendingBranches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md font-medium">
                Winners selected successfully!
              </div>
            )}

            <Button
              onClick={handleDraw}
              disabled={loading || !branchId}
              className="w-full font-bold h-12 mt-2 bg-primary hover:bg-primary/90"
            >
              {loading ? "Drawing Winners..." : "Draw 3 Winners At Once"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
