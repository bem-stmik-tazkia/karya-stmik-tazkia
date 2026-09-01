"use client";

import { motion } from "framer-motion";
import { Search, Filter, X, Users, FolderCheck, GraduationCap } from "lucide-react";
import { ALL_PRODI_VALUE, PRODI_FILTER_OPTIONS } from "@/utils/prodiOptions";

interface MahasiswaHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedAngkatan: number | null;
  setSelectedAngkatan: (angkatan: number | null) => void;
  selectedProdi: string;
  setSelectedProdi: (prodi: string) => void;
  totalMahasiswa: number;
  totalProjects: number;
  availableAngkatan: number[];
  angkatanOptions?: { value: string; label: string }[];
  prodiOptions?: { value: string; label: string }[];
  isLoading?: boolean;
}

export default function MahasiswaHero({
  searchQuery,
  setSearchQuery,
  selectedAngkatan,
  setSelectedAngkatan,
  selectedProdi,
  setSelectedProdi,
  totalMahasiswa,
  totalProjects,
  availableAngkatan,
  angkatanOptions = [],
  prodiOptions = [],
}: MahasiswaHeroProps) {
  const finalProdiList = prodiOptions.length > 0 ? prodiOptions : PRODI_FILTER_OPTIONS;

  return (
    <section className="relative pt-6 pb-6 sm:pt-12 sm:pb-10 bg-background border-b-4 border-border overflow-hidden">
      {/* Background Dot Pattern */}
      <div
        className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container px-4 md:px-6 relative z-10 max-w-6xl mx-auto text-center">

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight text-foreground uppercase max-w-4xl mx-auto leading-tight"
          style={{ textShadow: "2px 2px 0px var(--color-border)" }}
        >
          Temukan <span className="text-primary">Mahasiswa</span> &{" "}
          <span className="text-secondary">Karyanya</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4, delay: 0.05 }}
          className="mt-2 sm:mt-4 text-xs sm:text-lg font-bold text-muted-foreground max-w-2xl mx-auto px-2"
        >
          Jelajahi profil talenta muda STMIK Tazkia dari berbagai angkatan dan program studi beserta portofolio karya mereka.
        </motion.p>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2 sm:gap-6 my-5 sm:my-8 max-w-2xl mx-auto"
        >
          <div className="card-3d bg-card p-2 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-primary/10 text-primary mb-0.5 sm:mb-1">
              <Users className="w-4 h-4 sm:w-7 sm:h-7" />
            </div>
            <span className="text-base sm:text-3xl font-black text-foreground">{totalMahasiswa}</span>
            <span className="text-[9px] sm:text-xs font-bold text-muted-foreground uppercase">Mahasiswa</span>
          </div>

          <div className="card-3d bg-card p-2 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-secondary/10 text-secondary mb-0.5 sm:mb-1">
              <FolderCheck className="w-4 h-4 sm:w-7 sm:h-7" />
            </div>
            <span className="text-base sm:text-3xl font-black text-foreground">{totalProjects}</span>
            <span className="text-[9px] sm:text-xs font-bold text-muted-foreground uppercase">Projek Karya</span>
          </div>

          <div className="card-3d bg-card p-2 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-accent/20 text-accent-foreground mb-0.5 sm:mb-1">
              <GraduationCap className="w-4 h-4 sm:w-7 sm:h-7" />
            </div>
            <span className="text-base sm:text-3xl font-black text-foreground">{availableAngkatan.length}</span>
            <span className="text-[9px] sm:text-xs font-bold text-muted-foreground uppercase">Angkatan</span>
          </div>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-xl mx-auto mb-4 sm:mb-6"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 sm:left-4 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama mahasiswa, keahlian, atau projek..."
              className="w-full pl-10 sm:pl-12 pr-9 sm:pr-10 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-card border-3 sm:border-4 border-border text-foreground placeholder:text-muted-foreground font-bold shadow-[3px_3px_0px_var(--color-border)] sm:shadow-[4px_4px_0px_var(--color-border)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all text-xs sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 p-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Filter Section: Smooth Hidden Scrollbars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-2.5 sm:gap-4 items-center w-full"
        >
          {/* Angkatan Filter */}
          <div className="w-full flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
            <span className="text-[10px] sm:text-xs font-black uppercase text-muted-foreground flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3 h-3 text-primary" /> Angkatan:
            </span>
            <button
              onClick={() => setSelectedAngkatan(null)}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase border-2 border-border transition-all shrink-0 ${
                selectedAngkatan === null
                  ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_var(--color-border)]"
                  : "bg-card text-foreground hover:bg-muted"
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
                      key={opt.value}
                      onClick={() => setSelectedAngkatan(isNaN(yearNum) ? null : yearNum)}
                      className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase border-2 border-border transition-all shrink-0 ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_var(--color-border)]"
                          : "bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })
              : availableAngkatan.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedAngkatan(year)}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase border-2 border-border transition-all shrink-0 ${
                      selectedAngkatan === year
                        ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_var(--color-border)]"
                        : "bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    Angkatan {year}
                  </button>
                ))}
          </div>

          {/* Prodi Filter */}
          <div className="w-full flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
            <span className="text-[10px] sm:text-xs font-black uppercase text-muted-foreground shrink-0 mr-1">Prodi:</span>
            {finalProdiList.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedProdi(opt.value)}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold border-2 border-border transition-all shrink-0 ${
                  selectedProdi === opt.value
                    ? "bg-secondary text-secondary-foreground shadow-[2px_2px_0px_var(--color-border)]"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
