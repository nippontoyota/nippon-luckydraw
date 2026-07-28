"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entrySchema, type EntryInput } from "@/schemas/entry";
import { submitEntry } from "@/app/actions/entry";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ToyotaEmblem,
  ChevronDown,
  NilavilakkuLamp,
  Sparkle,
  PetalRain,
} from "./FestiveElements";

interface ModelWithColours {
  id: string;
  name: string;
  colours: { id: string; name: string }[];
}

interface EntryFormProps {
  branchId: string;
  branchName: string;
  models: ModelWithColours[];
}

const inputBase = (hasError: boolean) =>
  `w-full px-4 py-3.5 rounded-2xl text-[14px] font-medium border-2 transition-all bg-white outline-none ` +
  (hasError
    ? 'border-red-400'
    : 'border-amber-200 focus:border-[#EB0A1E] focus:shadow-[0_0_0_3px_rgba(235,10,30,0.12)]')

const selectBase = (hasError: boolean) =>
  inputBase(hasError) + ' appearance-none cursor-pointer ' +
  (hasError ? 'text-red-700' : 'text-gray-800')

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] font-bold mb-1.5 tracking-[0.12em] uppercase" style={{ color: '#92400E' }}>
        {label}
      </label>
      {children}
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-[11px] font-medium mt-1.5 flex items-center gap-1" 
          style={{ color: '#DC2626' }}
        >
          <span>⚠</span> {error}
        </motion.p>
      )}
    </div>
  )
}

export function EntryForm({ branchId, branchName, models }: EntryFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      name: "",
      phone: "",
      modelId: "",
      colourId: "",
      vin: "",
      branchId,
      honeypot: "",
    },
  });

  const selectedModelId = form.watch("modelId");
  const selectedModel = models.find((m) => m.id === selectedModelId);
  const availableColours = selectedModel?.colours || [];

  const onSubmit = async (data: EntryInput) => {
    setLoading(true);
    form.clearErrors("root");
    
    const result = await submitEntry(data);
    
    if ("error" in result) {
      form.setError("root", { message: result.error as string });
      setLoading(false);
    } else if ("id" in result) {
      router.push(`/confirmation/${result.id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative font-sans w-full max-w-[420px] mx-auto shadow-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg,#FFF8E1 0%,#FFF3CD 60%,#FFECB3 100%)' }}>
      <PetalRain />

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] h-[100dvh] w-screen flex flex-col items-center justify-center p-6 text-white overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1A0005 0%, #B30010 40%, #EB0A1E 100%)' }}
          >
            <PetalRain />
            {[
              { top: '10%', left: '10%', size: 10, color: '#FFD700', delay: '0s' },
              { top: '20%', left: '80%', size: 8, color: '#FFA000', delay: '0.6s' },
              { top: '70%', left: '15%', size: 7, color: '#FFD700', delay: '1.1s' },
              { top: '80%', left: '85%', size: 9, color: '#FF8F00', delay: '0.3s' },
              { top: '40%', left: '75%', size: 6, color: '#FFD700', delay: '1.8s' },
            ].map((s, i) => (
              <div key={i} className="absolute twinkle" style={{ top: s.top, left: s.left, animationDuration: `${1.6 + i * 0.4}s`, animationDelay: s.delay }}>
                <Sparkle size={s.size} color={s.color} />
              </div>
            ))}

            <div className="flex flex-col items-center justify-center relative z-10 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }} 
                className="mb-14 flex flex-col items-center justify-center gap-3"
              >
                <div className="relative h-14 w-14">
                  <Image src="/images/logo_for_customer_facing.png" alt="Toyota Emblem" fill sizes="56px" className="object-contain object-center" priority />
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-[11px] font-semibold tracking-[0.2em] uppercase">Nippon</p>
                  <p className="text-white text-[22px] font-black tracking-[0.1em] leading-none">TOYOTA</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.9 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                transition={{ delay: 0.2, duration: 0.6, type: "spring" }} 
                className="mb-14 relative"
              >
                <div className="pookalam-spin shadow-2xl" style={{ width: 160, height: 160, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,215,0,0.3)', position: 'relative' }}>
                  <Image src="/images/pookalam-generated.png" alt="Loading" fill sizes="160px" className="object-cover" priority />
                </div>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }} 
                className="text-white text-[22px] font-black tracking-widest uppercase mb-2"
              >
                Processing
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }} 
                className="text-white/80 text-[13px] font-medium shimmer-gold"
              >
                Please wait while we secure your entry...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.8 }} 
        className="relative overflow-hidden" 
        style={{ background: 'linear-gradient(160deg,#1A0005 0%,#6B0D1A 45%,#EB0A1E 100%)' }}
      >
        {[
          { top: 14, left: 18,  size: 10, color: '#FFD700', delay: '0s'   },
          { top: 28, left: 340, size: 8,  color: '#FFA000', delay: '0.6s' },
          { top: 60, left: 22,  size: 7,  color: '#FFD700', delay: '1.1s' },
          { top: 72, left: 355, size: 9,  color: '#FF8F00', delay: '0.3s' },
          { top: 44, left: 295, size: 6,  color: '#FFD700', delay: '1.8s' },
        ].map((s, i) => (
          <div key={i} className="absolute twinkle" style={{ top: s.top, left: s.left, animationDuration: `${1.6 + i * 0.4}s`, animationDelay: s.delay }}>
            <Sparkle size={s.size} color={s.color} />
          </div>
        ))}
        <div className="h-9" />
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="relative flex items-center justify-between px-5 pb-2"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8">
              <Image src="/images/logo_for_customer_facing.png" alt="Toyota Emblem" fill sizes="32px" className="object-contain" priority />
            </div>
            <div>
              <p className="text-white/60 text-[9px] font-semibold tracking-[0.2em] uppercase">Nippon</p>
              <p className="text-white text-[17px] font-black tracking-[0.1em] leading-none">TOYOTA</p>
            </div>
          </div>
          <div className="pookalam-spin opacity-90 flex-shrink-0 relative" style={{ width: 72, height: 72 }}>
            <Image src="/images/pookalam.png" alt="Onam pookalam" fill sizes="72px" className="object-cover" priority />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="relative mx-4 mt-2 rounded-2xl overflow-hidden flex-shrink-0" 
          style={{ height: 110 }}
        >
          <Image src="/images/onam-boat.png" alt="Happy Onam snake boat race" fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover object-center" priority />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(26,0,5,0.45) 0%,rgba(0,0,0,0) 60%)' }} />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <p className="text-white/80 text-[9px] font-semibold tracking-[0.2em] uppercase">Festival Offer</p>
            <p className="text-white text-[18px] font-black leading-tight">Lucky Draw</p>
            <p className="text-[10px] font-semibold mt-0.5 shimmer-gold">Win Exclusive Prizes!</p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
          className="px-5 pt-4 pb-2 flex items-end gap-3"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px flex-1" style={{ background: 'rgba(255,215,0,0.35)' }} />
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: '#FFD700' }}>Onam Festival 2026</p>
              <div className="h-px flex-1" style={{ background: 'rgba(255,215,0,0.35)' }} />
            </div>
            <h1 className="text-white text-[22px] font-black leading-tight">
              Enter &amp; Win<br />
              <span className="shimmer-gold" style={{ fontSize: 26 }}>Amazing Prizes!</span>
            </h1>
            <p className="text-white/65 text-[11px] mt-1.5 font-normal leading-relaxed">
              Fill in your vehicle details for a chance to win.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 pb-1">
            <NilavilakkuLamp size={28} />
            <NilavilakkuLamp size={28} />
          </div>
        </motion.div>
        <svg viewBox="0 0 390 22" className="w-full block" style={{ marginBottom: -1 }}>
          <path d="M0,22 C65,4 130,20 195,10 C260,0 325,18 390,6 L390,22 Z" fill="#FFF8E1" />
        </svg>
      </motion.div>

      {/* Form card */}
      <div className="relative z-10 mx-4 mt-3 mb-8 rounded-3xl overflow-visible">
        <motion.form
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.3, delay: 0.4 }}
          onSubmit={form.handleSubmit(onSubmit)}
          className="rounded-3xl p-5 shadow-xl"
          style={{
            background: 'rgba(255,255,255,0.97)',
            border: '1.5px solid rgba(245,166,35,0.3)',
            boxShadow: '0 8px 40px rgba(212,147,10,0.18), 0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <input type="text" {...form.register("honeypot")} className="absolute -left-[9999px] opacity-0 pointer-events-none" tabIndex={-1} aria-hidden="true" />
          
          <div className="flex items-center gap-2.5 mb-5 pb-4" style={{ borderBottom: '1px solid #FDE68A' }}>
            <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(180deg,#EB0A1E,#FF6B35)' }} />
            <div>
              <p className="text-[13px] font-extrabold text-gray-800">Registration Form</p>
              <p className="text-[11px] font-normal" style={{ color: '#92400E' }}>{branchName} Branch • Onam 2026</p>
            </div>
            <div className="ml-auto flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0 }} 
                  animate={{ opacity: i === 0 ? 1 : 0.6, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="w-2 h-2 rounded-full" 
                  style={{ background: i === 0 ? '#EB0A1E' : '#FDE68A' }} 
                />
              ))}
            </div>
          </div>

          <Field label="Full Name" error={form.formState.errors.name?.message}>
            <input
              type="text"
              placeholder="e.g. Priya Menon"
              {...form.register("name")}
              className={inputBase(!!form.formState.errors.name)}
            />
          </Field>

          <Field label="Mobile Number" error={form.formState.errors.phone?.message}>
            <div className="flex gap-2">
              <div
                className="flex items-center gap-1.5 px-3.5 rounded-2xl border-2 border-amber-200 bg-amber-50 text-[13px] font-bold text-gray-700 whitespace-nowrap"
                style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
              >
                🇮🇳 +91
              </div>
              <input
                type="tel"
                placeholder="98765 43210"
                maxLength={10}
                {...form.register("phone", {
                  onChange: (e) => e.target.value = e.target.value.replace(/\D/g, '')
                })}
                className={inputBase(!!form.formState.errors.phone) + ' flex-1'}
              />
            </div>
          </Field>

          <Field label="Vehicle Model" error={form.formState.errors.modelId?.message}>
            <div className="relative">
              <select
                {...form.register("modelId", {
                  onChange: () => {
                    form.setValue("colourId", "");
                    form.clearErrors("colourId");
                  }
                })}
                className={selectBase(!!form.formState.errors.modelId)}
              >
                <option value="">Select Model</option>
                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <ChevronDown />
            </div>
          </Field>

          <Field label="Colour" error={form.formState.errors.colourId?.message}>
            <div className="relative">
              <select
                {...form.register("colourId")}
                disabled={!selectedModelId}
                className={selectBase(!!form.formState.errors.colourId) + (!selectedModelId ? ' opacity-50' : '')}
              >
                <option value="">Select Colour</option>
                {availableColours.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown />
            </div>
          </Field>

          <Field label="Vehicle Identification Number (VIN)" error={form.formState.errors.vin?.message}>
            <input
              type="text"
              placeholder="17-character VIN"
              maxLength={17}
              {...form.register("vin", {
                onChange: (e) => e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
              })}
              className={inputBase(!!form.formState.errors.vin) + ' tracking-widest font-semibold uppercase'}
              style={{ fontFamily: "var(--font-mono)" }}
            />
            <p className="text-[10px] font-normal mt-1" style={{ color: '#A16207' }}>
              Found on your vehicle invoice or registration certificate.
            </p>
          </Field>

          {form.formState.errors.root && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="text-[13px] text-[#DC2626] font-medium bg-red-50 p-3 rounded-lg border border-red-200 mt-2 mb-2"
            >
              {form.formState.errors.root.message}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="btn-glow w-full py-4 mt-2 rounded-2xl text-white text-[15px] font-extrabold tracking-widest uppercase transition-transform"
            style={{ background: 'linear-gradient(135deg,#B30010 0%,#EB0A1E 55%,#FF3347 100%)', opacity: loading ? 0.8 : 1 }}
          >
            {loading ? "Registering..." : "Submit Entry →"}
          </motion.button>

          <div className="flex items-center justify-center gap-1.5 mt-3">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L7.5 4.5H11L8.5 6.5L9.5 10L6 8L2.5 10L3.5 6.5L1 4.5H4.5Z" fill="#D4930A" />
            </svg>
            <p className="text-[10px] font-medium" style={{ color: '#92400E' }}>
              Your information is secure with us
            </p>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L7.5 4.5H11L8.5 6.5L9.5 10L6 8L2.5 10L3.5 6.5L1 4.5H4.5Z" fill="#D4930A" />
            </svg>
          </div>
        </motion.form>
      </div>
    </div>
  )
}
