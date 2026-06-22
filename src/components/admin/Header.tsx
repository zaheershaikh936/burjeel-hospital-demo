"use client";

import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const title = getPageTitle(pathname);

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

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </Button>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            AD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
