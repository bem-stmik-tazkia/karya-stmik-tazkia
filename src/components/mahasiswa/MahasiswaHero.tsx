"use client";

import { motion } from "framer-motion";
import { Search, Filter, X, Users, FolderCheck, GraduationCap, Sparkles } from "lucide-react";
import { ALL_PRODI_VALUE, PRODI_FILTER_OPTIONS } from "@/utils/prodiOptions";
import { StickerBadge } from "@/components/ui/StickerBadge";

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
}: MahasiswaHeroProps) {
  return (
    <section className="relative pt-12 pb-10 bg-background border-b-4 border-border overflow-hidden">
      {/* Background Dot Pattern */}
      <div
        className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container px-4 md:px-6 relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="flex justify-center mb-4"
        >
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground uppercase max-w-4xl mx-auto"
          style={{ textShadow: "3px 3px 0px var(--color-border)" }}
        >
          Temukan <span className="text-primary">Mahasiswa</span> &{" "}
          <span className="text-secondary">Karyanya</span>
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
          className="mt-4 text-base sm:text-xl font-bold text-muted-foreground max-w-2xl mx-auto"
        >
          Jelajahi profil talenta muda STMIK Tazkia dari berbagai angkatan dan program studi beserta portofolio karya mereka.
        </motion.p>

        {/* Stats Cards - Playful 3D Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3 sm:gap-6 my-8 max-w-3xl mx-auto"
        >
          <div className="card-3d bg-card p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="p-2 sm:p-3 rounded-xl bg-primary/10 text-primary mb-1">
              <Users className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <span className="text-xl sm:text-3xl font-black text-foreground">{totalMahasiswa}</span>
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">Mahasiswa</span>
          </div>

          <div className="card-3d bg-card p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="p-2 sm:p-3 rounded-xl bg-secondary/10 text-secondary mb-1">
              <FolderCheck className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <span className="text-xl sm:text-3xl font-black text-foreground">{totalProjects}</span>
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">Projek Karya</span>
          </div>

          <div className="card-3d bg-card p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="p-2 sm:p-3 rounded-xl bg-accent/20 text-accent-foreground mb-1">
              <GraduationCap className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <span className="text-xl sm:text-3xl font-black text-foreground">{availableAngkatan.length}</span>
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">Angkatan</span>
          </div>
        </motion.div>

        {/* Search Box - 3D Input style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-2xl mx-auto mb-6"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama mahasiswa, keahlian, atau judul projek..."
              className="w-full pl-12 pr-10 py-3.5 sm:py-4 rounded-2xl bg-card border-4 border-border text-foreground placeholder:text-muted-foreground font-bold shadow-[4px_4px_0px_var(--color-border)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_var(--color-border)] transition-all text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 p-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col gap-4 items-center"
        >
          {/* Angkatan Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-extrabold uppercase text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-primary" /> Angkatan:
            </span>
            <button
              onClick={() => setSelectedAngkatan(null)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase border-2 border-border transition-all ${selectedAngkatan === null
                ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_var(--color-border)]"
                : "bg-card text-foreground hover:bg-muted"
                }`}
            >
              Semua
            </button>
            {availableAngkatan.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedAngkatan(year)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase border-2 border-border transition-all ${selectedAngkatan === year
                  ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_var(--color-border)]"
                  : "bg-card text-foreground hover:bg-muted"
                  }`}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Prodi Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-extrabold uppercase text-muted-foreground mr-1">Prodi:</span>
            {PRODI_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedProdi(opt.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 border-border transition-all ${selectedProdi === opt.value
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
