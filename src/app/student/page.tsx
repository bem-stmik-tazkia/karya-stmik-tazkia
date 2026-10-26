"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getMahasiswaProfiles, getKarya } from "@/lib/data";
import type { MahasiswaProfile, Karya } from "@/types/karya";
import type { Student } from "@/types/student";
import MahasiswaHero from "@/components/mahasiswa/directory/MahasiswaHero";
import MahasiswaProfileDrawer from "@/components/mahasiswa/drawer/MahasiswaProfileDrawer";
import {
  ALL_PRODI_VALUE,
  isAllProdi,
  fetchMasterAngkatanOptions,
  fetchMasterProdiOptions,
} from "@/utils/prodiOptions";
import { useAuth } from "@/components/providers/AuthProvider";
import { checkIsFollowingBulk, toggleFollow } from "@/lib/followService";
import {
  isStudentKarya,
  normalizeStatusBadge,
  getStudentBadges,
  toStudent,
} from "@/components/mahasiswa/directory/studentHelpers";
import { StudentDirectoryGrid } from "@/components/mahasiswa/directory/StudentDirectoryGrid";
import { StudentCtaBanner } from "@/components/mahasiswa/directory/StudentCtaBanner";

// Re-export helpers for backwards compatibility
export { isStudentKarya, normalizeStatusBadge, getStudentBadges, toStudent };

function StudentShowcaseContent() {
  const [allMahasiswa, setAllMahasiswa] = useState<MahasiswaProfile[]>([]);
  const [allKarya, setAllKarya] = useState<Karya[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAngkatan, setSelectedAngkatan] = useState<number | null>(null);
  const [selectedProdi, setSelectedProdi] = useState(ALL_PRODI_VALUE);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState<"Nama" | "Angkatan" | "Karya">("Nama");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const { user } = useAuth();

  const [angkatanOptions, setAngkatanOptions] = useState<{ value: string; label: string }[]>([]);
  const [prodiOptions, setProdiOptions] = useState<{ value: string; label: string }[]>([]);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user && allMahasiswa.length > 0) {
      const ids = allMahasiswa.map((m) => m.user_id).filter(Boolean) as string[];
      checkIsFollowingBulk(ids, user.id).then(setFollowingStatus);
    }
  }, [user, allMahasiswa]);

  const handleToggleFollow = async (studentUserId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    const isCurrentlyFollowing = followingStatus[studentUserId] || false;
    // Optimistic UI update
    setFollowingStatus((prev) => ({ ...prev, [studentUserId]: !isCurrentlyFollowing }));
    try {
      await toggleFollow(studentUserId, user.id, isCurrentlyFollowing);
    } catch (error) {
      setFollowingStatus((prev) => ({ ...prev, [studentUserId]: isCurrentlyFollowing }));
      toast.error("Mohon maaf, aksi mengikuti profil belum berhasil. Silakan coba kembali.");
    }
  };

  useEffect(() => {
    Promise.all([
      getMahasiswaProfiles(),
      getKarya(),
      fetchMasterAngkatanOptions(),
      fetchMasterProdiOptions(),
    ]).then(([mahasiswa, karya, angkData, prodiData]) => {
      setAllMahasiswa(mahasiswa);
      setAllKarya(karya);
      setAngkatanOptions(angkData);
      setProdiOptions([{ value: ALL_PRODI_VALUE, label: "Semua Prodi" }, ...prodiData]);
      setLoading(false);
    });
  }, []);

  const students = useMemo(
    () => allMahasiswa.map((m) => toStudent(m, allKarya)),
    [allMahasiswa, allKarya]
  );

  const availableAngkatan = useMemo(() => {
    if (angkatanOptions.length > 0) {
      return angkatanOptions.map((a) => Number(a.value)).filter((n) => !isNaN(n));
    }
    return Array.from(new Set(students.map((s) => s.angkatan))).sort((a, b) => a - b);
  }, [students, angkatanOptions]);

  // Filter students based on Angkatan, Prodi, Status, and Search Query
  const filteredStudents = useMemo(() => {
    let result = students.filter((student) => {
      if (selectedAngkatan !== null && student.angkatan !== selectedAngkatan) {
        return false;
      }
      if (!isAllProdi(selectedProdi) && student.prodi !== selectedProdi) {
        return false;
      }
      if (selectedStatus !== "ALL" && (student.statusBadge || "Open for Collab") !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesBio = student.bio.toLowerCase().includes(query);
        const matchesSkills = student.skills?.some((sk) =>
          sk.toLowerCase().includes(query)
        );

        const studentProjects = allKarya.filter((k) =>
          isStudentKarya(k, student.name, student.userId, student.id)
        );
        const matchesProject = studentProjects.some(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            (p.tech_stack ?? []).some((t) => t.toLowerCase().includes(query))
        );

        return matchesName || matchesBio || matchesSkills || matchesProject;
      }
      return true;
    });

    if (sortBy === "Nama") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "Angkatan") {
      result = [...result].sort((a, b) => b.angkatan - a.angkatan);
    } else if (sortBy === "Karya") {
      result = [...result].sort((a, b) => {
        const aCount = allKarya.filter((k) =>
          isStudentKarya(k, a.name, a.userId, a.id)
        ).length;
        const bCount = allKarya.filter((k) =>
          isStudentKarya(k, b.name, b.userId, b.id)
        ).length;
        return bCount - aCount;
      });
    }

    return result;
  }, [
    searchQuery,
    selectedAngkatan,
    selectedProdi,
    selectedStatus,
    sortBy,
    students,
    allKarya,
  ]);

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const [animTick, setAnimTick] = useState(0);
  useEffect(() => {
    setAnimTick((t) => t + 1);
  }, [
    searchQuery,
    selectedAngkatan,
    selectedProdi,
    selectedStatus,
    sortBy,
    currentPage,
  ]);
  const inClass = animTick % 2 === 0 ? "g-in-a" : "g-in-b";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedAngkatan(null);
    setSelectedProdi(ALL_PRODI_VALUE);
    setSelectedStatus("ALL");
    setSortBy("Nama");
    setCurrentPage(1);
  };

  const selectedStudentProjects = useMemo(() => {
    if (!selectedStudent) return [];
    return allKarya.filter((k) =>
      isStudentKarya(k, selectedStudent.name, selectedStudent.userId, selectedStudent.id)
    );
  }, [selectedStudent, allKarya]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-muted-foreground text-sm">Memuat direktori mahasiswa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors selection:bg-[#FF8A2B] selection:text-[#0B1F4A]">
      {/* HERO SECTION */}
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
        selectedStatus={selectedStatus}
        setSelectedStatus={(st) => {
          setSelectedStatus(st);
          setCurrentPage(1);
        }}
        totalMahasiswa={students.length}
        totalProjects={allKarya.length}
        availableAngkatan={availableAngkatan}
        angkatanOptions={angkatanOptions}
        prodiOptions={prodiOptions}
      />

      {/* DAFTAR MAHASISWA GRID */}
      <StudentDirectoryGrid
        students={students}
        paginatedStudents={paginatedStudents}
        allKarya={allKarya}
        filteredCount={filteredStudents.length}
        sortBy={sortBy}
        setSortBy={setSortBy}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedAngkatan={selectedAngkatan}
        setSelectedAngkatan={setSelectedAngkatan}
        selectedProdi={selectedProdi}
        isAllProdiSelected={isAllProdi(selectedProdi)}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        followingStatus={followingStatus}
        onToggleFollow={handleToggleFollow}
        onSelectStudent={(s) => setSelectedStudent(s)}
        onResetFilters={handleResetFilters}
        inClass={inClass}
      />

      {/* CTA BANNER */}
      <StudentCtaBanner />

      {/* SIDE PROFILE DRAWER */}
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-bold text-[#FF8A2B] text-lg">
          Memuat direktori...
        </div>
      }
    >
      <StudentShowcaseContent />
    </Suspense>
  );
}
