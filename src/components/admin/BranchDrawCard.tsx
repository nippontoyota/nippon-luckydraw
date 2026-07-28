"use client";

import { useState, useTransition } from "react";
import { drawWinner } from "@/app/actions/draw";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Branch } from "@prisma/client";

// Minimal definition to support winners relation
type WinnerWithDetails = {
  id: string;
  place: number;
  entry: {
    name: string;
    phone: string;
    vin: string;
    model: { name: string };
    colour: { name: string };
  };
};

interface BranchDrawCardProps {
  branch: Branch;
  winners: WinnerWithDetails[];
}

export function BranchDrawCard({ branch, winners }: BranchDrawCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showConfirmRedraw, setShowConfirmRedraw] = useState(false);

  const hasWinners = winners.length > 0;

  const handleDraw = async (forceRerun = false) => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await drawWinner(branch.id, forceRerun);
      
      if (result.error === "WINNERS_EXIST" && !forceRerun) {
        setShowConfirmRedraw(true);
        return;
      }
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      setSuccess(true);
      setShowConfirmRedraw(false);
      // Wait a moment before clearing success message
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl font-bold">{branch.name}</CardTitle>
          {branch.location && <CardDescription>{branch.location}</CardDescription>}
        </div>
        
        {!hasWinners && (
          <Button 
            onClick={() => handleDraw()} 
            disabled={isPending}
            className="shrink-0"
          >
            {isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Drawing...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4" />
                Draw Winners
              </>
            )}
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 flex items-center text-sm text-red-800">
            <AlertTriangle className="h-4 w-4 mr-2 shrink-0 text-red-500" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 flex items-center text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4 mr-2 shrink-0 text-green-500" />
            Winners drawn successfully!
          </div>
        )}

        {hasWinners ? (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-md border border-gray-100">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-medium">Place</th>
                    <th className="px-4 py-3 font-medium">Winner Name</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Vehicle</th>
                    <th className="px-4 py-3 font-medium text-right">VIN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {winners.map((winner) => (
                    <tr key={winner.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          winner.place === 1 ? "bg-yellow-100 text-yellow-800 border border-yellow-200/50" :
                          winner.place === 2 ? "bg-gray-100 text-gray-800 border border-gray-200/50" :
                          "bg-orange-100 text-orange-800 border border-orange-200/50"
                        }`}>
                          {winner.place}{winner.place === 1 ? "st" : winner.place === 2 ? "nd" : "rd"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{winner.entry.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">******{winner.entry.phone.slice(-4)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {winner.entry.model.name} <span className="text-gray-400">({winner.entry.colour.name})</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500 text-right">
                        ***{winner.entry.vin.slice(-4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              {showConfirmRedraw ? (
                <div className="flex items-center gap-3 bg-red-50 p-2 pl-4 rounded-md border border-red-100">
                  <span className="text-sm text-red-800 font-medium">Overwrite existing winners?</span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowConfirmRedraw(false)}
                      disabled={isPending}
                      className="bg-white"
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDraw(true)}
                      disabled={isPending}
                    >
                      {isPending ? "Redrawing..." : "Confirm Redraw"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                  onClick={() => setShowConfirmRedraw(true)}
                  disabled={isPending}
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Redraw
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center bg-gray-50/50 rounded-md border border-dashed border-gray-200">
            <Trophy className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm text-muted-foreground font-medium">No winners selected yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Click the button above to draw 3 random winners.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
