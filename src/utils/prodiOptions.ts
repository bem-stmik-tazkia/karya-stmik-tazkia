export const ALL_PRODI_VALUE = "ALL";

export const PRODI_OPTIONS = [
  { value: "Teknik Informatika", label: "Teknik Informatika" },
  { value: "Sistem Informasi", label: "Sistem Informasi" },
  { value: "Bisnis Digital", label: "Bisnis Digital" },
];

export const PRODI_FILTER_OPTIONS = [
  { value: ALL_PRODI_VALUE, label: "Semua Prodi" },
  ...PRODI_OPTIONS,
];

export function isAllProdi(value: string) {
  return value === ALL_PRODI_VALUE || value === "" || value.toLowerCase() === "semua prodi";
}

export function getProdiDisplayLabel(prodi: string) {
  if (!prodi || isAllProdi(prodi)) return "Semua Prodi";
  return prodi;
}
