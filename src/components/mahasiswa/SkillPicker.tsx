"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheck,
  FiX,
  FiSearch,
  FiChevronDown,
  FiCode,
  FiDatabase,
  FiCloud,
  FiLayers,
} from "react-icons/fi";
import { Sparkles } from "lucide-react";
import { PREDEFINED_SKILLS } from "@/utils/skillOptions";
import { getTechTagColor } from "@/utils/techTagColor";

export interface SkillPickerProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
}

const CATEGORIES = [
  { id: "all", label: "Semua", icon: Sparkles },
  {
    id: "software",
    label: "Software",
    icon: FiCode,
    skills: [
      "Frontend Developer",
      "Backend Developer",
      "Fullstack Developer",
      "Mobile Developer",
      "Game Developer",
    ],
  },
  {
    id: "data",
    label: "Data & AI",
    icon: FiDatabase,
    skills: ["Data Analyst", "Data Scientist", "Machine Learning Engineer"],
  },
  {
    id: "infra",
    label: "Cloud & Infra",
    icon: FiCloud,
    skills: [
      "Cloud Engineer",
      "DevOps Engineer",
      "System Administrator",
      "Cyber Security",
      "Network Engineer",
      "IT Support",
    ],
  },
  {
    id: "design",
    label: "Design & Produk",
    icon: FiLayers,
    skills: [
      "UI/UX Designer",
      "Graphic Designer",
      "Product Manager",
      "Quality Assurance (QA)",
      "Digital Marketing",
    ],
  },
];

export function SkillPicker({
  selectedSkills = [],
  onChange,
  maxSkills = 5,
}: SkillPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter((s) => s !== skill));
    } else {
      if (selectedSkills.length >= maxSkills) return;
      onChange([...selectedSkills, skill]);
    }
  };

  const handleRemove = (skillToRemove: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange(selectedSkills.filter((s) => s !== skillToRemove));
  };

  // Filter skills for the dropdown popover
  const filteredSkills = useMemo(() => {
    return PREDEFINED_SKILLS.filter((skill) => {
      const matchesSearch = skill.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeCategory === "all") return true;
      const cat = CATEGORIES.find((c) => c.id === activeCategory);
      return cat?.skills ? cat.skills.includes(skill) : true;
    });
  }, [searchQuery, activeCategory]);

  const isMaxReached = selectedSkills.length >= maxSkills;

  return (
    <div className="space-y-3.5" ref={dropdownRef}>
      {/* Header with counter */}
      <div className="flex items-center justify-between">
        <label className="font-semibold text-xs text-foreground flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Keahlian Utama (Skills)</span>
        </label>
        <span
          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${
            isMaxReached
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              : "bg-primary/10 text-primary border-primary/20"
          }`}
        >
          {selectedSkills.length} dari {maxSkills} dipilih
        </span>
      </div>

      {/* Selected Skills Badges Area */}
      <div className="min-h-[46px] p-2.5 bg-muted/40 rounded-xl border border-border flex flex-wrap items-center gap-2">
        <AnimatePresence>
          {selectedSkills.map((skill) => {
            const colorClass = getTechTagColor(skill);
            return (
              <motion.span
                key={skill}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border shadow-xs transition-all ${colorClass}`}
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemove(skill, e)}
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/15 dark:hover:bg-white/20 transition-colors"
                  title={`Hapus ${skill}`}
                >
                  <FiX size={11} />
                </button>
              </motion.span>
            );
          })}
        </AnimatePresence>

        {selectedSkills.length === 0 && (
          <span className="text-xs font-normal text-muted-foreground italic px-1">
            Belum ada keahlian dipilih. Klik tombol atau daftar keahlian di bawah untuk menambahkan.
          </span>
        )}
      </div>

      {/* Custom Dropdown Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-2.5 rounded-xl border bg-card text-left text-sm font-medium flex items-center justify-between gap-2 shadow-xs transition-all ${
            isOpen
              ? "border-primary ring-2 ring-primary/20 shadow-md"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          <div className="flex items-center gap-2 text-muted-foreground truncate">
            <FiSearch className="w-4 h-4 shrink-0 text-primary" />
            <span className="text-xs sm:text-sm truncate">
              {isMaxReached
                ? "Maksimal 5 keahlian tercapai (hapus salah satu untuk mengganti)"
                : "Cari atau pilih keahlian untuk ditambahkan..."}
            </span>
          </div>
          <FiChevronDown
            className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180 text-primary" : ""
            }`}
          />
        </button>

        {/* Dropdown Popover */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="absolute left-0 right-0 top-full mt-2 z-50 bg-card border border-border rounded-2xl shadow-2xl p-3.5 space-y-3"
            >
              {/* Search input inside dropdown */}
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik untuk mencari keahlian (mis: Cloud, UI/UX, Data)..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm font-medium text-foreground outline-none focus:border-primary focus:bg-background transition-all"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    <FiX size={13} />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const active = activeCategory === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-all ${
                        active
                          ? "bg-primary text-white shadow-xs"
                          : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Skills Grid in Popover */}
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                {filteredSkills.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {filteredSkills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      const colorClass = getTechTagColor(skill);
                      const disabled = !isSelected && isMaxReached;

                      return (
                        <button
                          type="button"
                          key={skill}
                          onClick={() => handleToggle(skill)}
                          disabled={disabled}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-semibold text-left transition-all ${
                            isSelected
                              ? `${colorClass} shadow-xs ring-1 ring-primary/40`
                              : disabled
                              ? "opacity-40 cursor-not-allowed bg-muted/30 border-transparent text-muted-foreground"
                              : "bg-muted/30 border-border/80 text-foreground hover:bg-muted/70 hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isSelected ? "bg-current" : "bg-muted-foreground/40"
                              }`}
                            />
                            <span className="truncate">{skill}</span>
                          </div>

                          {isSelected ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/20 dark:bg-black/20 shrink-0">
                              <FiCheck size={11} />
                              <span>Dipilih</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                              + Tambah
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    Tidak ada keahlian yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
                  </div>
                )}
              </div>

              {/* Footer info in popover */}
              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Klik item untuk memilih atau melepas.</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="font-semibold text-primary hover:underline"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Pick Chips Grid (Direct 1-click select without opening dropdown) */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Pilihan Cepat Keahlian
          </span>
          <span className="text-[10px] text-muted-foreground">
            Klik langsung untuk memilih
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PREDEFINED_SKILLS.map((skill) => {
            const isSelected = selectedSkills.includes(skill);
            const colorClass = getTechTagColor(skill);
            const disabled = !isSelected && isMaxReached;

            return (
              <button
                type="button"
                key={skill}
                onClick={() => handleToggle(skill)}
                disabled={disabled}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? `${colorClass} shadow-xs ring-1 ring-primary/40 -translate-y-0.5`
                    : disabled
                    ? "opacity-35 cursor-not-allowed bg-muted/20 border-border/60 text-muted-foreground"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/50"
                }`}
                title={disabled ? "Maksimal 5 keahlian sudah dipilih" : skill}
              >
                {isSelected ? (
                  <FiCheck className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-muted-foreground/60 font-bold">+</span>
                )}
                <span>{skill}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
