"use client";

import React from "react";
import { StudentCardRenderer } from "./StudentCardRenderer";
import type { StudentCardData } from "./base/StandardStudentCard";

export interface CardSkinPreviewProps {
  skinId?: string;
  customPrimary?: string;
  customSecondary?: string;
  enableTilt?: boolean;
  roleTitle?: string;
  serial?: string;
  className?: string;
}

/**
 * 🎴 CardSkinPreview
 * ─────────────────────────────────────────────────────────────
 * Komponen murni pratinjau visual template Skin Kartu 3D.
 * Selalu bersih (kosongan) tanpa data dummy mahasiswa,
 * sehingga aman digunakan oleh Admin Panel, Modal Lemari Tema,
 * atau katalog tanpa risiko data mahasiswa saling menimpa.
 */
export const CardSkinPreview: React.FC<CardSkinPreviewProps> = ({
  skinId = "bem2026",
  customPrimary,
  customSecondary,
  enableTilt = true,
  roleTitle,
  serial,
  className,
}) => {
  const previewBlankData: StudentCardData = {
    name: "Nama Mahasiswa",
    initials: "",
    angkatan: "",
    status: "",
    major: "Program Studi",
    skills: [],
    bio: "",
    roleTitle: roleTitle || (skinId === "bem2026" ? "Pengurus BEM STMIK Tazkia 2026" : "Mahasiswa STMIK Tazkia"),
    serial: serial || (skinId === "bem2026" ? "KTZ-2026-BEM-XXXX" : "KTZ-2026-STD-XXXX"),
    avatarUrl: null,
    socials: {},
    featuredBadgeIds: [],
    unlockedBadgeIds: [],
    projectCount: 0,
    cardSkin: skinId,
  };

  return (
    <div className={`w-[338px] max-w-full mx-auto shrink-0 ${className || ""}`}>
      <StudentCardRenderer
        skinId={skinId}
        data={previewBlankData}
        customPrimary={customPrimary}
        customSecondary={customSecondary}
        enableTilt={enableTilt}
        isPreview={true}
      />
    </div>
  );
};

export default CardSkinPreview;

