import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { NilavilakkuLamp, PetalRain, Sparkle } from "@/components/forms/FestiveElements";

export const metadata: Metadata = {
  title: "Terms & Conditions | Nippon Toyota Onam Lucky Draw",
  description: "Terms and Conditions for the Nippon Toyota Onam Lucky Draw 2026.",
};

type Block =
  | { type: "h1" | "h2"; text: string }
  | { type: "hr" }
  | { type: "paragraph"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; rows: string[][] };

function parseMarkdown(markdown: string): Block[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (line === "---") {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.replace(/^#\s+/, "") });
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.replace(/^##\s+/, "") });
      i += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().replace(/^-\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const tableLine = lines[i].trim();
        if (!/^\|[\s:-]+\|/.test(tableLine)) {
          rows.push(
            tableLine
              .slice(1, -1)
              .split("|")
              .map((cell) => cell.trim())
          );
        }
        i += 1;
      }
      blocks.push({ type: "table", rows });
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length) {
      const current = lines[i].trim();
      if (
        !current ||
        current === "---" ||
        current.startsWith("# ") ||
        current.startsWith("## ") ||
        current.startsWith("- ") ||
        current.startsWith("|")
      ) {
        break;
      }
      paragraph.push(current);
      i += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-extrabold text-[#0E3A36]">{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

function renderBlock(block: Block, index: number) {
  switch (block.type) {
    case "h1":
      return (
        <h2 key={index} className="text-[20px] font-black leading-tight text-[#0E3A36]">
          {block.text}
        </h2>
      );
    case "h2":
      return (
        <div key={index} className="mt-6 flex items-center gap-2 border-b border-[#FFD400] pb-2 first:mt-0">
          <div className="h-7 w-1 rounded-full bg-[#F47C00]" />
          <h3 className="text-[14px] font-extrabold leading-snug text-[#0E3A36]">
            {block.text}
          </h3>
        </div>
      );
    case "hr":
      return <div key={index} className="h-px bg-[#FFD400]/80" />;
    case "ul":
      return (
        <ul key={index} className="space-y-2 pl-1">
          {block.items.map((item) => (
            <li key={item} className="flex gap-2 text-[12px] font-medium leading-relaxed text-[#0E3A36]">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#F47C00]" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    case "table": {
      const [head, ...body] = block.rows;
      return (
        <div key={index} className="overflow-x-auto rounded-2xl border border-[#FFD400]">
          <table className="w-full min-w-[520px] border-collapse bg-white text-left text-[11px]">
            <thead className="bg-[#0E3A36] text-white">
              <tr>
                {head.map((cell) => (
                  <th key={cell} className="px-3 py-2.5 font-extrabold">
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rowIndex) => (
                <tr key={row.join("-")} className={rowIndex % 2 ? "bg-[#FFF9E6]" : "bg-white"}>
                  {row.map((cell) => (
                    <td key={cell} className="border-t border-[#FFD400]/70 px-3 py-2.5 font-medium leading-relaxed text-[#0E3A36]">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "paragraph":
      return (
        <p key={index} className="text-[12px] font-medium leading-relaxed text-[#0E3A36]">
          {renderInline(block.text)}
        </p>
      );
  }
}

export default async function TermsAndConditionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ returnTo?: string }>;
}) {
  const params = await searchParams;
  const returnTo =
    typeof params?.returnTo === "string" && params.returnTo.startsWith("/enter/")
      ? params.returnTo
      : null;
  const markdown = fs.readFileSync(path.join(process.cwd(), "nippon-toyota-onam-lucky-draw-tnc.md"), "utf8");
  const blocks = parseMarkdown(markdown).filter((block, index) => {
    if (index === 0 && block.type === "h1") return false;
    if (index === 1 && block.type === "h2") return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#fbf9f8]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[420px] flex-col overflow-hidden bg-[#FFF4E1] font-sans shadow-2xl">
        <PetalRain />

        <header className="relative overflow-hidden bg-[#0E3A36]">
          <div className="h-9" />
          <div className="relative flex items-center justify-between px-5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="relative h-8 w-8">
                <Image src="/images/logo_for_customer_facing.webp" alt="Toyota Emblem" fill sizes="32px" className="object-contain" priority />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[16px] font-black uppercase leading-tight tracking-[0.15em] text-white">NIPPON</p>
                <p className="text-[16px] font-black uppercase leading-none tracking-[0.15em] text-white">TOYOTA</p>
              </div>
            </div>
            <div className="pookalam-spin relative h-16 w-16 flex-shrink-0 opacity-90">
              <Image src="/images/pookalam.webp" alt="Onam pookalam" fill sizes="64px" className="object-cover" priority />
            </div>
          </div>

          <div className="relative px-5 pb-4">
            <div className="mb-1 flex items-center gap-2">
              <div className="h-px flex-1 bg-[rgba(255,215,0,0.35)]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FFD700]">Onam Festival 2026</p>
              <div className="h-px flex-1 bg-[rgba(255,215,0,0.35)]" />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <h1 className="text-[24px] font-black leading-tight text-white">Terms &amp; Conditions</h1>
                <p className="mt-1.5 text-[11px] font-normal leading-relaxed text-white/70">
                  Nippon Toyota Onam Lucky Draw.
                </p>
              </div>
              <NilavilakkuLamp size={30} />
            </div>
          </div>

          <svg viewBox="0 0 390 22" className="block w-full" style={{ marginBottom: -1 }}>
            <path d="M0,22 C65,4 130,20 195,10 C260,0 325,18 390,6 L390,22 Z" fill="#FFF4E1" />
          </svg>
        </header>

        <section className="relative z-10 mx-4 mt-3 mb-6 rounded-3xl border border-[#FFD400] bg-white p-5 shadow-xl">
          <div className="mb-5 flex items-center gap-2.5 border-b border-[#FFD400] pb-4">
            <div className="h-8 w-1 rounded-full bg-[#F47C00]" />
            <div>
              <p className="text-[13px] font-extrabold text-[#0E3A36]">Lucky Draw T&amp;C</p>
              <p className="text-[11px] font-normal text-[#6A8E2C]">Customer information • Onam 2026</p>
            </div>
            <Sparkle size={14} color="#F47C00" />
          </div>

          <div className="space-y-4">
            {blocks.map(renderBlock)}
          </div>

          {returnTo && (
            <Link
              href={returnTo}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F47C00] px-4 py-3.5 text-[13px] font-extrabold uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.98]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to form
            </Link>
          )}
        </section>

        <div className="h-2" />
      </div>
    </main>
  );
}
