"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

const ALL_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "admin"] },
  { href: "/rooms",     label: "Rooms",      icon: DoorOpen,         roles: ["super_admin", "admin"] },
  { href: "/branding",  label: "Branding",   icon: Palette,          roles: ["super_admin"] },
  { href: "/audit",     label: "Audit Logs", icon: ClipboardList,    roles: ["super_admin"] },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { branding } = useBranding();
  const { user, logout } = useAuth();

  const navItems = ALL_NAV_ITEMS.filter((item) =>
    user ? (item.roles as readonly string[]).includes(user.role) : false
  );

  function handleSignOut() {
    logout();
    router.push("/");
  }

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
        {navItems.map(({ href, label, icon: Icon }) => {
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

      {/* User info + Sign out */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {user.role === "super_admin" ? "Super Admin" : "Admin"}
            </p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
