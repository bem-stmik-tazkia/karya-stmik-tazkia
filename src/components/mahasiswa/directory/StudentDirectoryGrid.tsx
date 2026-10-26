"use client";

import React from "react";
import { UserX, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import MahasiswaCard from "./MahasiswaCard";
import type { Student } from "@/types/student";
import type { Karya } from "@/types/karya";
import { isStudentKarya } from "./studentHelpers";

interface StudentDirectoryGridProps {
  students: Student[];
  paginatedStudents: Student[];
  allKarya: Karya[];
  filteredCount: number;
  sortBy: "Nama" | "Angkatan" | "Karya";
  setSortBy: (val: "Nama" | "Angkatan" | "Karya") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedAngkatan: number | null;
  setSelectedAngkatan: (ang: number | null) => void;
  selectedProdi: string;
  isAllProdiSelected: boolean;
  selectedStatus: string;
  setSelectedStatus: (st: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  followingStatus: Record<string, boolean>;
  onToggleFollow: (userId: string) => Promise<void>;
  onSelectStudent: (student: Student) => void;
  onResetFilters: () => void;
  inClass: string;
}

export const StudentDirectoryGrid: React.FC<StudentDirectoryGridProps> = ({
  paginatedStudents,
  allKarya,
  filteredCount,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  selectedAngkatan,
  setSelectedAngkatan,
  isAllProdiSelected,
  selectedStatus,
  setSelectedStatus,
  currentPage,
  setCurrentPage,
  totalPages,
  followingStatus,
  onToggleFollow,
  onSelectStudent,
  onResetFilters,
  inClass,
}) => {
  return (
    <main
      id="daftar"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 w-full"
    >
      {/* Section Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-4xl tracking-tight text-foreground mb-1.5">
            Daftar mahasiswa
          </h2>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Menampilkan{" "}
            <strong className="text-foreground font-bold">{filteredCount}</strong>{" "}
            mahasiswa STMIK Tazkia
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="urut-mhs"
              className="text-xs sm:text-sm text-muted-foreground font-medium"
            >
              Urutkan
            </label>
            <select
              id="urut-mhs"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#FF8A2B]/30 focus:border-[#FF8A2B] outline-none cursor-pointer transition-all shadow-2xs"
            >
              <option value="Nama">Nama A–Z</option>
              <option value="Angkatan">Angkatan terbaru</option>
              <option value="Karya">Karya terbanyak</option>
            </select>
          </div>

          {/* Reset Filters button if any active */}
          {(searchQuery ||
            selectedAngkatan !== null ||
            !isAllProdiSelected ||
            selectedStatus !== "ALL") && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 text-xs text-[#FF8A2B] hover:underline font-semibold cursor-pointer ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Divider line */}
      <div className="h-px bg-border mb-8 sm:mb-10" />

      {/* Student Cards Grid */}
      {filteredCount > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 items-stretch py-2 px-1">
            {paginatedStudents.map((student, idx) => {
              const studentProjects = allKarya.filter((k) =>
                isStudentKarya(k, student.name, student.userId, student.id)
              );
              return (
                <MahasiswaCard
                  key={`student-card-${student.id || student.name}-${idx}`}
                  student={student}
                  projectCount={studentProjects.length}
                  projects={studentProjects}
                  searchQuery={searchQuery}
                  isFollowing={followingStatus[student.userId || ""] || false}
                  onToggleFollow={onToggleFollow}
                  onFilterAngkatan={(ang) => {
                    setSelectedAngkatan(ang);
                    setCurrentPage(1);
                  }}
                  onFilterStatus={(st) => {
                    setSelectedStatus(st);
                    setCurrentPage(1);
                  }}
                  onFilterSkill={(sk) => {
                    setSearchQuery(sk);
                    setCurrentPage(1);
                  }}
                  inClass={inClass}
                  animationDelay={idx * 70}
                  onSelect={(s) => onSelectStudent(s)}
                />
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              className="mt-12 flex justify-center items-center gap-2"
              role="navigation"
              aria-label="Halaman"
            >
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 min-h-[44px] px-4 rounded-full bg-card border border-border text-xs sm:text-sm font-semibold text-foreground disabled:opacity-40 hover:bg-muted transition-all cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={`pagination-page-${page}`}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[44px] min-h-[44px] rounded-full border text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center ${
                    currentPage === page
                      ? "bg-[#FF8A2B] text-[#1A0F05] border-[#FF8A2B] font-bold shadow-xs"
                      : "bg-card border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 min-h-[44px] px-4 rounded-full bg-card border border-border text-xs sm:text-sm font-semibold text-foreground disabled:opacity-40 hover:bg-muted transition-all cursor-pointer shadow-xs"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="border border-dashed border-border rounded-[20px] p-10 sm:p-14 text-center max-w-lg mx-auto my-12 bg-card/40">
          <div className="w-12 h-12 rounded-full bg-[#FF8A2B]/10 text-[#FF8A2B] flex items-center justify-center mx-auto mb-4">
            <UserX className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 font-heading">
            Belum ada mahasiswa yang cocok
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm mb-6 leading-relaxed">
            Coba ubah kata kunci pencarian, filter angkatan, atau program studi.
          </p>
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FF8A2B] text-[#1A0F05] text-xs sm:text-sm font-bold shadow-xs hover:bg-[#ea580c] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Semua Filter</span>
          </button>
        </div>
      )}
    </main>
  );
};

