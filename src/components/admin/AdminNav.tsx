"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, Database, Wrench } from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Kelola Karya",
      href: "/admin/karya",
      icon: FolderKanban,
    },
    {
      label: "Data Master",
      href: "/admin/master",
      icon: Database,
    },
    {
      label: "Maintenance",
      href: "/admin/maintenance",
      icon: Wrench,
    },
  ];

  return (
    <nav className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border/60 shadow-2xs">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
              isActive
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
