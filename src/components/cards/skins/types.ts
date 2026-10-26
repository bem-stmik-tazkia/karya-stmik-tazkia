import type React from "react";

// ─── DATA KARTU (re-export dari StandardStudentCard) ─────────────────
export type { StudentCardData } from "@/components/cards/base/StandardStudentCard";

/**
 * Props yang diterima oleh komponen kartu skin
 * (baik StudentCardBase maupun CardComponent eksklusif).
 */
export interface SkinCardProps {
  data?: import("@/components/cards/base/StandardStudentCard").StudentCardData;
  primaryColor?: string;
  secondaryColor?: string;
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

/**
 * Definisi lengkap satu skin kartu mahasiswa.
 *
 * ─ Skin "umum" (Classic, Custom, dan skin warna lainnya):
 *   → Cukup isi warna. Otomatis pakai StudentCardBase (StandardStudentCard).
 *
 * ─ Skin "khusus" / eksklusif (nanti kalau mau tambah):
 *   → Sediakan `CardComponent` untuk tampilan 100% kustom.
 *   → CardComponent menerima SkinCardProps dan me-render seluruh kartu.
 *
 * Setiap skin = 1 file di folder skins/
 */
export interface SkinDefinition {
  /** ID unik skin, dipakai sebagai key di registry & localStorage */
  id: string;

  /** Nama tampil skin (misal "Tazkia Classic") */
  name: string;

  /** Tagline singkat untuk di modal preview */
  tagline: string;

  /** Label badge tier (misal "Bawaan", "Kustom", "Mythic · Khusus") */
  badge: string;

  /** Tier skin, menentukan kelangkaan */
  tier: "standard" | "rare" | "epic" | "mythic";

  /** Grup skin: umum (bisa dipilih semua mahasiswa) atau khusus (eksklusif) */
  group: "umum" | "khusus";

  /** Deskripsi lengkap skin untuk tooltip / modal */
  description: string;

  // ─── WARNA ───────────────────────────────────
  /** Warna aksen utama (tombol, garis, ring avatar, dsb) */
  primaryColor: string;

  /** Warna dasar / latar header */
  secondaryColor: string;

  // ─── METADATA PREVIEW ────────────────────────
  /** Gradient untuk header preview di skinConfig (opsional) */
  headerGradient?: string;

  /** Background preview card kecil di modal (opsional) */
  previewBg?: string;

  // ─── COMPONENT OVERRIDE (OPSIONAL) ───────────
  /**
   * Jika disediakan, komponen ini me-render SELURUH kartu (depan + belakang).
   * Digunakan untuk skin eksklusif yang punya visual 100% berbeda
   * (custom border, efek partikel, animasi circuit, dll).
   *
   * Jika TIDAK diisi → otomatis pakai StudentCardBase (StandardStudentCard)
   * dengan warna dari primaryColor & secondaryColor.
   */
  CardComponent?: React.ComponentType<SkinCardProps>;

  // ─── EKSKLUSIVITAS & KEAMANAN ───────────────
  /** ID badge yang diperlukan untuk membuka skin ini (jika eksklusif) */
  requiredBadgeId?: number;

  /** Syarat teks untuk membuka skin (ditampilkan saat terkunci) */
  unlockRequirement?: string;
}

