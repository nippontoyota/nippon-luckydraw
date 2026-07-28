"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Entry {
  id: string;
  name: string;
}

interface WheelProps {
  entries: Entry[];
  onComplete: (winners: Entry[]) => void;
  onClose: () => void;
}

const PLACE_LABELS = ["1st Prize", "2nd Prize", "3rd Prize"];
const PLACE_COLORS = ["#D4AF37", "#9E9E9E", "#CD7F32"]; // gold, silver, bronze
const SEGMENT_PALETTE = [
  "#EB0A1E", "#C8730A", "#1B5E20", "#0D47A1",
  "#6A1B9A", "#BF360C", "#00695C", "#283593",
];

const SPIN_DURATION = 4000; // ms per spin
const MIN_FULL_ROTATIONS = 8;

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function drawWheel(
  canvas: HTMLCanvasElement,
  entries: Entry[],
  rotation: number,
  revealed: Entry[],
  spinning: boolean
) {
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) - 8;
  const n = entries.length;
  const arc = (2 * Math.PI) / n;

  ctx.clearRect(0, 0, width, height);

  // Draw segments
  entries.forEach((entry, i) => {
    const startAngle = rotation + i * arc;
    const endAngle = startAngle + arc;
    const isRevealed = revealed.some((r) => r.id === entry.id);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();

    ctx.fillStyle = isRevealed
      ? "rgba(255,255,255,0.3)"
      : SEGMENT_PALETTE[i % SEGMENT_PALETTE.length];
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    const midAngle = startAngle + arc / 2;
    const labelRadius = radius * 0.68;
    const lx = cx + labelRadius * Math.cos(midAngle);
    const ly = cy + labelRadius * Math.sin(midAngle);

    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(midAngle + Math.PI / 2);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = `bold ${Math.max(9, Math.min(13, 220 / n))}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Clip long names
    const maxLen = n > 20 ? 6 : n > 10 ? 10 : 14;
    const label = entry.name.length > maxLen ? entry.name.slice(0, maxLen - 1) + "…" : entry.name;
    ctx.fillText(label, 0, 0);
    ctx.restore();
  });

  // Center hub
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
  ctx.fillStyle = spinning ? "#EB0A1E" : "#D4AF37";
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Pointer (top triangle)
  ctx.beginPath();
  ctx.moveTo(cx, cy - radius - 4);
  ctx.lineTo(cx - 12, cy - radius + 20);
  ctx.lineTo(cx + 12, cy - radius + 20);
  ctx.closePath();
  ctx.fillStyle = "#EB0A1E";
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function launchConfetti(container: HTMLElement) {
  const colors = ["#D4AF37", "#EB0A1E", "#ffffff", "#1B5E20", "#FF9800"];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.style.cssText = `
      left: ${20 + Math.random() * 60}%;
      top: 0;
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
      animation-duration: ${1.5 + Math.random() * 1.5}s;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

export function SpinningWheel({ entries, onComplete, onClose }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);

  const [phase, setPhase] = useState<"idle" | "spinning" | "revealing" | "done">("idle");
  const [round, setRound] = useState(0); // 0, 1, 2
  const [revealed, setRevealed] = useState<Entry[]>([]);
  const [currentWinner, setCurrentWinner] = useState<Entry | null>(null);
  const [pool, setPool] = useState<Entry[]>(entries);

  // Draw loop
  const draw = useCallback(() => {
    if (canvasRef.current) {
      drawWheel(canvasRef.current, pool, rotationRef.current, revealed, phase === "spinning");
    }
  }, [pool, revealed, phase]);

  useEffect(() => {
    draw();
  }, [draw]);

  const spinToWinner = useCallback(
    (winner: Entry, poolForSpin: Entry[]) => {
      setPhase("spinning");
      const n = poolForSpin.length;
      const arc = (2 * Math.PI) / n;
      const winnerIdx = poolForSpin.findIndex((e) => e.id === winner.id);

      // Calculate target rotation so pointer (top = -π/2) lands on winner segment midpoint
      const targetMidAngle = -Math.PI / 2; // pointer is at top
      const segmentMidRelative = winnerIdx * arc + arc / 2;
      const totalTarget =
        MIN_FULL_ROTATIONS * 2 * Math.PI +
        ((targetMidAngle - segmentMidRelative - rotationRef.current) % (2 * Math.PI) + 2 * Math.PI) %
          (2 * Math.PI);

      const startRotation = rotationRef.current;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / SPIN_DURATION, 1);
        const eased = easeOut(t);
        rotationRef.current = startRotation + totalTarget * eased;

        if (canvasRef.current) {
          drawWheel(canvasRef.current, poolForSpin, rotationRef.current, revealed, t < 1);
        }

        if (t < 1) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          setPhase("revealing");
          setCurrentWinner(winner);
          setRevealed((prev) => [...prev, winner]);
          if (containerRef.current) launchConfetti(containerRef.current);
        }
      };

      animRef.current = requestAnimationFrame(animate);
    },
    [revealed]
  );

  const handleSpin = useCallback(() => {
    if (phase !== "idle") return;
    // Pick a random winner from remaining pool
    const remaining = pool.filter((e) => !revealed.some((r) => r.id === e.id));
    if (remaining.length === 0) return;
    const winner = remaining[Math.floor(Math.random() * remaining.length)];
    spinToWinner(winner, pool);
  }, [phase, pool, revealed, spinToWinner]);

  const handleNext = useCallback(() => {
    if (round < 2) {
      setRound((r) => r + 1);
      setCurrentWinner(null);
      setPhase("idle");
    } else {
      setPhase("done");
      onComplete(revealed);
    }
  }, [round, revealed, onComplete]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Keep pool in sync with entries
  useEffect(() => {
    setPool(entries);
  }, [entries]);

  const placeLabel = PLACE_LABELS[round];
  const placeColor = PLACE_COLORS[round];

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center gap-4"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Round indicator */}
      <div className="flex gap-2 mb-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
            style={{
              borderColor: i === round ? placeColor : i < round ? "#9CA3AF" : "#E5E7EB",
              background: i < round ? "#9CA3AF" : i === round ? placeColor : "white",
              color: i <= round ? "white" : "#9CA3AF",
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Prize label */}
      <div className="text-sm font-bold uppercase tracking-widest" style={{ color: placeColor }}>
        {placeLabel}
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={340}
          height={340}
          className="rounded-full"
          style={{ touchAction: "none" }}
        />
      </div>

      {/* Entry count */}
      <p className="text-xs text-gray-400">
        {pool.filter((e) => !revealed.some((r) => r.id === e.id)).length} eligible entries
      </p>

      {/* Winner reveal */}
      {phase === "revealing" && currentWinner && (
        <div
          className="w-full rounded-xl border-2 p-4 text-center animate-[slide-up_0.4s_ease-out]"
          style={{ borderColor: placeColor, background: `${placeColor}15` }}
        >
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: placeColor }}>
            🎉 {placeLabel} Winner
          </div>
          <div className="text-2xl font-black text-gray-900">{currentWinner.name}</div>
          <button
            onClick={handleNext}
            className="mt-3 inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: placeColor }}
          >
            {round < 2 ? `Draw ${PLACE_LABELS[round + 1]} →` : "Finish & Save"}
          </button>
        </div>
      )}

      {/* Spin button */}
      {phase === "idle" && (
        <button
          onClick={handleSpin}
          className="w-full h-12 rounded-xl font-bold text-white text-sm tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg, #B30010 0%, #EB0A1E 100%)` }}
        >
          Spin for {placeLabel}
        </button>
      )}

      {/* Spinning state */}
      {phase === "spinning" && (
        <div className="w-full h-12 rounded-xl font-bold text-white text-sm tracking-wide flex items-center justify-center gap-2 opacity-70"
          style={{ background: "linear-gradient(135deg,#B30010 0%,#EB0A1E 100%)" }}>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Spinning…
        </div>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1"
      >
        Close wheel
      </button>
    </div>
  );
}
