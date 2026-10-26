"use client";

import React from "react";
import StandardStudentCard, { StudentCardData } from "./base/StandardStudentCard";
import { getSkinDefinition, createCustomSkinDefinition, isSkinUnlocked } from "./skins";
import type { SkinDefinition } from "./skins";

export interface StudentCardRendererProps {
  skinId?: string;
  data?: StudentCardData;
  customPrimary?: string;
  customSecondary?: string;
  enableTilt?: boolean;
  isSkeleton?: boolean;
  isPreview?: boolean;
  onContactClick?: () => void;
  onProfileClick?: () => void;
  onTriggerUnlock?: () => void;
  onFilterAngkatan?: (ang: any) => void;
  onFilterStatus?: (st: string) => void;
  onFilterSkill?: (sk: string) => void;
}

export const StudentCardRenderer: React.FC<StudentCardRendererProps> = ({
  skinId = "classic",
  data,
  customPrimary = "#FF8A2B",
  customSecondary = "#0B1F4A",
  enableTilt = true,
  isSkeleton = false,
  isPreview = false,
  onContactClick,
  onProfileClick,
  onTriggerUnlock,
  onFilterAngkatan,
  onFilterStatus,
  onFilterSkill,
}) => {
  // ─── Resolve skin dari registry ──────────────────
  let skin: SkinDefinition;

  if (skinId === "custom") {
    // Skin custom: gunakan warna pilihan user
    skin = createCustomSkinDefinition(customPrimary, customSecondary);
  } else {
    // Skin lainnya: lookup dari registry
    skin = getSkinDefinition(skinId);
  }

  // ─── Keamanan Skin Eksklusif ─────────────────────
  // Jika skin bersifat khusus / eksklusif dan BUKAN dalam mode pratinjau,
  // verifikasi bahwa mahasiswa memiliki lencana eksklusif yang dibutuhkan.
  if (skin.group === "khusus" && !isPreview) {
    const userBadges = [
      ...(data?.unlockedBadgeIds || []),
      ...(data?.featuredBadgeIds || []),
    ];
    if (!isSkinUnlocked(skin, userBadges)) {
      // Fallback aman ke Tazkia Classic jika tidak berhak
      skin = getSkinDefinition("classic");
    }
  }

  // ─── Shared props untuk kartu ────────────────────
  const sharedProps = {
    data,
    enableTilt,
    isSkeleton,
    isPreview,
    onContactClick,
    onProfileClick,
    onTriggerUnlock,
    onFilterAngkatan,
    onFilterStatus,
    onFilterSkill,
  };

  // ─── Render ──────────────────────────────────────

  // Jika skin punya CardComponent khusus (untuk skin eksklusif),
  // render komponen tersebut langsung
  if (skin.CardComponent) {
    const ExclusiveCard = skin.CardComponent;
    return (
      <ExclusiveCard
        {...sharedProps}
        primaryColor={skin.primaryColor}
        secondaryColor={skin.secondaryColor}
      />
    );
  }

  // Skin standar: pakai StudentCardBase (StandardStudentCard) + warna dari skin
  return (
    <StandardStudentCard
      {...sharedProps}
      primaryColor={skin.primaryColor}
      secondaryColor={skin.secondaryColor}
    />
  );
};

export default StudentCardRenderer;
