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
    <nav className="flex-1 px-4 py-6 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-colors ${
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
