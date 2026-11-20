"use client";

import React from "react";
import { Globe } from "lucide-react";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "../SocialIcons";
import type { StudentCardData } from "./types";
import { normalizeSocialUrl } from "@/lib/safeUrl";

interface StudentCardSocialsProps {
  socials?: StudentCardData["socials"];
}

export const StudentCardSocials: React.FC<StudentCardSocialsProps> = ({ socials }) => {
  const safeWebsite = normalizeSocialUrl(socials?.website, "website");
  const safeGithub = normalizeSocialUrl(socials?.github, "github");
  const safeLinkedin = normalizeSocialUrl(socials?.linkedin, "linkedin");
  const safeInstagram = normalizeSocialUrl(socials?.instagram, "instagram");

  return (
    <div className="flex items-center gap-1.5 pt-2" onClick={(e) => e.stopPropagation()}>
      {/* Globe / Website */}
      <button
        type="button"
        disabled={!safeWebsite}
        onClick={() => {
          if (safeWebsite) {
            window.open(safeWebsite, "_blank");
          }
        }}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
          safeWebsite
            ? "bg-sky-500 border border-sky-400 text-white shadow-xs hover:bg-sky-600 hover:scale-110 active:scale-95 dark:bg-sky-500/30 dark:border-sky-400 dark:text-sky-300 dark:shadow-[0_0_12px_rgba(56,189,248,0.4)] cursor-pointer"
            : "border border-dashed border-slate-300/80 bg-slate-100/40 text-slate-300 dark:border-slate-700/60 dark:bg-slate-800/20 dark:text-slate-600 opacity-40 cursor-not-allowed"
        }`}
        aria-label="Website"
        title={safeWebsite ? `Buka Website: ${safeWebsite}` : "Website belum ditautkan"}
      >
        <Globe className="w-3.5 h-3.5" />
      </button>

      {/* GitHub */}
      <button
        type="button"
        disabled={!safeGithub}
        onClick={() => {
          if (safeGithub) {
            window.open(safeGithub, "_blank");
          }
        }}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
          safeGithub
            ? "bg-[#181717] border border-slate-900 text-white shadow-xs hover:bg-black hover:scale-110 active:scale-95 dark:bg-white/20 dark:border-white/60 dark:text-white dark:hover:bg-white/30 dark:shadow-[0_0_12px_rgba(255,255,255,0.35)] cursor-pointer"
            : "border border-dashed border-slate-300/80 bg-slate-100/40 text-slate-300 dark:border-slate-700/60 dark:bg-slate-800/20 dark:text-slate-600 opacity-40 cursor-not-allowed"
        }`}
        aria-label="GitHub"
        title={safeGithub ? `Buka GitHub: ${safeGithub}` : "GitHub belum ditautkan"}
      >
        <GithubIcon className="w-3.5 h-3.5" />
      </button>

      {/* LinkedIn */}
      <button
        type="button"
        disabled={!safeLinkedin}
        onClick={() => {
          if (safeLinkedin) {
            window.open(safeLinkedin, "_blank");
          }
        }}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
          safeLinkedin
            ? "bg-[#0a66c2] border border-[#0a66c2] text-white shadow-xs hover:bg-[#084e96] hover:scale-110 active:scale-95 dark:bg-blue-600/30 dark:border-blue-400 dark:text-blue-300 dark:shadow-[0_0_12px_rgba(59,130,246,0.4)] cursor-pointer"
            : "border border-dashed border-slate-300/80 bg-slate-100/40 text-slate-300 dark:border-slate-700/60 dark:bg-slate-800/20 dark:text-slate-600 opacity-40 cursor-not-allowed"
        }`}
        aria-label="LinkedIn"
        title={safeLinkedin ? `Buka LinkedIn: ${safeLinkedin}` : "LinkedIn belum ditautkan"}
      >
        <LinkedinIcon className="w-3.5 h-3.5" />
      </button>

      {/* Instagram */}
      <button
        type="button"
        disabled={!safeInstagram}
        onClick={() => {
          if (safeInstagram) {
            window.open(safeInstagram, "_blank");
          }
        }}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
          safeInstagram
            ? "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] border border-transparent text-white shadow-xs hover:opacity-90 hover:scale-110 active:scale-95 dark:bg-pink-600/30 dark:border-pink-400 dark:text-pink-300 dark:shadow-[0_0_12px_rgba(244,63,94,0.4)] cursor-pointer"
            : "border border-dashed border-slate-300/80 bg-slate-100/40 text-slate-300 dark:border-slate-700/60 dark:bg-slate-800/20 dark:text-slate-600 opacity-40 cursor-not-allowed"
        }`}
        aria-label="Instagram"
        title={safeInstagram ? `Buka Instagram: ${safeInstagram}` : "Instagram belum ditautkan"}
      >
        <InstagramIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

