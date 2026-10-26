"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Globe,
  GraduationCap,
  Share2,
  Edit,
  CreditCard,
} from "lucide-react";
import { FiInstagram } from "react-icons/fi";
import { normalizeStatusBadge } from "@/app/student/page";
import { getTechTagColor } from "@/utils/techTagColor";

export interface ProfileViewData {
  id?: string;
  user_id?: string;
  full_name: string;
  email?: string;
  contact_email?: string;
  prodi?: string;
  angkatan?: number | string;
  avatar_url?: string;
  bio?: string;
  skills?: string[] | null;
  status_badge?: string;
  github_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  website_url?: string;
  followers_count?: number;
  following_count?: number;
  card_skin?: string;
  cardSkin?: string;
}

interface DashboardProfileHeaderProps {
  profile: ProfileViewData;
  activeSkin: any;
  validSkills: string[];
  isOwnProfile: boolean;
  onOpenSkinModal: () => void;
  onOpenShareModal: () => void;
}

export function DashboardProfileHeader({
  profile,
  activeSkin,
  validSkills,
  isOwnProfile,
  onOpenSkinModal,
  onOpenShareModal,
}: DashboardProfileHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-2xl mb-10 relative overflow-hidden shadow-xs"
    >
      {/* Solid Header Banner with Signature Accent Border */}
      <div
        className="relative h-28 sm:h-36 px-6 sm:px-8 pt-5 flex items-start justify-between overflow-hidden border-b-4 transition-all duration-300"
        style={{
          background: activeSkin.headerGradient,
          borderBottomColor: activeSkin.headerBorderColor,
        }}
      >
        {/* 1. BEM 2026 HEADER ANIMATION */}
        {activeSkin.id === "bem2026" && (
          <>
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#f59e0b_1.2px,transparent_1.2px)] [background-size:14px_14px] animate-pulse pointer-events-none" />
            <div className="absolute -right-8 -top-10 w-52 h-52 bg-gradient-to-bl from-amber-400/35 via-orange-500/20 to-transparent rounded-full blur-xl animate-pulse pointer-events-none" />
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-200/25 to-transparent -skew-x-12 bem-shimmer-sweep pointer-events-none" />
          </>
        )}

        {/* 2. RISTEK BLUE V2.0 (QUANTUM CYBER ARCHITECT) */}
        {activeSkin.id === "ristekA" && (
          <>
            <div className="absolute inset-0 opacity-35 bg-[linear-gradient(to_right,#00f0ff_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:16px_16px] cyber-grid-pan pointer-events-none" />
            <div className="absolute left-1/4 -bottom-10 w-48 h-48 bg-[#00f0ff]/30 rounded-full blur-2xl animate-pulse pointer-events-none" />
            <div className="absolute -right-6 -top-8 w-48 h-40 bg-blue-500/35 rounded-full blur-2xl animate-pulse pointer-events-none" />
            <div className="absolute right-12 bottom-0 w-28 h-28 bg-orange-500/25 rounded-full blur-xl pointer-events-none" />
            <div className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-[#00f0ff]/35 to-transparent -skew-x-12 cyber-laser-scan pointer-events-none" />
            <svg
              className="absolute inset-0 w-full h-full opacity-85 pointer-events-none"
              viewBox="0 0 600 130"
              preserveAspectRatio="none"
              fill="none"
            >
              <path d="M140 105 H280 L315 74 H455 L495 45 H595" stroke="#0369a1" strokeWidth="1.5" />
              <path
                d="M140 105 H280 L315 74 H455 L495 45 H595"
                stroke="#00f0ff"
                strokeWidth="2.5"
                strokeDasharray="28 140"
                className="pcb-packet-flow"
              />
              <path d="M190 116 H340 L375 88 H540" stroke="#1e3a8a" strokeWidth="1.2" />
              <path
                d="M190 116 H340 L375 88 H540"
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray="18 150"
                className="pcb-packet-flow-reverse"
              />
              <circle cx="280" cy="105" r="3" fill="#00f0ff" />
              <circle cx="315" cy="74" r="3.5" fill="#38bdf8" className="animate-ping" />
              <circle cx="315" cy="74" r="2.5" fill="#ffffff" />
              <circle cx="455" cy="74" r="3" fill="#00f0ff" />
              <circle cx="495" cy="45" r="4" fill="#f97316" />
            </svg>
            <span className="absolute left-32 bottom-2.5 text-[8px] font-mono font-bold text-cyan-300/75 float-sparkle-1 select-none pointer-events-none">
              0101
            </span>
            <span className="absolute right-32 top-11 text-[8px] font-mono font-bold text-sky-300/80 float-sparkle-2 select-none pointer-events-none">
              &lt;BLD/&gt;
            </span>
            <span className="absolute right-8 bottom-5 text-[7px] font-mono font-bold text-orange-300/85 float-sparkle-3 select-none pointer-events-none">
              SYS.26
            </span>
          </>
        )}

        {/* 3. RISTEK BLUE V2.0 ULTRA (MECHA SAPPHIRE OVERDRIVE) */}
        {activeSkin.id === "ristekB" && (
          <>
            <div className="absolute inset-0 opacity-35 bg-[radial-gradient(#00f0ff_1.5px,transparent_1.5px),radial-gradient(#3b82f6_1.5px,#020617_1.5px)] [background-size:18px_18px] [background-position:0_0,9px_9px] cyber-grid-pan pointer-events-none" />
            <div className="absolute inset-0 opacity-25 bg-[linear-gradient(to_right,#00f0ff_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:20px_20px] cyber-grid-pan pointer-events-none" />
            <div className="absolute -right-10 -bottom-14 w-48 h-48 rounded-full border-2 border-dashed border-cyan-400/40 spin-slow pointer-events-none" />
            <div className="absolute -right-4 -bottom-8 w-36 h-36 rounded-full border border-sky-300/35 spin-reverse-slow pointer-events-none" />
            <div className="absolute inset-x-10 -bottom-10 h-28 bg-gradient-to-r from-blue-600/45 via-[#00f0ff]/45 to-orange-500/35 blur-2xl animate-pulse pointer-events-none" />
            <div className="absolute inset-0 w-2/3 h-full bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent -skew-x-12 bem-shimmer-sweep pointer-events-none" />
            <svg
              className="absolute inset-0 w-full h-full opacity-90 pointer-events-none"
              viewBox="0 0 600 130"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M135 96 L230 96 L265 68 L410 68 L445 92 L580 92"
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M135 96 L230 96 L265 68 L410 68 L445 92 L580 92"
                stroke="#00f0ff"
                strokeWidth="2.8"
                strokeDasharray="32 140"
                className="pcb-packet-flow"
              />
              <g transform="translate(340, 68)">
                <circle cx="0" cy="0" r="9" stroke="#00f0ff" strokeWidth="1.3" strokeOpacity="0.65" />
                <circle cx="0" cy="0" r="3" fill="#f97316" />
              </g>
            </svg>
            <div className="absolute bottom-0 inset-x-0 h-[5px] opacity-95 bg-[repeating-linear-gradient(90deg,#00f0ff,#00f0ff_12px,#020617_12px,#020617_20px,#f97316_20px,#f97316_26px,#020617_26px,#020617_34px)] forge-stripe-slide pointer-events-none" />
          </>
        )}

        <div className="relative z-10 flex flex-wrap items-center justify-center sm:justify-start w-full gap-2">
          {profile.angkatan && (
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-white/15 text-white backdrop-blur-sm border border-white/10 shadow-xs">
              ANGKATAN {profile.angkatan}
            </span>
          )}
          {profile.status_badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/10 shadow-xs">
              <span
                className="w-2 h-2 rounded-full shrink-0 g-pulse"
                style={{ backgroundColor: activeSkin.statusDotColor }}
                aria-hidden="true"
              />
              <span>{normalizeStatusBadge(profile.status_badge)}</span>
            </span>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-8 pt-0 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          {/* Circular Avatar with Static Skin Ring */}
          <div className="relative -mt-14 sm:-mt-18 shrink-0">
            <div
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1.5 shadow-xl shadow-orange-500/25 flex items-center justify-center transition-all duration-300"
              style={{ background: activeSkin.avatarRingStyle }}
            >
              <div className="w-full h-full rounded-full border-4 border-card bg-slate-900 text-white flex items-center justify-center overflow-hidden relative">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#FF8A2B] text-white flex items-center justify-center text-4xl sm:text-5xl font-extrabold uppercase font-serif">
                    {profile.full_name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="text-center md:text-left flex-1 w-full pt-2 sm:pt-4">
            {/* Name */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-1.5">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground break-words">
                {profile.full_name}
              </h1>
            </div>

            {/* Prodi */}
            {profile.prodi && (
              <div className="flex items-center justify-center md:justify-start gap-1.5 text-sm sm:text-base text-primary font-semibold mb-4">
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>{profile.prodi}</span>
              </div>
            )}

            {/* Bio */}
            <p className="text-xs sm:text-sm text-muted-foreground font-normal max-w-2xl mb-6 leading-relaxed">
              {profile.bio || "Mahasiswa kreatif STMIK Tazkia."}
            </p>

            {/* Skills */}
            {validSkills.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5 sm:gap-2 mb-6 max-w-xl mx-auto md:mx-0">
                {validSkills.map((skill, i) => {
                  const colorClass = getTechTagColor(skill);
                  return (
                    <span
                      key={`${skill}-${i}`}
                      className={`inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium border transition-all shadow-2xs hover:scale-105 cursor-default ${colorClass}`}
                    >
                      {skill}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              {isOwnProfile && (
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-[#ea580c] shadow-xs hover:shadow-md hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profil</span>
                </Link>
              )}

              {/* Tombol Tema Kartu */}
              <button
                type="button"
                onClick={onOpenSkinModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs sm:text-sm font-semibold hover:border-primary/40 hover:bg-muted hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-xs cursor-pointer"
                title="Preview Tema Kartu"
              >
                <CreditCard className="w-4 h-4 text-primary" />
                <span>Tema Kartu</span>
              </button>

              <button
                type="button"
                onClick={onOpenShareModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs sm:text-sm font-semibold hover:bg-muted hover:border-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-xs cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan</span>
              </button>

              {/* 4 Social Icons */}
              <div className="flex gap-1.5 ml-0 sm:ml-1">
                {profile.website_url ? (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF8A2B] hover:bg-[#FF8A2B] hover:text-white hover:border-[#FF8A2B] transition-all shadow-xs"
                    aria-label="Portfolio / Website"
                    title="Website / Portofolio"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                ) : (
                  <span
                    className="w-9 h-9 rounded-lg border border-border/80 bg-muted/60 flex items-center justify-center text-muted-foreground/70 cursor-not-allowed shadow-2xs"
                    title="Website / Portofolio belum ditautkan"
                    aria-label="Website / Portofolio belum ditautkan"
                  >
                    <Globe className="w-4 h-4" />
                  </span>
                )}

                {/* LinkedIn */}
                {profile.linkedin_url ? (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-all shadow-xs"
                    aria-label="LinkedIn"
                    title="LinkedIn"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.761-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                ) : (
                  <span
                    className="w-9 h-9 rounded-lg border border-border/80 bg-muted/60 flex items-center justify-center text-muted-foreground/70 cursor-not-allowed shadow-2xs"
                    title="LinkedIn belum ditautkan"
                    aria-label="LinkedIn belum ditautkan"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.761-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </span>
                )}

                {/* GitHub */}
                {profile.github_url ? (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-[#333] hover:text-white hover:border-[#333] transition-all shadow-xs"
                    aria-label="GitHub"
                    title="GitHub"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                  </a>
                ) : (
                  <span
                    className="w-9 h-9 rounded-lg border border-border/80 bg-muted/60 flex items-center justify-center text-muted-foreground/70 cursor-not-allowed shadow-2xs"
                    title="GitHub belum ditautkan"
                    aria-label="GitHub belum ditautkan"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                  </span>
                )}

                {/* Instagram */}
                {profile.instagram_url ? (
                  <a
                    href={profile.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-[#E4405F] hover:text-white hover:border-[#E4405F] transition-all shadow-xs"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <FiInstagram className="w-4 h-4" />
                  </a>
                ) : (
                  <span
                    className="w-9 h-9 rounded-lg border border-border/80 bg-muted/60 flex items-center justify-center text-muted-foreground/70 cursor-not-allowed shadow-2xs"
                    title="Instagram belum ditautkan"
                    aria-label="Instagram belum ditautkan"
                  >
                    <FiInstagram className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

