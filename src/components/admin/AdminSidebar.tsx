"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  LogOut,
  ChevronRight,
  Store,
  Settings,
  Users,
  Ticket,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
      { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Categories", href: "/admin/categories", icon: Tag },
    ],
  },
  {
    label: "Customer & Marketing",
    items: [
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Coupons", href: "/admin/coupons", icon: Ticket },
    ],
  },
  {
    label: "Configuration",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact = false) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#E91E8C] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black">DW</span>
          </div>
          <div>
            <span className="font-extrabold text-white text-sm block leading-tight">
              DevWonder Fashion
            </span>
            <span className="text-gray-500 font-normal text-xs">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-600 px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, (item as any).exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      active
                        ? "bg-[#E91E8C] text-white shadow-lg shadow-pink-900/30"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                    {active && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          <Store className="h-4 w-4" />
          View Store
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
