/**
 * Mengembalikan Tailwind class untuk tech/tool tag berdasarkan nama.
 * Warna dipilih berdasarkan kategori tech untuk memberikan visual differentiation.
 */
export function getTechTagColor(tech: string): string {
  const t = tech.toLowerCase();

  // ── Languages ────────────────────────────────────────────────────────────
  if (t.includes("python"))     return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
  if (t.includes("javascript") || t.includes("js"))
                                 return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700";
  if (t.includes("typescript") || t.includes("ts"))
                                 return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
  if (t.includes("java") && !t.includes("script"))
                                 return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700";
  if (t.includes("kotlin"))     return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700";
  if (t.includes("swift"))      return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700";
  if (t.includes("dart"))       return "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700";
  if (t.includes("go") && t.length < 4)
                                 return "bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700";
  if (t.includes("rust"))       return "bg-orange-100 text-orange-900 border-orange-400 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-600";
  if (t.includes("c++") || t.includes("cpp"))
                                 return "bg-blue-100 text-blue-900 border-blue-400 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-600";
  if (t.includes("php"))        return "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700";

  // ── Frameworks ───────────────────────────────────────────────────────────
  if (t.includes("react"))      return "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700";
  if (t.includes("next"))       return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600";
  if (t.includes("vue"))        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
  if (t.includes("angular"))    return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
  if (t.includes("svelte"))     return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700";
  if (t.includes("laravel"))    return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
  if (t.includes("django"))     return "bg-green-100 text-green-900 border-green-400 dark:bg-green-900/30 dark:text-green-200 dark:border-green-600";
  if (t.includes("flask"))      return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600";
  if (t.includes("express"))    return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600";
  if (t.includes("spring"))     return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
  if (t.includes("flutter"))    return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
  if (t.includes("nuxt"))       return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";

  // ── Databases ────────────────────────────────────────────────────────────
  if (t.includes("mysql") || t.includes("mariadb"))
                                 return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
  if (t.includes("postgres"))   return "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700";
  if (t.includes("mongodb") || t.includes("mongo"))
                                 return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
  if (t.includes("supabase"))   return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700";
  if (t.includes("firebase"))   return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700";
  if (t.includes("redis"))      return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
  if (t.includes("sqlite"))     return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700";

  // ── Cloud / DevOps ────────────────────────────────────────────────────────
  if (t.includes("docker"))     return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
  if (t.includes("kubernetes") || t.includes("k8s"))
                                 return "bg-blue-100 text-blue-900 border-blue-400 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-600";
  if (t.includes("aws"))        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700";
  if (t.includes("gcp") || t.includes("google cloud"))
                                 return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
  if (t.includes("azure"))      return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
  if (t.includes("vercel"))     return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600";

  // ── AI / ML ───────────────────────────────────────────────────────────────
  if (t.includes("tensorflow") || t.includes("tf"))
                                 return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700";
  if (t.includes("pytorch"))    return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
  if (t.includes("sklearn") || t.includes("scikit"))
                                 return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700";
  if (t.includes("openai") || t.includes("gpt") || t.includes("chatgpt"))
                                 return "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700";
  if (t.includes("gemini"))     return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";

  // ── Tools / Research ─────────────────────────────────────────────────────
  if (t.includes("figma"))      return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700";
  if (t.includes("canva"))      return "bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700";
  if (t.includes("arduino"))    return "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700";
  if (t.includes("raspberry"))  return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
  if (t.includes("excel") || t.includes("google sheet"))
                                 return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
  if (t.includes("spss") || t.includes("kuantitatif") || t.includes("statistik"))
                                 return "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700";
  if (t.includes("scholar") || t.includes("jurnal") || t.includes("literatur"))
                                 return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700";
  if (t.includes("git"))        return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700";
  if (t.includes("tailwind"))   return "bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700";
  if (t.includes("html"))       return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700";
  if (t.includes("css"))        return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
  if (t.includes("node"))       return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
  if (t.includes("postman"))    return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700";
  if (t.includes("android"))    return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
  if (t.includes("ios") || t.includes("xcode"))
                                 return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600";

  // ── Fallback — hash sederhana dari nama untuk konsistensi warna ───────────
  const colors = [
    "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700",
    "bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700",
    "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700",
    "bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-700",
    "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700",
    "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700",
    "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
    "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-700",
  ];
  let hash = 0;
  for (const ch of tech) hash = (hash * 31 + ch.charCodeAt(0)) & 0xff;
  return colors[hash % colors.length];
}
