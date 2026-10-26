import { PENGHARGAAN_CATALOG, type PenghargaanBadge } from "@/data/penghargaanCatalog";

export interface AngkatanItem {
  value: string;
  label: string;
}

export const DEFAULT_PRODI: string[] = ["Teknik Informatika", "Sistem Informasi", "Bisnis Digital"];

export const DEFAULT_ANGKATAN: AngkatanItem[] = [
  { value: "1", label: "Angkatan 1" },
  { value: "2", label: "Angkatan 2" },
];

export const EXCLUSIVE_BADGES: PenghargaanBadge[] = PENGHARGAAN_CATALOG.filter(
  (b) => b.group === "terbatas" || b.tier === "khusus" || [14, 15, 16].includes(b.id)
);

export function parseAngkatan(raw: string): AngkatanItem[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_ANGKATAN;
    if (typeof parsed[0] === "string") {
      return parsed.map((v: string) => ({ value: v, label: `Angkatan ${v}` }));
    }
    return parsed as AngkatanItem[];
  } catch {
    return DEFAULT_ANGKATAN;
  }
}

export type DeleteItemState =
  | { type: "prodi"; value: string }
  | { type: "angkatan"; item: AngkatanItem }
  | null;

export interface GrantToRevokeState {
  id: string;
  badgeName: string;
  recipientName: string;
  recipientId?: string;
  badgeId?: number;
}

