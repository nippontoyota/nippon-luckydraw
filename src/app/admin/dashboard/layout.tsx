import { redirect } from "next/navigation";
import { isAuthenticated, logout } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

import { AdminNav } from "@/components/admin/AdminNav";
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
    <div className="h-screen overflow-hidden flex text-gray-900 font-sans bg-gray-50">
      <SupabaseRealtime />
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex relative overflow-hidden shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 bg-gray-50/50">
          <img 
            src="https://dealer.toyotabharat.com/dealerV11/images/common/favicon.ico" 
            alt="Nippon Toyota" 
            className="w-6 h-6 mr-2"
          />
          <span className="text-[14px] font-semibold text-gray-900">Nippon Toyota</span>
        </div>
        <AdminNav />
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
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
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center px-6 justify-between md:justify-end sticky top-0 z-10 shadow-sm">
          <div className="md:hidden flex items-center gap-2">
            <img src="https://dealer.toyotabharat.com/dealerV11/images/common/favicon.ico" alt="Nippon Toyota" className="w-5 h-5" />
            <span className="text-[14px] font-semibold text-gray-900">Nippon Toyota</span>
          </div>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 py-1.5 px-2 rounded-xl transition-colors -mr-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold bg-gray-900 text-white">A</div>
            <span className="text-[14px] font-medium text-gray-900">Admin</span>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
