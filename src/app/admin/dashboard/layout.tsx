import { redirect } from "next/navigation";
import { isAuthenticated, logout } from "@/app/actions/auth";
import { LogOut, ChevronDown } from "lucide-react";

import { AdminNav } from "@/components/admin/AdminNav";

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
    <div className="min-h-screen bg-[#FDFDFD] flex text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
        <div className="h-14 flex items-center px-6 border-b border-gray-100">
          <span className="text-[13px] font-bold tracking-widest text-gray-900 uppercase">Nippon Toyota</span>
        </div>
        <AdminNav />
        <div className="p-3 border-t border-gray-100">
          <form action={logout}>
            <button className="flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 w-full text-left transition-colors">
              <LogOut className="w-[18px] h-[18px] text-gray-400" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 justify-between md:justify-end sticky top-0 z-10">
          <div className="md:hidden text-[13px] font-bold tracking-widest text-gray-900 uppercase">Nippon Toyota</div>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-2 rounded-md transition-colors -mr-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold border border-primary/20">A</div>
            <span className="text-[14px] font-medium text-gray-700">Admin</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-gray-50/30">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
