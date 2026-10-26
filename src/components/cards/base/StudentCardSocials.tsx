"use client";

import React from "react";
import { Globe } from "lucide-react";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "../SocialIcons";
import type { StudentCardData } from "./types";

interface StudentCardSocialsProps {
  socials?: StudentCardData["socials"];
}

export const StudentCardSocials: React.FC<StudentCardSocialsProps> = ({ socials }) => {
  return (
    <div className="flex items-center gap-1.5 pt-2" onClick={(e) => e.stopPropagation()}>
      {/* Globe / Website */}
      <button
        type="button"
        disabled={!socials?.website}
        onClick={() => {
          if (socials?.website) {
            window.open(socials.website, "_blank");
          }
        }}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
          socials?.website
            ? "bg-sky-500 border border-sky-400 text-white shadow-xs hover:bg-sky-600 hover:scale-110 active:scale-95 dark:bg-sky-500/30 dark:border-sky-400 dark:text-sky-300 dark:shadow-[0_0_12px_rgba(56,189,248,0.4)] cursor-pointer"
            : "border border-dashed border-slate-300/80 bg-slate-100/40 text-slate-300 dark:border-slate-700/60 dark:bg-slate-800/20 dark:text-slate-600 opacity-40 cursor-not-allowed"
        }`}
        aria-label="Website"
        title={socials?.website ? `Buka Website: ${socials.website}` : "Website belum ditautkan"}
      >
        <Globe className="w-3.5 h-3.5" />
      </button>

      {/* GitHub */}
      <button
        type="button"
        disabled={!socials?.github}
        onClick={() => {
          if (socials?.github) {
            const url = socials.github.startsWith("http")
              ? socials.github
              : `https://github.com/${socials.github.replace(/^@/, "")}`;
            window.open(url, "_blank");
          }
        }}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
          socials?.github
            ? "bg-[#181717] border border-slate-900 text-white shadow-xs hover:bg-black hover:scale-110 active:scale-95 dark:bg-white/20 dark:border-white/60 dark:text-white dark:hover:bg-white/30 dark:shadow-[0_0_12px_rgba(255,255,255,0.35)] cursor-pointer"
            : "border border-dashed border-slate-300/80 bg-slate-100/40 text-slate-300 dark:border-slate-700/60 dark:bg-slate-800/20 dark:text-slate-600 opacity-40 cursor-not-allowed"
        }`}
        aria-label="GitHub"
        title={socials?.github ? `Buka GitHub: ${socials.github}` : "GitHub belum ditautkan"}
      >
        <GithubIcon className="w-3.5 h-3.5" />
      </button>

      {/* LinkedIn */}
      <button
        type="button"
        disabled={!socials?.linkedin}
        onClick={() => {
          if (socials?.linkedin) {
            const url = socials.linkedin.startsWith("http")
              ? socials.linkedin
              : `https://linkedin.com/in/${socials.linkedin.replace(/^@/, "")}`;
            window.open(url, "_blank");
          }
        }}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
          socials?.linkedin
            ? "bg-[#0a66c2] border border-[#0a66c2] text-white shadow-xs hover:bg-[#084e96] hover:scale-110 active:scale-95 dark:bg-blue-600/30 dark:border-blue-400 dark:text-blue-300 dark:shadow-[0_0_12px_rgba(59,130,246,0.4)] cursor-pointer"
            : "border border-dashed border-slate-300/80 bg-slate-100/40 text-slate-300 dark:border-slate-700/60 dark:bg-slate-800/20 dark:text-slate-600 opacity-40 cursor-not-allowed"
        }`}
        aria-label="LinkedIn"
        title={socials?.linkedin ? `Buka LinkedIn: ${socials.linkedin}` : "LinkedIn belum ditautkan"}
      >
        <LinkedinIcon className="w-3.5 h-3.5" />
      </button>

      {/* Instagram */}
      <button
        type="button"
        disabled={!socials?.instagram}
        onClick={() => {
          if (socials?.instagram) {
            const url = socials.instagram.startsWith("http")
              ? socials.instagram
              : `https://instagram.com/${socials.instagram.replace(/^@/, "")}`;
            window.open(url, "_blank");
          }
        }}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
          socials?.instagram
            ? "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] border border-transparent text-white shadow-xs hover:opacity-90 hover:scale-110 active:scale-95 dark:bg-pink-600/30 dark:border-pink-400 dark:text-pink-300 dark:shadow-[0_0_12px_rgba(244,63,94,0.4)] cursor-pointer"
            : "border border-dashed border-slate-300/80 bg-slate-100/40 text-slate-300 dark:border-slate-700/60 dark:bg-slate-800/20 dark:text-slate-600 opacity-40 cursor-not-allowed"
        }`}
        aria-label="Instagram"
        title={socials?.instagram ? `Buka Instagram: ${socials.instagram}` : "Instagram belum ditautkan"}
      >
        <InstagramIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

