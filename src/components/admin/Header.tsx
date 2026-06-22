"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/rooms": "Room Management",
  "/rooms/add": "Add New Room",
  "/branding": "Branding Settings",
  "/audit": "Audit Logs",
};

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/rooms/edit/")) return "Edit Room";
  return PAGE_TITLES[pathname] ?? "Admin Panel";
}

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const title = getPageTitle(pathname);

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "AD";

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Hospital Room Display System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <Badge
            variant="outline"
            className="hidden sm:inline-flex text-xs capitalize"
          >
            {user.role === "super_admin" ? "Super Admin" : "Admin"}
          </Badge>
        )}
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
