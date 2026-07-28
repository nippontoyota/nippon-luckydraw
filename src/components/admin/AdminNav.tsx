"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, FileText } from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard/branches", label: "Branches", icon: Store },
  { href: "/admin/dashboard/entries", label: "Entries", icon: FileText },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`flex items-center gap-3 px-3 py-2.5 text-[14px] font-semibold rounded-xl transition-all ${
              isActive 
                ? "bg-amber-50 text-[#92400E] shadow-[0_0_0_1px_rgba(251,191,36,0.3)]" 
                : "text-gray-500 hover:bg-amber-50/50 hover:text-gray-900"
            }`}
          >
            <Icon className={`w-[18px] h-[18px] ${isActive ? "text-[#EB0A1E]" : "text-gray-400"}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
