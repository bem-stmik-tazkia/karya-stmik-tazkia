"use client";

import React, { useState, useEffect } from "react";
import { Student } from "@/types/student";
import StudentCardRenderer from "@/components/mahasiswa/cards/StudentCardRenderer";
import type { StudentCardData } from "@/components/mahasiswa/cards/umum/StandardStudentCard";

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
    const readSkin = () => {
      try {
        // 1. Direct student property
        const directSkin =
          student.cardSkin ||
          (student as any).skin_id ||
          (student as any).card_skin;
        if (directSkin) {
          setActiveSkinId(directSkin);
          return;
        }

        // 2. Specific student localStorage
        const studentSpecificSkin =
          (student.id ? localStorage.getItem(`tazkia_profile_skin_${student.id}`) : null) ||
          (student.userId ? localStorage.getItem(`tazkia_profile_skin_${student.userId}`) : null);

        if (studentSpecificSkin) {
          setActiveSkinId(studentSpecificSkin);
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
        if (detail.skinId) setActiveSkinId(detail.skinId);
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

  // Helper for status icon matching the card aesthetics
  const getStatusIcon = (status?: string) => {
    if (!status) return "🟠";
    const s = status.toLowerCase();
    if (s.includes("freelance")) return "🟢";
    if (s.includes("collab")) return "🟠";
    if (s.includes("magang") || s.includes("intern")) return "🎯";
    if (s.includes("belajar") || s.includes("studi")) return "📚";
    if (s.includes("mentor") || s.includes("karir")) return "🔍";
    return "🟠";
  };

  const cardData: StudentCardData = {
    name: student.name,
    initials,
    angkatan: student.angkatan ? `ANGKATAN ${student.angkatan}` : "ANGKATAN 2",
    statusIcon: getStatusIcon(student.statusBadge),
    status: student.statusBadge || "Open for Collab",
    major: student.prodi || "Sistem Informasi",
    skills:
      student.skills && student.skills.length > 0
        ? student.skills
        : ["UI/UX Design", "Frontend Dev"],
    bio: student.bio || "Mahasiswa kreatif STMIK Tazkia yang siap berkarya & berkolaborasi.",
    roleTitle: `Mahasiswa Angkatan ${student.angkatan || 2}`,
    serial: `KTZ-${student.angkatan || "2026"}-${(student.id || "001").slice(0, 4).toUpperCase()}`,
    avatarUrl: student.avatarUrl || null,
    socials: student.socials,
    contactEmail: student.contactEmail,
    badges: student.badges,
    featuredBadgeIds:
      (student as any).featuredBadgeIds ||
      (student as any).featured_badge_ids || [9, 4, 7, 10, 14],
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
