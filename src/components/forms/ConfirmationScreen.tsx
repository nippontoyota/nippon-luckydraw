"use client";

import { useEffect, useState, useMemo } from "react";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ToyotaEmblem,
  NilavilakkuLamp,
  Sparkle,
} from "./FestiveElements";

interface ConfirmationScreenProps {
  entryId: string;
  name: string;
  branchName: string;
  modelName: string;
  colourName: string;
  vin: string;
}

export function ConfirmationScreen({
  entryId,
  name,
  branchName,
  modelName,
  colourName,
  vin,
}: ConfirmationScreenProps) {
  const router = useRouter();

  const confetti = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.4,
      dur: 1.6 + Math.random() * 1.2,
      color: ['#EB0A1E', '#D4930A', '#FFD700', '#F5A623', '#fff', '#FF6B6B', '#FF8F00', '#FFF176'][i % 8],
      size: 6 + Math.floor(Math.random() * 5),
      shape: i % 3,
    })), [])

  return (
    <div className="flex flex-col min-h-screen relative font-sans w-full max-w-[420px] mx-auto shadow-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg,#FFF8E1 0%,#FFF3CD 60%,#FFECB3 100%)' }}>
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {confetti.map(p => (
          <div
            key={p.id}
            className="confetti"
            style={{
              left: `${p.left}%`, top: 0,
              width: p.size, height: p.shape === 1 ? p.size * 1.6 : p.size,
              borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? 2 : 0,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
        className="relative overflow-hidden" 
        style={{ background: 'linear-gradient(160deg,#1A0005 0%,#6B0D1A 45%,#EB0A1E 100%)' }}
      >
        <div className="h-9" />
        <div className="relative flex items-center justify-between px-5 pb-4">
          <div className="relative h-10 w-40">
            <Image src="/images/logo_for_customer_facing.png" alt="Nippon Toyota" fill sizes="160px" className="object-contain object-left" priority />
          </div>
          <div className="pookalam-spin opacity-90 flex-shrink-0 relative" style={{ width: 64, height: 64 }}>
            <Image src="/images/pookalam.png" alt="Onam pookalam" fill sizes="64px" className="object-cover" priority />
          </div>
        </div>
        <svg viewBox="0 0 390 22" className="w-full block" style={{ marginBottom: -1 }}>
          <path d="M0,22 C65,4 130,20 195,10 C260,0 325,18 390,6 L390,22 Z" fill="#FFF8E1" />
        </svg>
      </motion.div>

      {/* Success hero */}
      <div className="flex flex-col items-center pt-5 pb-2 relative z-10">
        <div className="flex items-end justify-center gap-6 mb-1">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
            <NilavilakkuLamp size={36} />
          </motion.div>
          
          <motion.div 
            initial={{ scale: 0, rotate: -15, opacity: 0 }} 
            animate={{ scale: 1, rotate: 0, opacity: 1 }} 
            transition={{ delay: 0.1, type: "spring", bounce: 0.6, duration: 0.8 }}
            className="relative flex-shrink-0"
          >
            <div style={{ width: 88, height: 88, position: 'relative' }}>
              <Image src="/images/pookalam.png" alt="" fill sizes="88px" className="object-cover opacity-80" priority />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
                  style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)' }}
                >
                  <svg width="26" height="22" viewBox="0 0 26 22" fill="none">
                    <motion.path 
                      initial={{ pathLength: 0 }} 
                      animate={{ pathLength: 1 }} 
                      transition={{ delay: 0.5, duration: 0.5 }}
                      d="M2 11L9.5 19L24 2" 
                      stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: "spring" }}>
            <NilavilakkuLamp size={36} />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center px-5 mt-3"
        >
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: '#D4930A' }}>
            Onam 2026
          </p>
          <h2 className="text-gray-900 text-[28px] font-black leading-tight">
            You're In! 🎉
          </h2>
          <p className="text-[13px] font-normal mt-1.5 leading-relaxed" style={{ color: '#78350F' }}>
            Thank you, <span className="font-extrabold text-[#EB0A1E]">{name.split(' ')[0]}</span>!<br />
            Best of luck in the lucky draw.
          </p>
        </motion.div>
      </div>

      {/* Ticket card */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6, type: "spring", bounce: 0.3 }}
        className="mx-4 mt-4 mb-4 rounded-3xl overflow-hidden shadow-2xl relative z-10" 
        style={{ border: '1.5px solid #FDE68A' }}
      >
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: 'linear-gradient(90deg,#1A0005 0%,#EB0A1E 100%)' }}>
          <div>
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase" style={{ color: '#FFD700' }}>Entry Ticket</p>
            <p className="text-white text-[12px] font-semibold mt-0.5">Nippon Toyota Onam Lucky Draw</p>
          </div>
          <div className="pookalam-spin flex-shrink-0 relative" style={{ width: 36, height: 36 }}>
            <Image src="/images/pookalam.png" alt="" fill sizes="36px" className="object-cover" />
          </div>
        </div>

        <div className="flex items-center" style={{ background: '#FFFDF7' }}>
          <div className="w-4 h-6 rounded-r-full -ml-px flex-shrink-0" style={{ background: '#FFF3CD', border: '1.5px solid #FDE68A', borderLeft: 'none' }} />
          <div className="flex-1 mx-1" style={{ borderTop: '2px dashed #FDE68A' }} />
          <div className="w-4 h-6 rounded-l-full -mr-px flex-shrink-0" style={{ background: '#FFF3CD', border: '1.5px solid #FDE68A', borderRight: 'none' }} />
        </div>

        <div className="px-5 pb-4 pt-3" style={{ background: '#FFFDF7' }}>
          <div className="text-center mb-4">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: '#9CA3AF' }}>Your Lucky Ticket</p>
            <div
              className="inline-block px-6 py-2.5 rounded-2xl"
              style={{ background: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', border: '1.5px solid #F59E0B' }}
            >
              <span className="text-[20px] font-black tracking-[0.05em] uppercase" style={{ color: '#92400E' }}>
                {entryId.slice(0, 8)}
              </span>
            </div>
          </div>

          <div className="h-px mb-4" style={{ background: '#FDE68A' }} />

          <div className="space-y-3">
            {[
              { label: 'Name', value: name },
              { label: 'Vehicle', value: modelName },
              { label: 'Colour', value: colourName },
              { label: 'Status', value: null },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider flex-shrink-0" style={{ color: '#9CA3AF' }}>{row.label}</span>
                {row.value ? (
                  <span className="text-[13px] font-bold text-gray-800 text-right leading-snug">{row.value}</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full" style={{ border: '1px solid #BBF7D0' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Confirmed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3 flex items-center justify-center gap-2" style={{ background: '#FEF9C3' }}>
          <Sparkle size={12} color="#D4930A" />
          <p className="text-[11px] font-bold" style={{ color: '#92400E' }}>Save this screenshot for reference</p>
          <Sparkle size={12} color="#D4930A" />
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mx-4 mb-6 flex gap-3 relative z-10"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => router.push('/')}
          className="flex-1 py-3.5 rounded-2xl text-[13px] font-bold transition-colors active:bg-amber-100"
          style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid #FDE68A', color: '#78350F' }}
        >
          ← Home
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Nippon Toyota Onam Lucky Draw',
                text: 'I just registered for the Nippon Toyota Onam Lucky Draw!',
                url: window.location.href,
              })
            }
          }}
          className="flex-1 py-3.5 rounded-2xl text-[13px] font-extrabold text-white transition-transform"
          style={{ background: 'linear-gradient(135deg,#B30010,#EB0A1E)' }}
        >
          Share 🎊
        </motion.button>
      </motion.div>

    </div>
  )
}
