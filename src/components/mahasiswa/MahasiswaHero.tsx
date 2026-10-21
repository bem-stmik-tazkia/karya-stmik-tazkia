"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { ALL_PRODI_VALUE, PRODI_FILTER_OPTIONS } from "@/utils/prodiOptions";

export const STATUS_FILTER_OPTIONS = [
  "Open for Collab",
  "Siap Freelance",
  "Mencari Magang",
  "Fokus Belajar",
];

interface MahasiswaHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedAngkatan: number | null;
  setSelectedAngkatan: (angkatan: number | null) => void;
  selectedProdi: string;
  setSelectedProdi: (prodi: string) => void;
  selectedStatus?: string;
  setSelectedStatus?: (status: string) => void;
  totalMahasiswa: number;
  totalProjects: number;
  availableAngkatan: number[];
  angkatanOptions?: { value: string; label: string }[];
  prodiOptions?: { value: string; label: string }[];
}

export default function MahasiswaHero({
  searchQuery,
  setSearchQuery,
  selectedAngkatan,
  setSelectedAngkatan,
  selectedProdi,
  setSelectedProdi,
  selectedStatus = "ALL",
  setSelectedStatus,
  totalMahasiswa,
  totalProjects,
  availableAngkatan,
  angkatanOptions = [],
  prodiOptions = [],
}: MahasiswaHeroProps) {
  const finalProdiList = prodiOptions.length > 0 ? prodiOptions : PRODI_FILTER_OPTIONS;

  return (
    <section
      id="atas"
      className="w-full bg-white dark:bg-[#0B1F4A] border-b border-border dark:border-[#1E3E82] text-foreground transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10 sm:pb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-12">
        {/* Left Column: Heading & Description */}
        <div className="max-w-2xl">
          <div className="font-mono text-xs sm:text-sm font-bold text-[#FF8A2B] tracking-wider uppercase mb-3">
            DIREKTORI MAHASISWA &amp; TALENTA DIGITAL
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-[#0B1F4A] dark:text-white mb-4">
            Temukan talenta{" "}
            <span className="text-[#FF8A2B]">STMIK Tazkia</span>
          </h1>
          <p className="text-base sm:text-lg text-[#5B6B8C] dark:text-[#C3CDE6] leading-relaxed max-w-xl">
            Profil mahasiswa kreatif, inovator muda, dan portofolio karya nyata mereka lintas angkatan dan program studi.
          </p>
        </div>

        {/* Right Column: Big Numerical Stats */}
        <div className="flex items-center gap-8 sm:gap-12 shrink-0">
          <div>
            <div className="font-heading font-extrabold text-4xl sm:text-5xl text-[#0B1F4A] dark:text-white leading-none">
              {totalMahasiswa}
            </div>
            <div className="text-xs sm:text-sm text-[#5B6B8C] dark:text-[#C3CDE6] mt-1.5 font-medium">
              Mahasiswa
            </div>
          </div>

          <div>
            <div className="font-heading font-extrabold text-4xl sm:text-5xl text-[#FF8A2B] leading-none">
              {totalProjects}
            </div>
            <div className="text-xs sm:text-sm text-[#5B6B8C] dark:text-[#C3CDE6] mt-1.5 font-medium">
              Total karya
            </div>
          </div>

          <div>
            <div className="font-heading font-extrabold text-4xl sm:text-5xl text-[#0B1F4A] dark:text-white leading-none">
              {availableAngkatan.length || 3}
            </div>
            <div className="text-xs sm:text-sm text-[#5B6B8C] dark:text-[#C3CDE6] mt-1.5 font-medium">
              Angkatan
            </div>
          </div>
        </div>
      </div>

      {/* Search Input & 3 Rows of Filter Chips */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-14">
        {/* 58px Pill Search Input */}
        <div className="relative max-w-3xl">
          <label htmlFor="cari-mhs" className="sr-only">
            Cari mahasiswa
          </label>
          <Search className="w-5 h-5 text-[#8D9BB8] absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="cari-mhs"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama mahasiswa, keahlian, atau karya..."
            className="w-full h-[54px] sm:h-[58px] rounded-full border border-border dark:border-[#1E3E82] bg-[#F4F6FB] dark:bg-[#122A5E] pl-13 pr-12 text-sm sm:text-base text-[#0B1F4A] dark:text-white placeholder:text-[#8D9BB8] dark:placeholder:text-[#88A2D3] focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/40 focus:border-[#FF8A2B] shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-[#8D9BB8] hover:text-[#0B1F4A] dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 3 Rows of Chips: ANGKATAN, PRODI, STATUS */}
        <div className="flex flex-col gap-3.5 mt-7 max-w-4xl">
          {/* Row 1: ANGKATAN */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-20 font-mono text-xs font-bold text-[#5B6B8C] dark:text-[#A9B8DA] tracking-wider shrink-0">
              ANGKATAN
            </span>
            <button
              type="button"
              onClick={() => setSelectedAngkatan(null)}
              className={`g-chip min-h-[38px] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedAngkatan === null
                  ? "bg-[#FF8A2B] text-[#1A0F05] border border-[#FF8A2B] font-bold shadow-xs"
                  : "bg-[#F4F6FB] dark:bg-[#122A5E] border border-border dark:border-[#1E3E82] text-[#0B1F4A] dark:text-white hover:border-[#FF8A2B]/60 hover:bg-[#FFE9D6]/30"
              }`}
            >
              Semua
            </button>
            {angkatanOptions.length > 0
              ? angkatanOptions.map((opt) => {
                  const yearNum = Number(opt.value);
                  const isSelected = selectedAngkatan === yearNum;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() =>
                        setSelectedAngkatan(isNaN(yearNum) ? null : yearNum)
                      }
                      className={`g-chip min-h-[38px] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#FF8A2B] text-[#1A0F05] border border-[#FF8A2B] font-bold shadow-xs"
                          : "bg-[#F4F6FB] dark:bg-[#122A5E] border border-border dark:border-[#1E3E82] text-[#0B1F4A] dark:text-white hover:border-[#FF8A2B]/60 hover:bg-[#FFE9D6]/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })
              : availableAngkatan.map((year) => (
                  <button
                    type="button"
                    key={year}
                    onClick={() => setSelectedAngkatan(year)}
                    className={`g-chip min-h-[38px] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      selectedAngkatan === year
                        ? "bg-[#FF8A2B] text-[#1A0F05] border border-[#FF8A2B] font-bold shadow-xs"
                        : "bg-[#F4F6FB] dark:bg-[#122A5E] border border-border dark:border-[#1E3E82] text-[#0B1F4A] dark:text-white hover:border-[#FF8A2B]/60 hover:bg-[#FFE9D6]/30"
                    }`}
                  >
                    Angkatan {year}
                  </button>
                ))}
          </div>

          {/* Row 2: PRODI */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-20 font-mono text-xs font-bold text-[#5B6B8C] dark:text-[#A9B8DA] tracking-wider shrink-0">
              PRODI
            </span>
            <button
              type="button"
              onClick={() => setSelectedProdi(ALL_PRODI_VALUE)}
              className={`g-chip min-h-[38px] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedProdi === ALL_PRODI_VALUE
                  ? "bg-[#FF8A2B] text-[#1A0F05] border border-[#FF8A2B] font-bold shadow-xs"
                  : "bg-[#F4F6FB] dark:bg-[#122A5E] border border-border dark:border-[#1E3E82] text-[#0B1F4A] dark:text-white hover:border-[#FF8A2B]/60 hover:bg-[#FFE9D6]/30"
              }`}
            >
              Semua prodi
            </button>
            {finalProdiList
              .filter((p) => p.value !== ALL_PRODI_VALUE)
              .map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setSelectedProdi(opt.value)}
                  className={`g-chip min-h-[38px] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    selectedProdi === opt.value
                      ? "bg-[#FF8A2B] text-[#1A0F05] border border-[#FF8A2B] font-bold shadow-xs"
                      : "bg-[#F4F6FB] dark:bg-[#122A5E] border border-border dark:border-[#1E3E82] text-[#0B1F4A] dark:text-white hover:border-[#FF8A2B]/60 hover:bg-[#FFE9D6]/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
          </div>

          {/* Row 3: STATUS */}
          {setSelectedStatus && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-20 font-mono text-xs font-bold text-[#5B6B8C] dark:text-[#A9B8DA] tracking-wider shrink-0">
                STATUS
              </span>
              <button
                type="button"
                onClick={() => setSelectedStatus("ALL")}
                className={`g-chip min-h-[38px] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  selectedStatus === "ALL"
                    ? "bg-[#FF8A2B] text-[#1A0F05] border border-[#FF8A2B] font-bold shadow-xs"
                    : "bg-[#F4F6FB] dark:bg-[#122A5E] border border-border dark:border-[#1E3E82] text-[#0B1F4A] dark:text-white hover:border-[#FF8A2B]/60 hover:bg-[#FFE9D6]/30"
                }`}
              >
                Semua
              </button>
              {STATUS_FILTER_OPTIONS.map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`g-chip min-h-[38px] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    selectedStatus === st
                      ? "bg-[#FF8A2B] text-[#1A0F05] border border-[#FF8A2B] font-bold shadow-xs"
                      : "bg-[#F4F6FB] dark:bg-[#122A5E] border border-border dark:border-[#1E3E82] text-[#0B1F4A] dark:text-white hover:border-[#FF8A2B]/60 hover:bg-[#FFE9D6]/30"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
