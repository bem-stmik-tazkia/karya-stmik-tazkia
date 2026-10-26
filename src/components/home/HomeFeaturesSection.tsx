"use client";

import React from "react";
import { LayoutGrid, Users, BadgeCheck } from "lucide-react";

export const HomeFeaturesSection: React.FC = () => {
  return (
    <section
      id="fitur"
      className="max-w-[1200px] mx-auto py-10 sm:py-14 px-4 sm:px-6 lg:px-8 box-border"
    >
      <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-[40px] tracking-[-0.02em] text-slate-900 dark:text-[#F2F5FA] mb-6 sm:mb-8 max-w-[640px] leading-tight">
        Lebih dari sekadar galeri.
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {/* Card 1: Portofolio Rapi */}
        <div className="kt-card bg-white dark:bg-[#0E1D3F] border border-slate-200/90 dark:border-[#1D3A73] rounded-[22px] p-6 sm:p-7 box-border shadow-md shadow-slate-900/5 dark:shadow-none">
          <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] border border-[#1E3A8A] dark:bg-[#132854] dark:border-[#1E3E7A] text-[#FF8A2B] flex items-center justify-center mb-5 shadow-sm">
            <LayoutGrid className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="font-heading font-bold text-xl sm:text-[22px] text-slate-900 dark:text-[#F2F5FA] mb-2">
            Portofolio rapi
          </h3>
          <p className="text-slate-600 dark:text-[#94A9C9] text-sm sm:text-[15px] leading-relaxed m-0">
            Setiap karya punya halaman tersendiri lengkap dengan tech stack,
            tautan repositori GitHub, dan demo interaktif langsung.
          </p>
        </div>

        {/* Card 2: Direktori Mahasiswa */}
        <div
          id="mahasiswa"
          className="kt-card bg-white dark:bg-[#0E1D3F] border border-slate-200/90 dark:border-[#1D3A73] rounded-[22px] p-6 sm:p-7 box-border shadow-md shadow-slate-900/5 dark:shadow-none"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] border border-[#1E3A8A] dark:bg-[#132854] dark:border-[#1E3E7A] text-[#93C5FD] flex items-center justify-center mb-5 shadow-sm">
            <Users className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="font-heading font-bold text-xl sm:text-[22px] text-slate-900 dark:text-[#F2F5FA] mb-2">
            Direktori mahasiswa
          </h3>
          <p className="text-slate-600 dark:text-[#94A9C9] text-sm sm:text-[15px] leading-relaxed m-0">
            Jelajahi profil mahasiswa, keahlian teknis, dan portofolio proyek yang telah diselesaikan.
          </p>
        </div>

        {/* Card 3: Karya Terverifikasi */}
        <div className="kt-card bg-white dark:bg-[#0E1D3F] border border-slate-200/90 dark:border-[#1D3A73] rounded-[22px] p-6 sm:p-7 box-border shadow-md shadow-slate-900/5 dark:shadow-none">
          <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] border border-[#1E3A8A] dark:bg-[#132854] dark:border-[#1E3E7A] text-[#FF8A2B] flex items-center justify-center mb-5 shadow-sm">
            <BadgeCheck className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="font-heading font-bold text-xl sm:text-[22px] text-slate-900 dark:text-[#F2F5FA] mb-2">
            Karya terverifikasi
          </h3>
          <p className="text-slate-600 dark:text-[#94A9C9] text-sm sm:text-[15px] leading-relaxed m-0">
            Setiap proyek ditinjau oleh kampus untuk memastikan keaslian, kelayakan fungsi, dan kualitas karya.
          </p>
        </div>
      </div>
    </section>
  );
};

