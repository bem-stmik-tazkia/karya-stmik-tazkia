"use client";

import React from "react";
import Link from "next/link";

export const HomeUploadCta: React.FC = () => {
  return (
    <section
      id="tentang"
      className="max-w-[1200px] mx-auto pt-4 sm:pt-6 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 box-border"
    >
      <div
        className="rounded-[22px] sm:rounded-[28px] p-6 sm:p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8 bg-[#1E3A8A] dark:bg-[#FF8A2B] text-white dark:text-[#1A0F05] shadow-[0_8px_0_#0F224A] sm:shadow-[0_10px_0_#0F224A] dark:shadow-[0_8px_0_#B35A12] sm:dark:shadow-[0_10px_0_#B35A12] transition-all"
      >
        <div className="flex-1 min-w-0">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-[40px] leading-[1.1] tracking-[-0.02em] text-white dark:text-[#1A0F05] mb-2 sm:mb-2.5">
            Punya karya yang layak dilihat?
          </h2>
          <p className="text-blue-100 dark:text-[#1A0F05]/90 text-sm sm:text-base md:text-[17px] leading-relaxed m-0 font-medium">
            Unggah proyekmu dan biarkan kampus mengenal kemampuanmu.
          </p>
        </div>

        <Link
          href="/submit"
          className="kt-btn inline-flex items-center justify-center gap-2.5 min-h-[52px] sm:min-h-[56px] w-full md:w-auto px-7 sm:px-8 rounded-[14px] bg-[#FF8A2B] hover:bg-[#ea580c] text-white dark:bg-[#0B1F4A] dark:hover:bg-[#122A5E] dark:text-white font-bold text-base transition-all shrink-0 active:translate-y-0 shadow-lg shadow-orange-500/25 dark:shadow-none text-center"
        >
          <span>Unggah karya</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 19V5"></path>
            <path d="m6 11 6-6 6 6"></path>
          </svg>
        </Link>
      </div>
    </section>
  );
};

