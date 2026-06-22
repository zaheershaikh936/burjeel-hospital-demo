"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  DoorOpen,
  Palette,
  ClipboardList,
  Building2,
  LogOut,
} from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/branding", label: "Branding", icon: Palette },
  { href: "/audit", label: "Audit Logs", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  const { branding } = useBranding();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border h-screen sticky top-0 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        {branding.logo ? (
          <Image
            src={branding.logo}
            alt="Hospital Logo"
            width={40}
            height={40}
            className="object-contain rounded-lg"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: branding.primaryColor }}
          >
            <Building2 className="w-5 h-5 text-white" />
          </div>
        )}
        <div>
          <p className="font-bold text-sm text-foreground leading-tight">Burjeel</p>
          <p className="text-xs text-muted-foreground">Hospital Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              style={isActive ? { backgroundColor: branding.primaryColor } : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
