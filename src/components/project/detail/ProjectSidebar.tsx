"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Code } from "lucide-react";
import type { Karya } from "@/types/karya";
import { formatNumber } from "@/lib/data";

interface ProjectSidebarProps {
  karya: Karya;
  categoryLabel: string;
  likeCount: number;
  linkConfig: { label: string; icon: React.ReactNode };
}

export default function ProjectSidebar({
  karya,
  categoryLabel,
  likeCount,
  linkConfig,
}: ProjectSidebarProps) {
  const team = karya.team ?? [];

  return (
    <div className="space-y-6">
      {/* Info Karya Card */}
      <motion.div
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="rounded-2xl bg-card border border-border p-6 shadow-xs"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Informasi Karya
        </h3>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Kategori</span>
            <span className="font-semibold text-foreground">{categoryLabel}</span>
          </div>
          {karya.created_at && (
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Diunggah</span>
              <span className="font-semibold text-foreground">
                {new Date(karya.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Total Views</span>
            <span className="font-semibold text-foreground">
              {formatNumber(karya.views ?? 0)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Total Apresiasi</span>
            <span className="font-semibold text-foreground">{formatNumber(likeCount)} Suka</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          {karya.live_url && (
            <a
              href={karya.live_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-[#ea580c] transition-all shadow-xs"
            >
              {linkConfig.icon}
              <span>{linkConfig.label}</span>
            </a>
          )}
          {karya.github_url && (
            <a
              href={karya.github_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-muted/60 border border-border text-foreground hover:bg-muted text-xs font-semibold hover:border-primary/40 transition-all"
            >
              <Code className="w-4 h-4 text-primary" />
              <span>Lihat Source Code</span>
            </a>
          )}
        </div>
      </motion.div>

      {/* Tim Pembuat Card */}
      {team.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="rounded-2xl bg-card border border-border p-6 shadow-xs"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>Tim Pembuat</span>
          </h3>
          <div className="flex flex-col gap-2.5">
            {team
              .filter((m: any) => m.status !== "rejected")
              .map((member: any) => (
                <Link
                  href={`/student/${member.user_id || `temp-${member.name}`}`}
                  key={member.user_id || member.name}
                >
                  <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border/70 hover:border-primary/40 hover:bg-muted/40 transition-all group">
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-border shrink-0 relative bg-muted">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary text-white flex items-center justify-center text-xs font-bold uppercase">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                          {member.name}
                        </p>
                        {member.status === "pending" && (
                          <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded-full shrink-0">
                            ⏳ Konfirmasi
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {member.role || "Project Lead"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

