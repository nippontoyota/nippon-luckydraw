import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NilavilakkuLamp, PetalRain, Sparkle } from "@/components/forms/FestiveElements";
import { TermsContent } from "@/components/forms/TermsContent";

export const metadata: Metadata = {
  title: "Terms & Conditions | Nippon Toyota Onam Lucky Draw",
  description: "Terms and Conditions for the Nippon Toyota Onam Lucky Draw 2026.",
};

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

          <TermsContent markdown={markdown} />

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
