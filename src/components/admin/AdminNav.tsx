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
    <div className="flex items-center gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
              isActive
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
