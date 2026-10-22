export type BadgeTier = 'perunggu' | 'perak' | 'emas' | 'khusus';
export type BadgeGroup = 'umum' | 'terbatas';

export interface PenghargaanBadge {
  id: number;
  code: string;
  name: string;
  tier: BadgeTier;
  tierLabel: string;
  tierEmoji?: string;
  group: BadgeGroup;
  symbolKey: string;
  symbolLabel: string;
  mission: string;
  philosophy: string;
  categoryTag?: string;
  defaultUnlocked?: boolean;
  hasShimmer?: boolean;
  hasOrbitAnimation?: boolean;
}

export const PENGHARGAAN_CATALOG: PenghargaanBadge[] = [
  {
    id: 1,
    code: 'karya_perdana',
    name: 'Karya Perdana',
    tier: 'perunggu',
    tierLabel: 'PERUNGGU',
    tierEmoji: '',
    group: 'umum',
    symbolKey: 'rocket',
    symbolLabel: 'Roket Meluncur',
    mission: 'Mempublikasikan dan meloloskan 1 karya pertama ke galeri kampus.',
    philosophy: 'Simbol awal mula perjalanan berkarya dan keberanian memulai.',
    defaultUnlocked: true,
  },
  {
    id: 2,
    code: 'kolektor_karya',
    name: 'Kolektor Karya',
    tier: 'perak',
    tierLabel: 'PERAK',
    tierEmoji: '',
    group: 'umum',
    symbolKey: 'diamond_archive',
    symbolLabel: 'Arsip Berlian',
    mission: 'Memiliki minimal 3 karya aktif dari berbagai kategori di galeri.',
    philosophy: 'Simbol konsistensi dan produktivitas portofolio mahasiswa.',
    defaultUnlocked: false,
  },
  {
    id: 3,
    code: 'terverifikasi_kampus',
    name: 'Terverifikasi Kampus',
    tier: 'perak',
    tierLabel: 'PERAK',
    tierEmoji: '',
    group: 'umum',
    symbolKey: 'shield_check',
    symbolLabel: 'Perisai Bercentang (Shield of Truth)',
    mission: 'Karya lolos proses validasi & uji kurasi oleh tim kurator/dosen.',
    philosophy: 'Simbol standar mutu dan kredibilitas akademik kampus.',
    defaultUnlocked: true,
  },
  {
    id: 4,
    code: 'sorotan_kurator',
    name: 'Sorotan Kurator',
    tier: 'emas',
    tierLabel: 'EMAS',
    tierEmoji: '',
    group: 'umum',
    symbolKey: 'spotlight_star',
    symbolLabel: 'Bintang Sorot (Spotlight Star)',
    mission: 'Memiliki karya yang terpilih masuk ke dalam Sorotan Kurator Kampus (Karya Terbaik pilihan kurator).',
    philosophy: 'Simbol karya terbaik pilihan kurator kampus (crème de la crème). Sekali diraih, lencana kehormatan ini bersifat permanen.',
    defaultUnlocked: false,
    hasOrbitAnimation: true,
  },
  {
    id: 5,
    code: 'favorit_komunitas',
    name: 'Favorit Komunitas',
    tier: 'perak',
    tierLabel: 'PERAK',
    tierEmoji: '',
    group: 'umum',
    symbolKey: 'glowing_heart',
    symbolLabel: 'Hati Berpendar (Glowing Heart)',
    mission: 'Portofolio atau karya mengumpulkan akumulasi 15+ likes/apresiasi (atau 1 karya dengan minimal 8 likes).',
    philosophy: 'Simbol karya yang menginspirasi dan dicintai audiens kampus.',
    defaultUnlocked: false,
  },
  {
    id: 6,
    code: 'sinergi_kolaborasi',
    name: 'Sinergi Kolaborasi',
    tier: 'perunggu',
    tierLabel: 'PERUNGGU',
    tierEmoji: '',
    group: 'umum',
    symbolKey: 'network_nodes',
    symbolLabel: 'Node Jaringan Terhubung',
    mission: 'Terdaftar dalam karya kolaborasi bersama minimal 1 rekan mahasiswa lainnya.',
    philosophy: 'Simbol kekuatan kerja sama tim dan kolaborasi lintas disiplin.',
    defaultUnlocked: false,
  },
  {
    id: 7,
    code: 'multi_talenta',
    name: 'Multi-Talenta',
    tier: 'perak',
    tierLabel: 'PERAK',
    tierEmoji: '',
    group: 'umum',
    symbolKey: 'crystal_prism',
    symbolLabel: 'Prisma Kristal 3D',
    mission: 'Memiliki karya dengan penguasaan multi-bidang (misal: UI/UX + Backend + Business Model).',
    philosophy: 'Simbol fleksibilitas dan spektrum keahlian yang luas.',
    defaultUnlocked: false,
  },
  {
    id: 8,
    code: 'peneliti_muda',
    name: 'Peneliti Muda',
    tier: 'perak',
    tierLabel: 'PERAK',
    tierEmoji: '',
    group: 'umum',
    categoryTag: 'Kategori: Riset & Ilmiah',
    symbolKey: 'silver_scroll',
    symbolLabel: 'Gulungan Naskah & Pena Perak-Siber',
    mission: 'Mempublikasikan karya pada kategori Riset, jurnal ilmiah, atau prototipe skripsi.',
    philosophy: 'Simbol integritas riset, metodologi ilmiah, dan kontribusi akademik.',
    defaultUnlocked: false,
  },
  {
    id: 9,
    code: 'inovasi_berdampak',
    name: 'Inovasi Berdampak',
    tier: 'emas',
    tierLabel: 'EMAS',
    tierEmoji: '',
    group: 'umum',
    symbolKey: 'live_signal_globe',
    symbolLabel: 'Globe Sinyal Orbit (Live App)',
    mission: 'Karya dilengkapi link live demo aktif atau telah digunakan secara langsung oleh pengguna nyata.',
    philosophy: 'Simbol karya nyata yang hidup, terpublikasi online, dan memberi manfaat langsung.',
    defaultUnlocked: false,
    hasOrbitAnimation: true,
  },
  {
    id: 10,
    code: 'kreator_web_app',
    name: 'Kreator Web & Aplikasi',
    tier: 'perak',
    tierLabel: 'PERAK',
    tierEmoji: '',
    group: 'umum',
    categoryTag: 'Kategori: Web / Aplikasi',
    symbolKey: 'web_app_portal',
    symbolLabel: 'Layar Browser & Mobile App </>',
    mission: 'Mempublikasikan karya pada kategori Pengembangan Web atau Aplikasi Mobile.',
    philosophy: 'Simbol rekayasa perangkat lunak dan arsitektur solusi digital.',
    defaultUnlocked: false,
  },
  {
    id: 11,
    code: 'kreator_desain',
    name: 'Kreator Desain & Lainnya',
    tier: 'perak',
    tierLabel: 'PERAK',
    tierEmoji: '',
    group: 'umum',
    categoryTag: 'Kategori: Desain & Kreatif',
    symbolKey: 'design_pen_vector',
    symbolLabel: 'Pen Tool Vektor & Kurva Bezier',
    mission: 'Mempublikasikan karya pada kategori Desain UI/UX, Visual, Multimedia, & Kreatif Lainnya.',
    philosophy: 'Simbol estetika visual, empati pengguna, dan ekspresi kreatif.',
    defaultUnlocked: false,
  },
  {
    id: 12,
    code: 'inovator_iot',
    name: 'Inovator IoT',
    tier: 'perak',
    tierLabel: 'PERAK',
    tierEmoji: '',
    group: 'umum',
    categoryTag: 'Kategori: IoT & Hardware',
    symbolKey: 'iot_microchip',
    symbolLabel: 'Chip Mikrokontroler & Sinyal Sensor',
    mission: 'Mempublikasikan karya pada kategori Internet of Things (IoT), Robotika, atau Smart Hardware.',
    philosophy: 'Simbol integrasi cerdas antara perangkat keras fisik dan sistem cloud.',
    defaultUnlocked: false,
  },
  {
    id: 13,
    code: 'master_5_kategori',
    name: 'Master 5 Kategori',
    tier: 'emas',
    tierLabel: 'EMAS',
    tierEmoji: '',
    group: 'umum',
    categoryTag: 'Puncak Lintas 5 Kategori',
    symbolKey: 'pentagon_master',
    symbolLabel: 'Bintang Pentagon 5-Kategori Terhubung',
    mission: 'Memiliki karya aktif yang mencakup 5 kategori proyek berbeda di galeri kampus.',
    philosophy: 'Simbol penguasaan paripurna lintas disiplin teknologi, riset, dan desain.',
    defaultUnlocked: false,
    hasOrbitAnimation: true,
  },
  {
    id: 14,
    code: 'pelopor_tazkia',
    name: 'Pelopor Tazkia',
    tier: 'khusus',
    tierLabel: 'TERBATAS',
    tierEmoji: '',
    group: 'terbatas',
    symbolKey: 'eternal_torch',
    symbolLabel: 'Obor Api Abadi',
    mission: 'Mahasiswa angkatan awal yang pertama kali meramaikan ekosistem galeri Karya Tazkia.',
    philosophy: 'Simbol pionir pembuka jalan dan penjaga api semangat berkarya.',
    defaultUnlocked: false,
    hasOrbitAnimation: true,
  },
  {
    id: 15,
    code: 'bem_2026',
    name: 'Vanguard BEM 2026',
    tier: 'khusus',
    tierLabel: 'TERBATAS',
    tierEmoji: '👑',
    group: 'terbatas',
    symbolKey: 'bem_crown_26',
    symbolLabel: 'Mahkota Emas & Angkatan 26',
    mission: 'Lencana kehormatan eksklusif kabinet & penggerak BEM STMIK Tazkia 2026.',
    philosophy: 'Simbol kepemimpinan berani, integritas tinggi, dan dedikasi penuh bagi kemajuan kampus.',
    defaultUnlocked: false,
    hasOrbitAnimation: true,
    hasShimmer: true,
  },
  {
    id: 16,
    code: 'ristek_quantum_2026',
    name: 'Ristek Quantum Cyber',
    tier: 'khusus',
    tierLabel: 'TERBATAS',
    tierEmoji: '⚡',
    group: 'terbatas',
    symbolKey: 'ristek_quantum',
    symbolLabel: 'Quantum Cyber Architect & Hardhat',
    mission: 'Lencana pencapaian pengembang teknologi kuantum & arsitek sistem digital Ristek 2026.',
    philosophy: 'Simbol inovasi komputasi masa depan dan dedikasi riset teknologi tinggi.',
    defaultUnlocked: false,
    hasOrbitAnimation: true,
    hasShimmer: true,
  },
];

export function getBadgeByCode(code: string): PenghargaanBadge | undefined {
  return PENGHARGAAN_CATALOG.find((b) => b.code === code);
}

export function getBadgeById(id: number): PenghargaanBadge | undefined {
  return PENGHARGAAN_CATALOG.find((b) => b.id === id);
}

export interface StudentBadgeEvaluationParams {
  userId?: string | null;
  projects?: Array<{
    category?: string;
    status?: string;
    views?: number;
    likes?: number;
    views_count?: number;
    likes_count?: number;
    live_url?: string | null;
    github_url?: string | null;
    team?: any;
    is_featured?: boolean;
    is_curator_spotlight?: boolean;
    tech_stack?: string[];
  }>;
  angkatan?: number | string | null;
  skills?: string[] | null;
  bio?: string | null;
  statusBadge?: string | null;
  cardSkin?: string | null;
  unlockedBadgeIds?: number[];
  unlocked_badge_ids?: number[];
  claimedBadgeIds?: number[];
}

const PERSISTED_BADGES_KEY_PREFIX = "tazkia_persisted_badges_";

/**
 * Mengambil lencana yang pernah diraih mahasiswa dari penyimpanan lokal.
 * Prinsip: Penghargaan yang sudah pernah diraih bersifat PERMANEN dan tidak akan hilang
 * meskipun peringkat, jumlah like, atau views berfluktuasi/turun.
 */
export function getPersistedEarnedBadges(userId?: string | null): number[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = localStorage.getItem(`${PERSISTED_BADGES_KEY_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((n) => Number(n)).filter((n) => !isNaN(n));
      }
    }
  } catch (err) {
    console.error("Gagal membaca lencana tersimpan:", err);
  }
  return [];
}

/**
 * Menyimpan lencana yang telah diraih secara permanen (union dengan yang sudah ada).
 */
export function savePersistedEarnedBadges(userId?: string | null, badgeIds: number[] = []): number[] {
  if (typeof window === "undefined" || !userId) return badgeIds;
  try {
    const existing = getPersistedEarnedBadges(userId);
    const merged = Array.from(new Set([...existing, ...badgeIds])).sort((a, b) => a - b);
    localStorage.setItem(`${PERSISTED_BADGES_KEY_PREFIX}${userId}`, JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.error("Gagal menyimpan lencana permanen:", err);
    return badgeIds;
  }
}

export interface BadgeMissionProgress {
  badgeId: number;
  badgeName: string;
  isUnlocked: boolean;
  current: number;
  target: number;
  unit: string;
  percentage: number;
  requirementText: string;
  progressText: string;
  remainingText: string;
  statusLabel: string;
}

/**
 * Logika evaluasi penghargaan mahasiswa berdasarkan data riil karya & profil
 */
export function calculateStudentEarnedBadges(params: StudentBadgeEvaluationParams): number[] {
  const {
    userId,
    projects = [],
    angkatan,
    skills = [],
    bio = "",
    statusBadge = "",
    cardSkin = "",
    unlockedBadgeIds,
    unlocked_badge_ids,
    claimedBadgeIds,
  } = params;
  const earned = new Set<number>();

  // 1. Masukkan lencana yang pernah diraih sebelumnya (Lencana bersifat PERMANEN, tidak hilang jika posisi/skor turun)
  if (userId) {
    const persisted = getPersistedEarnedBadges(userId);
    persisted.forEach((id) => earned.add(Number(id)));
  }

  // 2. Masukkan manual unlocked badge IDs jika ada (misal dari DB)
  const manualIds = unlockedBadgeIds || unlocked_badge_ids;
  if (Array.isArray(manualIds)) {
    manualIds.forEach((id) => earned.add(Number(id)));
  }

  // 3. Masukkan lencana eksklusif yang telah diklaim oleh user
  if (Array.isArray(claimedBadgeIds)) {
    claimedBadgeIds.forEach((id) => earned.add(Number(id)));
  }

  const getLikes = (p: any) => Number(p.likes ?? p.likes_count ?? 0) || 0;
  const getViews = (p: any) => Number(p.views ?? p.views_count ?? 0) || 0;

  const angkatanNum = Number(angkatan) || 2024;
  const approvedProjects = projects.filter((p) => p.status === 'approved' || !p.status);
  const totalLikes = projects.reduce((acc, p) => acc + getLikes(p), 0);
  const bioLower = (bio || '').toLowerCase();
  const statusLower = (statusBadge || '').toLowerCase();
  const skinLower = (cardSkin || '').toLowerCase();
  const skillsLower = (skills || []).map((s) => (s || '').toLowerCase());

  // 1. Karya Perdana (ID: 1): Minimal 1 karya diunggah
  if (projects.length >= 1) {
    earned.add(1);
  }

  // 2. Kolektor Karya (ID: 2): Minimal 3 karya aktif
  if (projects.length >= 3) {
    earned.add(2);
  }

  // 3. Terverifikasi Kampus (ID: 3): Minimal 1 karya berstatus approved/lolos kurasi
  if (approvedProjects.length >= 1) {
    earned.add(3);
  }

  // 4. Sorotan Kurator (ID: 4): Memiliki karya yang masuk ke sorotan kurator kampus (is_featured, is_curator_spotlight, atau skor interaksi masuk podium top kurator)
  const hasSpotlightScore = projects.some((p: any) => {
    const l = getLikes(p);
    const v = getViews(p);
    const score = l * 3 + v;
    return Boolean(p.is_featured || p.is_curator_spotlight || score >= 15);
  });
  if (hasSpotlightScore) {
    earned.add(4);
  }

  // 5. Favorit Komunitas (ID: 5): Total likes akumulasi >= 15 atau ada 1 proyek dengan likes >= 8
  if (totalLikes >= 15 || projects.some((p) => getLikes(p) >= 8)) {
    earned.add(5);
  }

  // 6. Sinergi Kolaborasi (ID: 6): Mengerjakan dan terdaftar dalam minimal 1 karya kolaborasi tim (minimal 2 anggota)
  const hasTeam = projects.some((p) => {
    if (!Array.isArray(p.team) || p.team.length < 2) return false;
    const validMembers = p.team.filter((m) => m && m.name && m.status !== "rejected");
    return validMembers.length >= 2;
  });
  if (hasTeam) {
    earned.add(6);
  }

  // 7. Multi-Talenta (ID: 7): Memiliki minimal 3 skill atau karya lintas stack
  const validSkillsCount = (skills || []).filter((s) => Boolean(s && typeof s === 'string' && s.trim())).length;
  if (validSkillsCount >= 3) {
    earned.add(7);
  }

  // 8. Peneliti Muda (ID: 8): Karya di kategori riset/ilmiah
  const hasRiset = projects.some((p) => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('riset') || cat.includes('ilmiah') || cat.includes('akademik') || cat.includes('research');
  });
  if (hasRiset) {
    earned.add(8);
  }

  // 9. Inovasi Berdampak (ID: 9): Karya memiliki link live demo / URL publik
  const getLiveDemoUrl = (p: any) => {
    const url = p.live_url || p.demo_url || p.liveUrl || p.demoUrl;
    return typeof url === 'string' ? url.trim() : '';
  };
  const hasLiveDemo = projects.some((p) => Boolean(getLiveDemoUrl(p)));
  if (hasLiveDemo) {
    earned.add(9);
  }

  // 10. Kreator Web & Aplikasi (ID: 10)
  const hasWebApp = projects.some((p) => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('web') || cat.includes('aplikasi') || cat.includes('software') || cat.includes('mobile') || cat.includes('programming') || cat.includes('technology');
  });
  if (hasWebApp) {
    earned.add(10);
  }

  // 11. Kreator Desain & Kreatif (ID: 11)
  const hasDesign = projects.some((p) => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('desain') || cat.includes('design') || cat.includes('ui/ux') || cat.includes('kreatif') || cat.includes('multimedia');
  });
  if (hasDesign) {
    earned.add(11);
  }

  // 12. Inovator IoT (ID: 12)
  const hasIoT = projects.some((p) => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('iot') || cat.includes('hardware') || cat.includes('robot') || cat.includes('embedded');
  });
  if (hasIoT) {
    earned.add(12);
  }

  // 13. Master 5 Kategori (ID: 13): Memiliki 5 kategori berbeda
  const distinctCategories = new Set(projects.map((p) => (p.category || '').trim().toLowerCase()).filter(Boolean));
  if (distinctCategories.size >= 5) {
    earned.add(13);
  }

  // 14. Pelopor Tazkia (ID: 14)
  // 15. Vanguard BEM 2026 (ID: 15)
  // 16. Ristek Quantum Cyber (ID: 16)
  // Lencana kehormatan eksklusif / terbatas ini KHUSUS dikirim langsung oleh Admin ke user, lalu diklaim oleh user.
  // Mereka hanya masuk ke daftar diraih jika telah diklaim (claimedBadgeIds atau manualIds).

  const finalEarned = Array.from(earned).sort((a, b) => a - b);
  // Simpan secara permanen ke storage sehingga pencapaian tidak pernah hilang jika skor/posisi turun
  if (userId) {
    savePersistedEarnedBadges(userId, finalEarned);
  }
  return finalEarned;
}

/**
 * Menghitung progres riil misi untuk badge tertentu
 */
export function getBadgeMissionProgress(
  badgeId: number,
  params: StudentBadgeEvaluationParams
): BadgeMissionProgress {
  const {
    projects = [],
    angkatan,
    skills = [],
    bio = "",
    statusBadge = "",
    cardSkin = "",
    unlockedBadgeIds,
    unlocked_badge_ids,
  } = params;

  const badge = getBadgeById(badgeId);
  const badgeName = badge ? badge.name : `Penghargaan #${badgeId}`;
  const earnedIds = calculateStudentEarnedBadges(params);
  const isUnlocked = earnedIds.includes(badgeId);

  const getLikes = (p: any) => Number(p.likes ?? p.likes_count ?? 0) || 0;
  const getViews = (p: any) => Number(p.views ?? p.views_count ?? 0) || 0;

  const approvedProjects = projects.filter((p) => p.status === 'approved' || !p.status);
  const totalLikes = projects.reduce((acc, p) => acc + getLikes(p), 0);
  const angkatanNum = Number(angkatan) || 2024;
  const distinctCategories = new Set(projects.map((p) => (p.category || '').trim().toLowerCase()).filter(Boolean));
  const validSkillsCount = (skills || []).filter((s) => Boolean(s && typeof s === 'string' && s.trim())).length;

  let current = 0;
  let target = 1;
  let unit = "Karya";
  let requirementText = badge?.mission || "";
  let progressText = "";
  let remainingText = "";

  switch (badgeId) {
    case 1: // Karya Perdana
      target = 1;
      current = isUnlocked ? 1 : projects.length;
      unit = "Karya";
      requirementText = "Publikasikan minimal 1 karya pertama ke galeri kampus.";
      progressText = `${Math.min(current, target)} / ${target} Karya`;
      remainingText = isUnlocked ? "Misi Selesai! (Penghargaan Permanen)" : "Unggah 1 karya untuk membuka";
      break;

    case 2: // Kolektor Karya
      target = 3;
      current = isUnlocked ? 3 : projects.length;
      unit = "Karya";
      requirementText = "Memiliki minimal 3 karya aktif di galeri kampus.";
      progressText = `${Math.min(current, target)} / ${target} Karya`;
      remainingText = isUnlocked ? "Misi Selesai! (Penghargaan Permanen)" : `Kurang ${Math.max(0, target - current)} karya lagi`;
      break;

    case 3: // Terverifikasi Kampus
      target = 1;
      current = isUnlocked ? 1 : approvedProjects.length;
      unit = "Karya Kurasi";
      requirementText = "Minimal 1 karya berstatus disetujui / lolos kurasi kurator kampus.";
      progressText = `${Math.min(current, target)} / ${target} Karya Disetujui`;
      remainingText = isUnlocked ? "Misi Selesai! (Penghargaan Permanen)" : "Tunggu kurasi karya disetujui";
      break;

    case 4: { // Sorotan Kurator
      target = 1;
      const hasSpotlightScore = projects.some((p: any) => {
        const l = getLikes(p);
        const v = getViews(p);
        const score = l * 3 + v;
        return Boolean(p.is_featured || p.is_curator_spotlight || score >= 15);
      });
      const isCuratorChosen = isUnlocked || hasSpotlightScore;
      current = isCuratorChosen ? 1 : 0;
      unit = "Karya Kurator";
      requirementText = "Memiliki minimal 1 karya yang terpilih masuk ke dalam Sorotan Kurator Kampus (Karya Terbaik pilihan kurator di Beranda/Galeri).";
      progressText = isCuratorChosen ? "1 / 1 Karya Terpilih" : "0 / 1 Karya Terpilih";
      remainingText = isUnlocked || isCuratorChosen
        ? "Misi Selesai! (Lencana ini bersifat permanen & tidak akan hilang meskipun posisi karya bergeser)"
        : "Tingkatkan apresiasi & kualitas karya Anda hingga masuk ke dalam Sorotan Kurator Kampus";
      break;
    }

    case 5: // Favorit Komunitas
      target = 15;
      current = isUnlocked ? Math.max(15, totalLikes) : totalLikes;
      unit = "Likes";
      requirementText = "Mengumpulkan akumulasi minimal 15 apresiasi/likes dari civitas kampus.";
      progressText = `${Math.min(current, target)} / ${target} Likes`;
      remainingText = isUnlocked ? "Misi Selesai! (Penghargaan Permanen)" : `Kurang ${Math.max(0, target - current)} likes lagi`;
      break;

    case 6: // Sinergi Kolaborasi
      target = 1;
      const teamCount = projects.filter((p) => {
        if (!Array.isArray(p.team) || p.team.length < 2) return false;
        const validMembers = p.team.filter((m) => m && m.name && m.status !== "rejected");
        return validMembers.length >= 2;
      }).length;
      current = isUnlocked ? Math.max(1, teamCount) : teamCount;
      unit = "Karya Kolaborasi";
      requirementText = "Mengerjakan dan terdaftar dalam minimal 1 karya kolaborasi tim (minimal 2 anggota).";
      progressText = `${Math.min(current, target)} / ${target} Karya Tim`;
      remainingText = isUnlocked ? "Misi Selesai! (Penghargaan Permanen)" : "Tambahkan rekan tim pada karya Anda & pastikan kolaborasi diterima";
      break;

    case 7: // Multi-Talenta
      target = 3;
      current = isUnlocked ? Math.max(3, validSkillsCount) : validSkillsCount;
      unit = "Keahlian";
      requirementText = "Mencantumkan minimal 3 keahlian digital terverifikasi di profil.";
      progressText = `${Math.min(current, target)} / ${target} Keahlian`;
      remainingText = isUnlocked ? "Misi Selesai! (Penghargaan Permanen)" : `Tambahkan ${Math.max(0, target - current)} keahlian lagi`;
      break;

    case 8: // Peneliti Muda
      target = 1;
      const risetCount = projects.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        return cat.includes('riset') || cat.includes('ilmiah') || cat.includes('akademik') || cat.includes('research');
      }).length;
      current = isUnlocked ? Math.max(1, risetCount) : risetCount;
      unit = "Karya Riset";
      requirementText = "Mempublikasikan minimal 1 karya kategori Riset & Karya Ilmiah.";
      progressText = `${Math.min(current, target)} / ${target} Karya Riset`;
      remainingText = isUnlocked ? "Misi Selesai! (Penghargaan Permanen)" : "Publikasikan 1 karya kategori Riset";
      break;

    case 9: { // Inovasi Berdampak
      target = 1;
      const getDemo = (p: any) => {
        const url = p.live_url || p.demo_url || p.liveUrl || p.demoUrl;
        return typeof url === 'string' ? url.trim() : '';
      };
      const demoCount = projects.filter((p) => Boolean(getDemo(p))).length;
      current = isUnlocked ? Math.max(1, demoCount) : demoCount;
      unit = "Live Demo / Tautan Publik";
      requirementText = "Menyertakan tautan live demo / URL publik yang dapat diakses pada minimal 1 karya.";
      progressText = `${Math.min(current, target)} / ${target} Tautan Publik`;
      remainingText = isUnlocked ? "Misi Selesai! (Penghargaan Permanen)" : "Tambahkan tautan Live Demo / URL publik pada karya Anda";
      break;
    }

    case 10: // Kreator Web & Aplikasi
      target = 1;
      const webCount = projects.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        return cat.includes('web') || cat.includes('aplikasi') || cat.includes('software') || cat.includes('mobile') || cat.includes('programming') || cat.includes('technology');
      }).length;
      current = isUnlocked ? Math.max(1, webCount) : webCount;
      unit = "Karya Web/App";
      requirementText = "Mempublikasikan minimal 1 karya kategori Web atau Aplikasi Mobile.";
      progressText = `${Math.min(current, target)} / ${target} Karya Web/App`;
      remainingText = isUnlocked ? "Misi Selesai! (Penghargaan Permanen)" : "Publikasikan karya Web atau Aplikasi";
      break;

    case 11: // Kreator Desain & Kreatif
      target = 1;
      const designCount = projects.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        return cat.includes('desain') || cat.includes('design') || cat.includes('ui/ux') || cat.includes('kreatif') || cat.includes('multimedia');
      }).length;
      current = isUnlocked ? Math.max(1, designCount) : designCount;
      unit = "Karya Desain";
      requirementText = "Mempublikasikan minimal 1 karya kategori Desain UI/UX atau Multimedia.";
      progressText = `${Math.min(current, target)} / ${target} Karya Desain`;
      remainingText = isUnlocked ? "Misi Selesai! (Penghargaan Permanen)" : "Publikasikan karya kategori Desain/Visual";
      break;

    case 12: // Inovator IoT
      target = 1;
      const iotCount = projects.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        return cat.includes('iot') || cat.includes('hardware') || cat.includes('robot') || cat.includes('embedded');
      }).length;
      current = isUnlocked ? Math.max(1, iotCount) : iotCount;
      unit = "Karya IoT";
      requirementText = "Mempublikasikan minimal 1 karya kategori IoT, Robotika, atau Smart Hardware.";
      progressText = `${Math.min(current, target)} / ${target} Karya IoT`;
      remainingText = isUnlocked ? "Misi Selesai! (Penghargaan Permanen)" : "Publikasikan karya kategori IoT/Hardware";
      break;

    case 13: // Master 5 Kategori
      target = 5;
      current = isUnlocked ? Math.max(5, distinctCategories.size) : distinctCategories.size;
      unit = "Kategori";
      requirementText = "Memiliki karya yang mencakup 5 kategori berbeda di galeri kampus.";
      progressText = `${Math.min(current, target)} / ${target} Kategori`;
      remainingText = isUnlocked ? "Misi Selesai! (Penghargaan Permanen)" : `Jelajahi ${Math.max(0, target - current)} kategori karya lainnya`;
      break;

    case 14: // Pelopor Tazkia
      target = 1;
      current = isUnlocked ? 1 : 0;
      unit = "Lencana Eksklusif";
      requirementText = "Lencana kehormatan eksklusif perintis kampus yang dikirim langsung oleh Admin STMIK Tazkia untuk diklaim.";
      progressText = isUnlocked ? "1 / 1 Resmi Diklaim" : "0 / 1 Menunggu Kiriman Admin";
      remainingText = isUnlocked ? "Lencana Pelopor Aktif" : "Diberikan khusus oleh Admin STMIK Tazkia untuk diklaim";
      break;

    case 15: // Vanguard BEM 2026
      target = 1;
      current = isUnlocked ? 1 : 0;
      unit = "Lencana Kabinet BEM";
      requirementText = "Lencana kehormatan eksklusif kabinet kepengurusan BEM STMIK Tazkia 2026 yang dikirim langsung oleh Admin untuk diklaim.";
      progressText = isUnlocked ? "1 / 1 Resmi Diklaim" : "0 / 1 Menunggu Kiriman Admin";
      remainingText = isUnlocked ? "Amanah Kepemimpinan BEM Aktif" : "Diberikan khusus oleh Admin kepada jajaran pengurus BEM 2026";
      break;

    case 16: // Ristek Quantum Cyber
      target = 1;
      current = isUnlocked ? 1 : 0;
      unit = "Lencana Riset Siber";
      requirementText = "Lencana kehormatan eksklusif divisi riset & arsitek keamanan siber yang dikirim langsung oleh Admin untuk diklaim.";
      progressText = isUnlocked ? "1 / 1 Resmi Diklaim" : "0 / 1 Menunggu Kiriman Admin";
      remainingText = isUnlocked ? "Inovator Kuantum Ristek Aktif" : "Diberikan khusus oleh Admin kepada divisi riset & cyber";
      break;

    default:
      target = 1;
      current = isUnlocked ? 1 : 0;
      unit = "Pencapaian";
      progressText = isUnlocked ? "1 / 1 Selesai" : "0 / 1 Belum";
      remainingText = isUnlocked ? "Misi Selesai!" : "Selesaikan syarat pembukaan";
      break;
  }

  const rawPercent = Math.min(100, Math.round((current / target) * 100));
  const percentage = isUnlocked ? 100 : Math.max(0, rawPercent);
  const statusLabel = isUnlocked ? "Misi Selesai • Terbuka" : `${percentage}% Selesai`;

  return {
    badgeId,
    badgeName,
    isUnlocked,
    current,
    target,
    unit,
    percentage,
    requirementText,
    progressText,
    remainingText,
    statusLabel,
  };
}

