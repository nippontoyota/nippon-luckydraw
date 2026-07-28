"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#FFF8E1 0%,#FFF3CD 60%,#FFECB3 100%)' }}
    >
      <div className="w-full max-w-[360px] space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <img 
            src="https://dealer.toyotabharat.com/dealerV11/images/common/favicon.ico" 
            alt="Nippon Toyota Favicon" 
            className="w-10 h-10 mx-auto drop-shadow-md"
          />
          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#92400E] uppercase mb-1">
              Nippon Toyota
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              Admin Sign In
            </h1>
          </div>
        </div>
        
        <div 
          className="bg-white rounded-[24px] p-6 sm:p-8"
          style={{
            border: '1.5px solid rgba(245,166,35,0.3)',
            boxShadow: '0 8px 40px rgba(212,147,10,0.18), 0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <form action={formAction} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: '#92400E' }}>Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="h-11 text-[14px] font-medium rounded-xl border-2 border-amber-200 focus:border-[#EB0A1E] focus:shadow-[0_0_0_3px_rgba(235,10,30,0.12)] transition-all bg-white outline-none"
                placeholder="admin@nippontoyota.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: '#92400E' }}>Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="h-11 text-[14px] font-medium rounded-xl border-2 border-amber-200 focus:border-[#EB0A1E] focus:shadow-[0_0_0_3px_rgba(235,10,30,0.12)] transition-all bg-white outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700/60 hover:text-amber-900 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {state?.error && (
              <div className="text-[13px] text-[#DC2626] font-medium bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-1.5">
                <span>⚠</span> {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn-glow w-full py-3.5 mt-2 rounded-xl text-white text-[14px] font-extrabold tracking-widest uppercase transition-transform active:scale-[0.97]"
              style={{ 
                background: 'linear-gradient(135deg,#B30010 0%,#EB0A1E 55%,#FF3347 100%)', 
                opacity: isPending ? 0.8 : 1 
              }}
            >
              {isPending ? "Signing in..." : "Sign in →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
