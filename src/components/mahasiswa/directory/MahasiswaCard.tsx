"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Student } from "@/types/student";
import { StudentCardRenderer } from "@/components/cards";
import type { StudentCardData } from "@/components/cards";
import {
  calculateStudentEarnedBadges,
  PENGHARGAAN_CATALOG,
} from "@/data/penghargaanCatalog";
import { getClaimedExclusiveBadgeIds } from "@/lib/badgeService";
import { getSkinDefinition, isSkinUnlocked } from "@/components/cards";
import { getStatusIcon } from "./studentHelpers";

export interface MahasiswaCardProps {
  student: Student;
  projectCount: number;
  onSelect: (student: Student) => void;
  searchQuery?: string;
  onMessageClick?: (student: Student) => void;
  isFollowing?: boolean;
  onFollowClick?: (e: React.MouseEvent) => void;
  onToggleFollow?: (targetUserId: string) => void;
  inClass?: string;
  animationDelay?: number;
  projects?: any[];
  onFilterAngkatan?: (ang: number) => void;
  onFilterStatus?: (status: string) => void;
  onFilterSkill?: (skill: string) => void;
}

export default function MahasiswaCard({
  student,
  projectCount,
  onSelect,
  searchQuery = "",
  onMessageClick,
  isFollowing = false,
  onFollowClick,
  onToggleFollow,
  inClass = "",
  animationDelay = 0,
  projects = [],
  onFilterAngkatan,
  onFilterStatus,
  onFilterSkill,
}: MahasiswaCardProps) {
  const [activeSkinId, setActiveSkinId] = useState<string>("classic");
  const [customColors, setCustomColors] = useState<{ primary: string; secondary: string }>({
    primary: "#FF8A2B",
    secondary: "#0B1F4A",
  });

  // Load and listen to active skin updates
  useEffect(() => {
    const checkValidSkin = (candidateSkin: string) => {
      const skinDef = getSkinDefinition(candidateSkin);
      if (skinDef.group === "khusus") {
        const rawClaimed = getClaimedExclusiveBadgeIds(student.userId || student.id, student.id);
        const rawManual = (student as any)?.unlockedBadgeIds || (student as any)?.unlocked_badge_ids || [];
        if (!isSkinUnlocked(skinDef, [...rawClaimed, ...rawManual])) {
          return "classic";
        }
      }
      return candidateSkin;
    };

    const readSkin = () => {
      try {
        // 1. Direct student property
        const directSkin =
          student.cardSkin ||
          (student as any).skin_id ||
          (student as any).card_skin;
        if (directSkin) {
          setActiveSkinId(checkValidSkin(directSkin));
          return;
        }

        // 2. Specific student localStorage
        const studentSpecificSkin =
          (student.id ? localStorage.getItem(`tazkia_profile_skin_${student.id}`) : null) ||
          (student.userId ? localStorage.getItem(`tazkia_profile_skin_${student.userId}`) : null);

        if (studentSpecificSkin) {
          const validSkin = checkValidSkin(studentSpecificSkin);
          setActiveSkinId(validSkin);
          if (studentSpecificSkin === "custom") {
            const savedCustom =
              (student.id ? localStorage.getItem(`tazkia_custom_skin_colors_${student.id}`) : null) ||
              localStorage.getItem("tazkia_custom_skin_colors");
            if (savedCustom) {
              setCustomColors(JSON.parse(savedCustom));
            }
          }
          return;
        }

        // 3. Fallback to classic
        setActiveSkinId("classic");
      } catch {
        setActiveSkinId("classic");
      }
    };

    readSkin();

    const handleSkinUpdate = (e: any) => {
      const detail = e?.detail;
      if (
        detail &&
        detail.studentId &&
        (detail.studentId === student.id || detail.studentId === student.userId)
      ) {
        if (detail.skinId) setActiveSkinId(checkValidSkin(detail.skinId));
      } else {
        readSkin();
      }
    };

    window.addEventListener("tazkia_profile_skin_updated", handleSkinUpdate);
    return () => {
      window.removeEventListener("tazkia_profile_skin_updated", handleSkinUpdate);
    };
  }, [student.id, student.userId, student.cardSkin]);

  // Compute initials (e.g. "Anisa Aulia" -> "A")
  const initials = (() => {
    if (!student.name) return "A";
    const parts = student.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return parts[0][0].toUpperCase();
  })();

  // 1. Filter karya riil milik mahasiswa ini
  const studentUserId = student.userId || student.id;
  const studentProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    return projects.filter((p: any) => {
      if (studentUserId && (p.user_id === studentUserId || p.userId === studentUserId)) return true;
      if (student.id && (p.user_id === student.id || p.userId === student.id)) return true;
      if (student.name && p.team && Array.isArray(p.team)) {
        return p.team.some(
          (tm: any) =>
            tm &&
            tm.name &&
            tm.name.toLowerCase() === student.name.toLowerCase() &&
            tm.status !== "rejected"
        );
      }
      return false;
    });
  }, [projects, studentUserId, student.id, student.name]);

  // 2. Baca lencana eksklusif yang diklaim (misal BEM 2026, dll.)
  const claimedExclusiveIds = useMemo(() => {
    if (typeof window === "undefined") return [];
    return getClaimedExclusiveBadgeIds(studentUserId, student.id);
  }, [studentUserId, student.id]);

  // 3. Hitung badge yang diraih mahasiswa
  const studentUnlockedProp = (student as any)?.unlockedBadgeIds || (student as any)?.unlocked_badge_ids;
  const earnedBadgeIds = useMemo(() => {
    return calculateStudentEarnedBadges({
      userId: studentUserId,
      projects: studentProjects,
      angkatan: student.angkatan,
      skills: student.skills,
      bio: student.bio,
      statusBadge: student.rawStatusBadge || student.statusBadge,
      cardSkin: activeSkinId,
      claimedBadgeIds: claimedExclusiveIds,
      unlockedBadgeIds: studentUnlockedProp,
    });
  }, [
    studentUserId,
    studentProjects,
    student.angkatan,
    student.skills,
    student.bio,
    student.rawStatusBadge,
    student.statusBadge,
    activeSkinId,
    claimedExclusiveIds,
    studentUnlockedProp,
  ]);

  // 4. Baca pengaturan rak sorotan dari localStorage (sinkron otomatis dengan "Rak Sorotan Kartu Profil")
  const [savedFeaturedBadgeIds, setSavedFeaturedBadgeIds] = useState<number[] | null>(null);

  useEffect(() => {
    const readFeatured = () => {
      try {
        const sid = student.id;
        const uid = student.userId;
        // PENTING: JANGAN PERNAH fallback ke generic "tazkia_featured_badges"!
        // Key tanpa ID adalah konfigurasi global milik user yang sedang login di browser ini,
        // sehingga jika dibaca di sini akan membocorkan lencana akun tersebut ke seluruh kartu mahasiswa lain.
        const saved =
          (uid ? localStorage.getItem(`tazkia_featured_badges_${uid}`) : null) ||
          (sid ? localStorage.getItem(`tazkia_featured_badges_${sid}`) : null);

        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed.filter((id: number) =>
              PENGHARGAAN_CATALOG.some((b) => b.id === id)
            );
            if (valid.length > 0) {
              setSavedFeaturedBadgeIds(valid.slice(0, 5));
              return;
            }
          }
        }

        if (student.featuredBadgeIds && student.featuredBadgeIds.length > 0) {
          setSavedFeaturedBadgeIds(student.featuredBadgeIds);
          return;
        }

        setSavedFeaturedBadgeIds(null);
      } catch {
        setSavedFeaturedBadgeIds(null);
      }
    };

    readFeatured();

    const handleBadgesUpdate = () => {
      readFeatured();
    };

    window.addEventListener("tazkia_featured_badges_updated", handleBadgesUpdate);
    window.addEventListener("storage", handleBadgesUpdate);
    return () => {
      window.removeEventListener("tazkia_featured_badges_updated", handleBadgesUpdate);
      window.removeEventListener("storage", handleBadgesUpdate);
    };
  }, [student.id, student.userId, student.featuredBadgeIds]);

  // 5. Featured 5 badge: ambil dari pilihan Rak custom atau peringkat prestisius (Terbatas & Emas terlebih dahulu)
  const getPrestigeScore = (badgeId: number) => {
    const b = PENGHARGAAN_CATALOG.find((x) => x.id === badgeId);
    if (!b) return 0;
    if (b.group === "terbatas" || b.tier === "khusus") return 100;
    if (b.tier === "emas") return 50;
    if (b.tier === "perak") return 20;
    return 10;
  };

  const studentRawFeatured = (student as any)?.featured_badge_ids;
  const earnedBadgeIdsSet = useMemo(() => new Set(earnedBadgeIds), [earnedBadgeIds]);

  const featuredBadgeIds = useMemo(() => {
    let candidates: number[] = [];

    // A. Dari kustomisasi Rak profil spesifik mahasiswa ini (localStorage & live event)
    if (savedFeaturedBadgeIds && savedFeaturedBadgeIds.length > 0) {
      candidates = savedFeaturedBadgeIds;
    }
    // B. Dari props / database profile
    else if (student.featuredBadgeIds && student.featuredBadgeIds.length > 0) {
      candidates = student.featuredBadgeIds;
    } else if (studentRawFeatured && studentRawFeatured.length > 0) {
      candidates = studentRawFeatured;
    }

    // FILTER MUTLAK: Hanya badge yang BENAR-BENAR telah diraih oleh mahasiswa ini (earnedBadgeIdsSet)
    // yang boleh dipajang di rak kartu depan! Mahasiswa tidak bisa memajang lencana yang belum diraih.
    const validEarned = candidates.filter((id) => earnedBadgeIdsSet.has(Number(id)));
    const sortedOwned = [...earnedBadgeIds].sort(
      (a, b) => getPrestigeScore(b) - getPrestigeScore(a)
    );

    if (validEarned.length > 0) {
      // Ambil badge pilihan custom, dan jika kurang dari 5 slot (namun mahasiswa memiliki lencana lain),
      // lengkapi sisa slot dari lencana yang telah diraih agar rak kartu depan tetap penuh/optimal
      const remaining = sortedOwned.filter((id) => !validEarned.map(Number).includes(Number(id)));
      const combined = [...validEarned, ...remaining];
      return combined.slice(0, 5);
    }

    // C. Fallback default jika belum pernah kustomisasi rak:
    // Urutkan badge yang SUDAH DIRAIH berdasarkan tingkat prestisius (Terbatas & Khusus -> Emas -> Perak -> Perunggu)
    if (sortedOwned.length > 0) {
      return sortedOwned.slice(0, 5);
    }

    // D. Jika belum ada badge yang diraih, rak kosong
    return [];
  }, [savedFeaturedBadgeIds, student.featuredBadgeIds, studentRawFeatured, earnedBadgeIds, earnedBadgeIdsSet]);

  // Badge yang diraih HANYA berasal dari evaluasi riil mahasiswa bersangkutan (TIDAK menyusupkan savedFeaturedBadgeIds)
  const allUnlockedBadgeIds = useMemo(() => {
    return earnedBadgeIds;
  }, [earnedBadgeIds]);

  const cardData: StudentCardData = {
    name: student.name,
    initials,
    angkatan: student.angkatan ? `ANGKATAN ${student.angkatan}` : undefined,
    statusIcon: getStatusIcon(student.rawStatusBadge || student.statusBadge),
    status: student.statusBadge || "Open for Collab",
    major: student.prodi || undefined,
    skills: student.skills && student.skills.length > 0 ? student.skills : [],
    bio: student.bio || undefined,
    roleTitle: `Mahasiswa Angkatan ${student.angkatan || 2}`,
    serial: `KTZ-${student.angkatan || "2026"}-${(student.id || "001").slice(0, 4).toUpperCase()}`,
    avatarUrl: student.avatarUrl || null,
    socials: student.socials,
    contactEmail: student.contactEmail,
    badges: student.badges,
    unlockedBadgeIds: allUnlockedBadgeIds,
    featuredBadgeIds: featuredBadgeIds,
    projects: studentProjects,
    cardSkin: activeSkinId,
  };

  const handleContact = () => {
    if (onMessageClick) {
      onMessageClick(student);
    } else if (student.contactEmail) {
      window.location.href = `mailto:${student.contactEmail}`;
    } else {
      onSelect(student);
    }
  };

  return (
    <div className={`w-full flex justify-center ${inClass}`}>
      <StudentCardRenderer
        skinId={activeSkinId}
        data={cardData}
        customPrimary={customColors.primary}
        customSecondary={customColors.secondary}
        enableTilt={true}
        onProfileClick={() => onSelect(student)}
        onContactClick={handleContact}
        onFilterAngkatan={
          onFilterAngkatan
            ? (ang) => {
                const num =
                  typeof ang === "number"
                    ? ang
                    : parseInt(String(ang).replace(/\D/g, ""), 10) || Number(student.angkatan) || 2;
                onFilterAngkatan(num);
              }
            : undefined
        }
        onFilterStatus={
          onFilterStatus
            ? (st) => onFilterStatus(st || student.statusBadge || "Open for Collab")
            : undefined
        }
        onFilterSkill={onFilterSkill}
      />
    </div>
  );
}
