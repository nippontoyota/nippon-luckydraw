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
            className={`flex items-center gap-3 px-3 py-2 text-[14px] font-medium rounded-md transition-colors ${
              isActive 
                ? "bg-gray-100 text-gray-900" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Icon className={`w-[18px] h-[18px] ${isActive ? "text-primary" : "text-gray-400"}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
