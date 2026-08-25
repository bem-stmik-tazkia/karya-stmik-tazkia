"use client";

import React, { useState, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserX, Users, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { students, projects, Student } from "@/lib/data";
import MahasiswaHero from "@/components/mahasiswa/MahasiswaHero";
import MahasiswaCard from "@/components/mahasiswa/MahasiswaCard";
import MahasiswaProfileDrawer from "@/components/mahasiswa/MahasiswaProfileDrawer";
import { ALL_PRODI_VALUE, isAllProdi } from "@/utils/prodiOptions";
import { BouncyButton } from "@/components/ui/BouncyButton";

function StudentShowcaseContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAngkatan, setSelectedAngkatan] = useState<number | null>(null);
  const [selectedProdi, setSelectedProdi] = useState(ALL_PRODI_VALUE);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Extract available angkatan list
  const availableAngkatan = useMemo(() => {
    const years = Array.from(new Set(students.map((s) => s.angkatan))).sort((a, b) => a - b);
    return years;
  }, []);

  // Filter students based on Angkatan, Prodi, and Search Query
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Angkatan Filter
      if (selectedAngkatan !== null && student.angkatan !== selectedAngkatan) {
        return false;
      }

      // Prodi Filter
      if (!isAllProdi(selectedProdi) && student.prodi !== selectedProdi) {
        return false;
      }

      // Search Query Filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesNIM = student.nim.toLowerCase().includes(query);
        const matchesBio = student.bio.toLowerCase().includes(query);
        const matchesSkills = student.skills?.some((sk) => sk.toLowerCase().includes(query));

        const studentProjects = projects.filter((p) => p.studentId === student.id);
        const matchesProject = studentProjects.some(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.tags.some((t) => t.toLowerCase().includes(query))
        );

        return matchesName || matchesNIM || matchesBio || matchesSkills || matchesProject;
      }

      return true;
    });
  }, [searchQuery, selectedAngkatan, selectedProdi]);

  // Pagination Logic
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedAngkatan(null);
    setSelectedProdi(ALL_PRODI_VALUE);
    setCurrentPage(1);
  };

  const selectedStudentProjects = useMemo(() => {
    if (!selectedStudent) return [];
    return projects.filter((p) => p.studentId === selectedStudent.id);
  }, [selectedStudent]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Header & Filter Bar */}
      <MahasiswaHero
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        selectedAngkatan={selectedAngkatan}
        setSelectedAngkatan={(year) => {
          setSelectedAngkatan(year);
          setCurrentPage(1);
        }}
        selectedProdi={selectedProdi}
        setSelectedProdi={(prodi) => {
          setSelectedProdi(prodi);
          setCurrentPage(1);
        }}
        totalMahasiswa={students.length}
        totalProjects={projects.length}
        availableAngkatan={availableAngkatan}
      />

      {/* Main Grid Content */}
      <main className="container max-w-7xl mx-auto px-4 md:px-6 py-12 flex-1 w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground uppercase flex items-center gap-2" style={{ textShadow: "2px 2px 0px var(--color-border)" }}>
              <Users className="text-primary w-7 h-7" />
              {selectedAngkatan ? `Mahasiswa Angkatan ${selectedAngkatan}` : "Daftar Seluruh Mahasiswa"}
            </h2>
            <p className="text-muted-foreground font-bold text-sm mt-1">
              Menampilkan {filteredStudents.length} mahasiswa STMIK Tazkia
            </p>
          </div>
          {(searchQuery || selectedAngkatan !== null || !isAllProdi(selectedProdi)) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted border-2 border-border text-xs font-black uppercase text-foreground hover:bg-card transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
            </button>
          )}
        </div>

        {/* Student Cards Grid */}
        {filteredStudents.length > 0 ? (
          <>
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {paginatedStudents.map((student) => {
                  const studentProjCount = projects.filter((p) => p.studentId === student.id).length;
                  return (
                    <motion.div
                      layout
                      key={student.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", bounce: 0.4 }}
                      className="h-full"
                    >
                      <MahasiswaCard
                        student={student}
                        projectCount={studentProjCount}
                        searchQuery={searchQuery}
                        onSelect={(s) => setSelectedStudent(s)}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>


            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-card border-2 border-border text-xs font-black uppercase disabled:opacity-40 hover:bg-muted transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl border-2 border-border text-xs font-black transition-all ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_var(--color-border)]"
                        : "bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-card border-2 border-border text-xs font-black uppercase disabled:opacity-40 hover:bg-muted transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="card-3d bg-card border-4 border-border rounded-3xl p-10 text-center max-w-lg mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border-2 border-border">
              <UserX className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black uppercase text-foreground mb-2">Mahasiswa Tidak Ditemukan</h3>
            <p className="text-muted-foreground font-medium text-sm mb-6">
              Tidak ada mahasiswa yang sesuai dengan kata kunci pencarian atau filter yang Anda pilih.
            </p>
            <BouncyButton onClick={handleResetFilters} variant="secondary" className="text-sm px-6 py-2.5">
              RESET SEMUA FILTER
            </BouncyButton>
          </div>
        )}
      </main>

      {/* Side Profile Drawer */}
      <MahasiswaProfileDrawer
        student={selectedStudent}
        projects={selectedStudentProjects}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}

export default function StudentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-primary text-xl">MEMUAT...</div>}>
      <StudentShowcaseContent />
    </Suspense>
  );
}
