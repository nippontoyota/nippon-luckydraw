import { redirect } from "next/navigation";
import { isAuthenticated, logout } from "@/app/actions/auth";
import { LogOut, ChevronDown } from "lucide-react";

import { AdminNav } from "@/components/admin/AdminNav";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

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
    <div className="min-h-screen flex text-gray-900 font-sans" style={{ background: '#FDF9F1' }}>
      <AutoRefresh interval={5000} />
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-amber-200/50 flex-col hidden md:flex relative overflow-hidden shadow-[4px_0_24px_rgba(212,147,10,0.05)]">
        <div className="h-16 flex items-center px-6 border-b border-amber-100 bg-amber-50/40">
          <img 
            src="https://dealer.toyotabharat.com/dealerV11/images/common/favicon.ico" 
            alt="Nippon Toyota" 
            className="w-6 h-6 mr-2 drop-shadow-sm"
          />
          <span className="text-[13px] font-bold tracking-[0.15em] uppercase text-[#92400E]">Nippon Toyota</span>
        </div>
        <AdminNav />
        <div className="p-4 border-t border-amber-100 bg-amber-50/20">
          <form action={logout}>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold text-gray-500 hover:bg-red-50 hover:text-red-700 w-full text-left transition-colors">
              <LogOut className="w-[18px] h-[18px] opacity-70" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/60 backdrop-blur-md border-b border-amber-200/40 flex items-center px-6 justify-between md:justify-end sticky top-0 z-10 shadow-sm">
          <div className="md:hidden flex items-center gap-2">
            <img src="https://dealer.toyotabharat.com/dealerV11/images/common/favicon.ico" alt="Nippon Toyota" className="w-5 h-5 drop-shadow-sm" />
            <span className="text-[12px] font-bold tracking-widest text-[#92400E] uppercase">Nippon Toyota</span>
          </div>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-amber-50 py-1.5 px-2 rounded-xl transition-colors -mr-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border" style={{ background: 'linear-gradient(135deg,#B30010 0%,#EB0A1E 100%)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>A</div>
            <span className="text-[14px] font-semibold text-[#92400E]">Admin</span>
            <ChevronDown className="w-4 h-4 text-amber-700/50" />
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
