/**
 * Helper validasi URL aman terpusat.
 * Hanya mengizinkan protokol HTTP dan HTTPS untuk mencegah serangan Stored XSS
 * melalui pseudo-protokol seperti javascript:, data:, vbscript:, file:, dsb.
 */
export function isSafeHttpUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 2048) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Menormalkan input URL / handle sosial pengguna (username, @handle, link tanpa protokol)
 * menjadi URL absolut aman berprotokol https://.
 * Mengembalikan null jika input kosong (memungkinkan user mengosongkan field).
 * Mengembalikan null jika input mengandung protokol berbahaya (javascript:, data:, dsb).
 */
export function normalizeSocialUrl(
  raw?: string | null,
  platform: "github" | "linkedin" | "instagram" | "website" = "website"
): string | null {
  if (!raw || typeof raw !== "string") return null;
  let val = raw.trim();
  if (!val) return null;

  // Hapus karakter @ di depan jika user mengetik @username
  if (val.startsWith("@")) {
    val = val.substring(1).trim();
  }
  if (!val) return null;

  // Jika sudah memiliki protokol http: atau https:
  if (/^https?:\/\//i.test(val)) {
    return isSafeHttpUrl(val) ? val : null;
  }

  // Jika diawali pseudo-protokol terlarang (javascript:, vbscript:, data:, file:)
  if (/^[a-z0-9+.-]+:/i.test(val)) {
    return null;
  }

  // Normalisasi berdasarkan platform
  if (platform === "github") {
    if (/(?:^|\/\/)(?:www\.)?github\.com\//i.test(val)) {
      val = val.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "https://github.com/");
    } else {
      val = `https://github.com/${val}`;
    }
  } else if (platform === "instagram") {
    if (/(?:^|\/\/)(?:www\.)?instagram\.com\//i.test(val)) {
      val = val.replace(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\//i, "https://instagram.com/");
    } else {
      val = `https://instagram.com/${val}`;
    }
  } else if (platform === "linkedin") {
    if (/(?:^|\/\/)(?:[a-z]{2,3}\.)?linkedin\.com\//i.test(val)) {
      // Pertahankan subdomain lokal seperti id.linkedin.com jika ada
      val = /^https?:\/\//i.test(val) ? val : `https://${val}`;
    } else {
      val = `https://linkedin.com/in/${val}`;
    }
  } else {
    // Website / portofolio umum
    val = `https://${val}`;
  }

  return isSafeHttpUrl(val) ? val : null;
}
