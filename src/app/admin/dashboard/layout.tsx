import { redirect } from "next/navigation";
import { isAuthenticated, logout } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

import { AdminNav, AdminMobileNav } from "@/components/admin/AdminNav";
import { SupabaseRealtime } from "@/components/admin/SupabaseRealtime";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-zinc-50 font-sans text-gray-900">
      <SupabaseRealtime />

      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200/80 bg-white md:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-gray-200/80 px-5">
          <img
            src="https://dealer.toyotabharat.com/dealerV11/images/common/favicon.ico"
            alt=""
            className="h-5 w-5"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-gray-900">
              Nippon Toyota
            </p>
            <p className="text-[11px] leading-tight text-gray-500">Lucky Draw Admin</p>
          </div>
        </div>
        <AdminNav />
        <div className="border-t border-gray-200/80 p-3">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-600 transition-[background-color,color,transform] duration-150 ease-out hover:bg-red-50 hover:text-red-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20"
            >
              <LogOut className="h-4 w-4 shrink-0 opacity-70" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200/80 bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 md:hidden">
            <img
              src="https://dealer.toyotabharat.com/dealerV11/images/common/favicon.ico"
              alt=""
              className="h-5 w-5 shrink-0"
            />
            <span className="truncate text-sm font-semibold text-gray-900">Lucky Draw Admin</span>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white">
              A
            </div>
            <span className="hidden text-sm font-medium text-gray-700 sm:inline">Admin</span>
            <form action={logout} className="md:hidden">
              <button
                type="submit"
                className="ml-1 rounded-lg p-2 text-gray-500 transition-[background-color,color,transform] duration-150 ease-out hover:bg-red-50 hover:text-red-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 pb-20 sm:p-6 md:p-8 md:pb-8">
          <div className="mx-auto w-full min-w-0 max-w-6xl">{children}</div>
        </main>
      </div>

      <AdminMobileNav />
    </div>
  );
}
