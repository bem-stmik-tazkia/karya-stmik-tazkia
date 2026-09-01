"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, FolderKanban, Database } from "lucide-react";

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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all border-2 ${
              isActive
                ? "bg-primary text-primary-foreground border-border shadow-[2px_2px_0px_0px_var(--color-border)]"
                : "bg-muted/50 text-muted-foreground border-transparent hover:border-border hover:bg-muted hover:text-foreground"
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
