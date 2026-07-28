import { redirect } from "next/navigation";
import { isAuthenticated, logout } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-black text-primary tracking-tighter">NIPPON TOYOTA</span>
        </div>
          <AdminNav />
          <div className="p-4 border-t border-gray-200">
          <form action={logout}>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 font-medium w-full text-left">
              <LogOut className="w-5 h-5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between md:justify-end">
          <div className="md:hidden font-black text-primary">NIPPON TOYOTA</div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Admin</span>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">A</div>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
