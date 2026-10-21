"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Command,
  ArrowRight,
  Compass,
  Users,
  UploadCloud,
  Layers,
  Sparkles,
  Info,
  X,
  Code2,
  Cpu,
  Palette,
  BookOpen,
} from "lucide-react";

interface SearchItem {
  id: string;
  title: string;
  category: "Navigasi" | "Kategori Karya" | "Aksi Cepat";
  icon: React.ElementType;
  href: string;
  badge?: string;
  description?: string;
}

const DEFAULT_ITEMS: SearchItem[] = [
  // Navigasi
  {
    id: "nav-explore",
    title: "Galeri Portofolio & Karya",
    category: "Navigasi",
    icon: Compass,
    href: "/explore",
    badge: "Galeri",
    description: "Semua portofolio dan proyek karya mahasiswa Tazkia",
  },
  {
    id: "nav-student",
    title: "Direktori Profil Mahasiswa",
    category: "Navigasi",
    icon: Users,
    href: "/student",
    badge: "Mahasiswa",
    description: "Cari profil mahasiswa berdasarkan prodi dan keahlian",
  },
  {
    id: "nav-about",
    title: "Tentang Platform Karya Tazkia",
    category: "Navigasi",
    icon: Info,
    href: "/about",
    badge: "Info",
    description: "Visi, misi, dan ekosistem riset digital kampus",
  },
  // Kategori Karya
  {
    id: "cat-tech",
    title: "Web & Sistem Informasi",
    category: "Kategori Karya",
    icon: Code2,
    href: "/explore?category=Technology",
    badge: "Software",
    description: "Aplikasi fullstack, sistem enterprise, dan SaaS",
  },
  {
    id: "cat-prog",
    title: "Mobile Apps & Rekayasa Perangkat Lunak",
    category: "Kategori Karya",
    icon: Layers,
    href: "/explore?category=Programming",
    badge: "Mobile",
    description: "Flutter, React Native, iOS, dan Android",
  },
  {
    id: "cat-research",
    title: "Riset, Skripsi & Jurnal Ilmiah",
    category: "Kategori Karya",
    icon: BookOpen,
    href: "/explore?category=Research",
    badge: "Akademik",
    description: "Kajian ilmiah, AI/ML models, dan algoritma data",
  },
  {
    id: "cat-iot",
    title: "Proyek Internet of Things (IoT)",
    category: "Kategori Karya",
    icon: Cpu,
    href: "/explore?category=IoT",
    badge: "Hardware",
    description: "Mikrokontroler, smart sensor, dan otomasi industri",
  },
  {
    id: "cat-multimedia",
    title: "Desain Grafis, UI/UX & Multimedia",
    category: "Kategori Karya",
    icon: Palette,
    href: "/explore?category=Multimedia",
    badge: "Kreatif",
    description: "Design system, prototipe figma, dan aset 3D",
  },
  // Aksi Cepat
  {
    id: "act-submit",
    title: "Publikasikan Karya Baru",
    category: "Aksi Cepat",
    icon: UploadCloud,
    href: "/submit",
    badge: "Upload",
    description: "Unggah karya atau tugas akhir ke etalase publik",
  },
  {
    id: "act-dashboard",
    title: "Buka Dashboard Mahasiswa",
    category: "Aksi Cepat",
    icon: Sparkles,
    href: "/dashboard",
    badge: "Pribadi",
    description: "Kelola statistik karya, follower, dan profil",
  },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global open event listener
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setQuery("");
      setSelectedIndex(0);
    };

    window.addEventListener("open-command-palette", handleOpen);
    return () => window.removeEventListener("open-command-palette", handleOpen);
  }, []);

  // Keyboard shortcut Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filter items based on query
  const filteredItems = DEFAULT_ITEMS.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.badge?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );
  });

  // Handle keyboard navigation inside palette
  const handleKeyDownInList = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      const target = filteredItems[selectedIndex];
      setIsOpen(false);
      router.push(target.href);
    }
  };

  const selectItem = (item: SearchItem) => {
    setIsOpen(false);
    router.push(item.href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 sm:px-6">
          {/* Backdrop Glass */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 border-b border-border bg-card/60">
              <Search className="w-5 h-5 text-muted-foreground shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDownInList}
                placeholder="Cari karya, teknologi, jurusan, atau halaman... (contoh: Next.js, IoT, Feed)"
                className="w-full py-4 text-sm sm:text-base bg-transparent text-foreground placeholder:text-muted-foreground outline-none font-sans"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-mono text-muted-foreground font-semibold">
                <span>ESC</span>
              </div>
            </div>

            {/* Results List */}
            <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <div className="w-10 h-10 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-3">
                    <Search className="w-5 h-5 opacity-60" />
                  </div>
                  <p className="text-sm font-medium">Tidak ada hasil untuk &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    Coba kata kunci lain atau buka halaman utama Galeri
                  </p>
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => selectItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "hover:bg-muted/60 text-foreground border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-primary text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold truncate">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-medium ${
                                  isSelected
                                    ? "bg-primary/20 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-3 shrink-0">
                        <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">
                          {item.category}
                        </span>
                        <ArrowRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? "translate-x-0.5 text-primary" : "text-muted-foreground/50"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Keyboard Hint Bar */}
            <div className="px-4 py-2.5 bg-muted/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[10px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[10px]">↓</kbd>
                  <span>Navigasi</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[10px]">↵</kbd>
                  <span>Buka</span>
                </span>
              </div>
              <span className="flex items-center gap-1 text-primary font-medium">
                <Command className="w-3 h-3" />
                <span>Karya Tazkia Command</span>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

