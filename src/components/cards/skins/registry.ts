/**
 * 🗂️ Skin Registry
 * ─────────────────
 * Registry pusat untuk semua skin kartu mahasiswa.
 *
 * Semua skin terdaftar di sini. Saat mau tambah skin baru:
 * 1. Buat file baru di folder skins/ (misal SkinNamaKamu.ts)
 * 2. Import dan daftarkan di SKIN_REGISTRY di bawah
 * 3. Selesai! Otomatis muncul di preview modal & bisa dipilih.
 *
 * Untuk skin EKSKLUSIF (hanya orang tertentu yang dapat):
 * → Tambahkan `CardComponent` di SkinDefinition-nya
 * → Set `group: "khusus"` dan `tier: "mythic"` / "epic"
 * → Filter di SkinPreviewModal berdasarkan eligibility
 */

import type { SkinDefinition } from "./types";

// ─── Import semua skin ─────────────────────────────
import { SkinClassic } from "./umum/SkinClassic";
import { SkinCustom } from "./umum/SkinCustom";
import { SkinBEM2026 } from "./khusus/SkinBEM2026";
// ↑ Tambah import skin baru di sini (pisahkan umum & khusus)

// ─── REGISTRY ──────────────────────────────────────
/**
 * Map skinId → SkinDefinition.
 * Ini adalah "single source of truth" untuk semua skin yang tersedia.
 */
export const SKIN_REGISTRY: Record<string, SkinDefinition> = {
  classic: SkinClassic,
  custom: SkinCustom,
  bem2026: SkinBEM2026,
  // ↑ Tambah skin baru di sini (format: skinId: SkinDefinition)
};

/**
 * Daftar semua skin sebagai array (untuk iterasi di modal preview).
 * Urutan di sini = urutan tampil di UI.
 */
export const SKIN_LIST: SkinDefinition[] = [
  SkinClassic,
  SkinCustom,
  SkinBEM2026,
  // ↑ Tambah skin baru di sini (urutan = urutan tampil di modal)
];

/**
 * Ambil SkinDefinition berdasarkan ID.
 * Fallback ke Classic jika ID tidak ditemukan.
 */
export function getSkinDefinition(id?: string | null): SkinDefinition {
  if (!id || id === "default" || id === "standard") {
    return SKIN_REGISTRY.classic;
  }
  return SKIN_REGISTRY[id] || SKIN_REGISTRY.classic;
}

/**
 * Daftar skin yang boleh ditampilkan di modal preview (umum saja).
 * Skin khusus/eksklusif difilter karena butuh eligibility check.
 */
export function getPublicSkins(): SkinDefinition[] {
  return SKIN_LIST.filter((s) => s.group === "umum");
}

/**
 * Daftar semua skin (termasuk khusus) — untuk admin / debug.
 */
export function getAllSkins(): SkinDefinition[] {
  return SKIN_LIST;
}

/**
 * 🔒 Memeriksa apakah suatu skin kartu terbuka (unlocked) untuk mahasiswa.
 * - Skin dengan group === 'umum' bebas digunakan oleh semua mahasiswa.
 * - Skin dengan group === 'khusus' (eksklusif) HANYA terbuka jika mahasiswa
 *   memiliki `requiredBadgeId` terkait (misal Lencana Vanguard BEM 2026: ID 15)
 *   di dalam daftar lencana yang diperoleh / diklaim.
 */
export function isSkinUnlocked(
  skinIdOrDef?: string | SkinDefinition | null,
  userBadgeIds: (number | string)[] = []
): boolean {
  if (!skinIdOrDef) return true;
  const skin =
    typeof skinIdOrDef === "string" ? getSkinDefinition(skinIdOrDef) : skinIdOrDef;
  if (!skin) return true;

  // Skin umum selalu terbuka
  if (skin.group === "umum") return true;

  // Cek apakah mahasiswa memiliki hak akses skin eksklusif ini
  const strIds = userBadgeIds.map((id) => String(id).toLowerCase());
  const numericBadgeIds = userBadgeIds.map((id) => Number(id)).filter((id) => !isNaN(id));

  // 1. Cek string ID spesifik skin ini
  if (
    strIds.includes(skin.id.toLowerCase()) ||
    strIds.includes(`skin_${skin.id.toLowerCase()}`) ||
    strIds.includes(`skin:${skin.id.toLowerCase()}`)
  ) {
    return true;
  }

  // 2. Cek requiredBadgeId numerik jika ada
  if (skin.requiredBadgeId && numericBadgeIds.includes(skin.requiredBadgeId)) {
    return true;
  }

  // 3. Fallback khusus untuk ID 101 khusus skin BEM 2026
  if (skin.id === "bem2026" && numericBadgeIds.includes(101)) {
    return true;
  }

  // Jika skin khusus tidak terpenuhi syaratnya, terkunci
  return false;
}

