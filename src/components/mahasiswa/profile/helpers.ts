import type { Karya } from "@/types/karya";

export function isStudentKarya(
  k: Karya,
  studentName: string,
  studentUserId?: string | null,
  studentId?: string | null
): boolean {
  if (studentUserId && k.user_id === studentUserId) return true;
  if (studentId && k.user_id === studentId) return true;
  if (k.team && Array.isArray(k.team)) {
    return k.team.some((tm: any) => {
      if (tm.status === "rejected") return false;
      if (studentUserId && tm.user_id === studentUserId) return true;
      if (studentId && tm.user_id === studentId) return true;
      if (tm.name && tm.name.toLowerCase() === studentName.toLowerCase()) return true;
      return false;
    });
  }
  return false;
}

export function normalizeStatusBadge(raw?: string | null): string {
  if (!raw) return "Open for Collab";
  // Remove leading emojis/special chars and trim
  const cleaned = raw.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s]+/u, "").trim();
  return cleaned || "Open for Collab";
}

export { getStatusIcon } from "@/components/mahasiswa/directory/studentHelpers";

