"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, FileText, Palette } from "lucide-react";
import { FlagBadge } from "./FlagBadge";

const navItems = [
  { href: "/admin/dashboard", label: "Draw Winners", icon: LayoutDashboard, badge: null },
  { href: "/admin/dashboard/branches", label: "Branches", icon: Store, badge: null },
  { href: "/admin/dashboard/entries", label: "Entries", icon: FileText, badge: "flags" },
  { href: "/admin/dashboard/models", label: "Models & Colours", icon: Palette, badge: null },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium rounded-xl transition-all ${
              isActive
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-gray-900" : "text-gray-400"}`} />
            <span className="flex-1">{item.label}</span>
            {item.badge === "flags" && <FlagBadge />}
          </Link>
        );
      })}
    </nav>
  );
}
