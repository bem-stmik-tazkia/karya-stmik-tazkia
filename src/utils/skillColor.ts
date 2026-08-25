/**
 * Mengembalikan kelas Tailwind warna untuk badge skill.
 * Tiap skill/teknologi mendapat warna yang konsisten.
 */

// Palet warna yang tersedia (bg + text + border)
const SKILL_PALETTES = [
  "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",
  "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700",
  "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700",
  "bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-700",
  "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700",
  "bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-700",
  "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700",
  "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700",
  "bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700",
  "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
  "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300 dark:bg-fuchsia-900/40 dark:text-fuchsia-300 dark:border-fuchsia-700",
  "bg-lime-100 text-lime-700 border-lime-300 dark:bg-lime-900/40 dark:text-lime-300 dark:border-lime-700",
];

// Mapping keyword → indeks palet untuk teknologi umum
const KEYWORD_MAP: Record<string, number> = {
  // Frontend
  react: 0, "next.js": 0, nextjs: 0, vue: 2, angular: 7, svelte: 4,
  html: 3, css: 0, javascript: 4, typescript: 0, tailwind: 1, tailwindcss: 1,
  bootstrap: 2, jquery: 4, frontend: 0, "ui/ux": 2, "ui ux": 2, figma: 2,

  // Backend
  "node.js": 1, nodejs: 1, express: 1, fastapi: 1, django: 1, flask: 1,
  laravel: 6, php: 2, ruby: 6, rails: 6, backend: 7,
  golang: 8, go: 8, java: 9, "spring boot": 9, "c#": 2, ".net": 2,

  // Database
  mysql: 9, postgresql: 0, postgres: 0, mongodb: 1, firebase: 9, supabase: 1,
  redis: 6, sqlite: 7, database: 7,

  // AI / DS / ML
  python: 1, tensorflow: 9, pytorch: 6, "machine learning": 2, ml: 2,
  "deep learning": 7, nlp: 2, "computer vision": 8, ai: 7, "data science": 8,
  pandas: 1, numpy: 0, sklearn: 1, "scikit-learn": 1,

  // Mobile
  "react native": 0, flutter: 0, kotlin: 2, swift: 6, android: 1, ios: 10,

  // DevOps / Cloud
  docker: 0, kubernetes: 0, "ci/cd": 8, aws: 9, gcp: 0, azure: 0,
  linux: 11, git: 6, github: 11, vercel: 11, nginx: 1, devops: 8,

  // Design / Product
  photoshop: 0, illustrator: 9, canva: 2, "product management": 4,
  "ux research": 10, "graphic design": 3,

  // Marketing / Bisnis
  seo: 11, "digital marketing": 4, "social media": 3, branding: 10,
  copywriting: 5, "data analytics": 8, excel: 1, "microsoft office": 0,

  // Role / Label Umum
  fullstack: 5, "full stack": 5, "full-stack": 5,
  "ui designer": 2, developer: 0, "web developer": 0,
};

/**
 * Menghitung hash sederhana dari string → indeks palet (deterministik)
 */
function hashToPaletteIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % SKILL_PALETTES.length;
}

/**
 * Mengembalikan kelas Tailwind warna badge untuk skill tertentu.
 * @param skill - nama skill / teknologi
 */
export function getSkillColor(skill: string): string {
  const key = skill.toLowerCase().trim();

  // Cari di keyword map
  for (const [keyword, paletteIdx] of Object.entries(KEYWORD_MAP)) {
    if (key.includes(keyword) || keyword.includes(key)) {
      return SKILL_PALETTES[paletteIdx];
    }
  }

  // Fallback: hash deterministik dari nama skill
  return SKILL_PALETTES[hashToPaletteIndex(key)];
}
