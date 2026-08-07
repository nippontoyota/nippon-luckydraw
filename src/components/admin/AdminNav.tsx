"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, FileText, Palette } from "lucide-react";
import { FlagBadge } from "./FlagBadge";

export const adminNavItems = [
  { href: "/admin/dashboard", label: "Draw", fullLabel: "Draw Winners", icon: LayoutDashboard, badge: null as "flags" | null },
  { href: "/admin/dashboard/branches", label: "Branches", fullLabel: "Branches", icon: Store, badge: null },
  { href: "/admin/dashboard/entries", label: "Entries", fullLabel: "Entries", icon: FileText, badge: "flags" as const },
  { href: "/admin/dashboard/models", label: "Models", fullLabel: "Models & Colours", icon: Palette, badge: null },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 px-3 py-4" aria-label="Admin">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15 ${
              isActive
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-gray-400"}`}
              aria-hidden
            />
            <span className="flex-1 truncate">{item.fullLabel}</span>
            {item.badge === "flags" && <FlagBadge />}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
      aria-label="Admin mobile"
    >
      <div className="grid h-14 grid-cols-4">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-900/15 ${
                isActive ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {isActive && (
                <span
                  className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-gray-900"
                  aria-hidden
                />
              )}
              <Icon
                className={`h-5 w-5 ${isActive ? "text-gray-900" : "text-gray-400"}`}
                aria-hidden
              />
              <span>{item.label}</span>
              {item.badge === "flags" && (
                <span className="absolute right-[calc(50%-18px)] top-1">
                  <FlagBadge />
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
