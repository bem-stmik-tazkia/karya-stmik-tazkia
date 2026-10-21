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
    mission: "Karya dengan interaksi tertinggi (skor like & view terpopuler) atau masuk sorotan kurator kampus.",
    philosophy: 'Simbol karya terbaik pilihan kurator dan civitas kampus (crème de la crème).',
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
    mission: 'Portofolio atau karya mengumpulkan akumulasi 25+ likes/apresiasi.',
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
    mission: 'Terdaftar sebagai tim dalam proyek karya kolaborasi (lintas mahasiswa/prodi).',
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
    defaultUnlocked: true,
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
    defaultUnlocked: true,
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
    defaultUnlocked: true,
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

/**
 * Logika evaluasi penghargaan mahasiswa berdasarkan data riil karya & profil
 */
export function calculateStudentEarnedBadges(params: {
  projects?: Array<{
    category?: string;
    status?: string;
    views?: number;
    likes?: number;
    live_url?: string | null;
    github_url?: string | null;
    team?: any;
    is_featured?: boolean;
  }>;
  angkatan?: number | string;
  skills?: string[];
}): number[] {
  const { projects = [], angkatan, skills = [] } = params;
  const earned = new Set<number>();

  const angkatanNum = Number(angkatan) || 2024;
  const approvedProjects = projects.filter((p) => p.status === 'approved' || !p.status);
  const totalLikes = projects.reduce((acc, p) => acc + (p.likes || 0), 0);
  const totalViews = projects.reduce((acc, p) => acc + (p.views || 0), 0);

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

  // 4. Sorotan Kurator (ID: 4): Karya terpopuler (skor like*3 + view >= 50) atau ditandai is_featured
  const hasSpotlightScore = projects.some((p) => (p.likes || 0) * 3 + (p.views || 0) >= 50 || p.is_featured);
  if (hasSpotlightScore) {
    earned.add(4);
  }

  // 5. Favorit Komunitas (ID: 5): Total likes akumulasi >= 15 atau ada 1 proyek dengan likes >= 8
  if (totalLikes >= 15 || projects.some((p) => (p.likes || 0) >= 8)) {
    earned.add(5);
  }

  // 6. Sinergi Kolaborasi (ID: 6): Proyek memiliki tim kolaborasi
  const hasTeam = projects.some((p) => {
    if (Array.isArray(p.team) && p.team.length > 0) return true;
    return false;
  });
  if (hasTeam) {
    earned.add(6);
  }

  // 7. Multi-Talenta (ID: 7): Memiliki minimal 3 skill atau karya lintas stack
  if (skills.length >= 3) {
    earned.add(7);
  }

  // 8. Peneliti Muda (ID: 8): Karya di kategori riset/ilmiah
  const hasRiset = projects.some((p) => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('riset') || cat.includes('ilmiah') || cat.includes('akademik');
  });
  if (hasRiset) {
    earned.add(8);
  }

  // 9. Inovasi Berdampak (ID: 9): Karya memiliki link live demo
  const hasLiveDemo = projects.some((p) => Boolean(p.live_url && p.live_url.trim() !== ''));
  if (hasLiveDemo) {
    earned.add(9);
  }

  // 10. Kreator Web & Aplikasi (ID: 10)
  const hasWebApp = projects.some((p) => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('web') || cat.includes('aplikasi') || cat.includes('software') || cat.includes('mobile');
  });
  if (hasWebApp) {
    earned.add(10);
  }

  // 11. Kreator Desain & Kreatif (ID: 11)
  const hasDesign = projects.some((p) => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('desain') || cat.includes('design') || cat.includes('ui/ux') || cat.includes('kreatif');
  });
  if (hasDesign) {
    earned.add(11);
  }

  // 12. Inovator IoT (ID: 12)
  const hasIoT = projects.some((p) => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('iot') || cat.includes('hardware') || cat.includes('robot');
  });
  if (hasIoT) {
    earned.add(12);
  }

  // 13. Master 5 Kategori (ID: 13): Memiliki 5 kategori berbeda
  const distinctCategories = new Set(projects.map((p) => (p.category || '').trim().toLowerCase()).filter(Boolean));
  if (distinctCategories.size >= 5) {
    earned.add(13);
  }

  // 14. Pelopor Tazkia (ID: 14): Mahasiswa angkatan 1, 2, atau <= 2024
  if (angkatanNum <= 2024 || angkatanNum === 1 || angkatanNum === 2) {
    earned.add(14);
  }

  return Array.from(earned).sort((a, b) => a - b);
}

