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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-4 py-12 font-sans">
      <div className="w-full max-w-[360px] space-y-8">
        <div className="space-y-3 text-center">
          <img
            src="https://dealer.toyotabharat.com/dealerV11/images/common/favicon.ico"
            alt=""
            className="mx-auto h-9 w-9"
          />
          <div>
            <p className="mb-1 text-xs font-medium tracking-wide text-gray-500">Nippon Toyota</p>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">Admin sign in</h1>
            <p className="mt-1 text-sm text-gray-600">Lucky draw management</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="h-10 text-sm"
                placeholder="admin@nippontoyota.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="h-10 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition-[color,transform] duration-150 ease-out hover:text-gray-700 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {state?.error && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
                role="alert"
              >
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-1 h-10 w-full rounded-lg bg-gray-900 text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-gray-800 active:scale-[0.98] disabled:opacity-70"
            >
              {isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
