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

  const [selectedWinner, setSelectedWinner] = useState<WinnerWithDetails | null>(null);

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
                    <tr 
                      key={winner.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedWinner(winner)}
                    >
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
                      <td className="px-4 py-3 text-gray-700">{winner.entry.phone}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {winner.entry.model.name} <span className="text-gray-400">({winner.entry.colour.name})</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-600 text-right">
                        {winner.entry.vin}
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

      {/* Winner Details Modal */}
      {selectedWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedWinner(null)}>
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Winner Details</h3>
              <button 
                onClick={() => setSelectedWinner(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-black shadow-sm ${
                  selectedWinner.place === 1 ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-200" :
                  selectedWinner.place === 2 ? "bg-gray-100 text-gray-800 border-2 border-gray-200" :
                  "bg-orange-100 text-orange-800 border-2 border-orange-200"
                }`}>
                  {selectedWinner.place}
                </span>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedWinner.entry.name}</h4>
                  <p className="text-sm text-gray-500">{branch.name} Branch</p>
                </div>
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-gray-500 font-medium">Phone:</span>
                  <span className="col-span-2 font-semibold text-gray-900">{selectedWinner.entry.phone}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-gray-500 font-medium">Vehicle:</span>
                  <span className="col-span-2 font-semibold text-gray-900">{selectedWinner.entry.model.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-gray-500 font-medium">Colour:</span>
                  <span className="col-span-2 font-semibold text-gray-900">{selectedWinner.entry.colour.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-gray-500 font-medium">VIN:</span>
                  <span className="col-span-2 font-mono font-semibold text-gray-900">{selectedWinner.entry.vin}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedWinner(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
