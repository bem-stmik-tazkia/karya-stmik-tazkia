"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { FiSearch, FiUser, FiCheck, FiX, FiUserCheck, FiChevronDown } from "react-icons/fi";

export interface Profile {
  user_id: string;
  full_name: string;
  avatar_url?: string | null;
  prodi?: string | null;
  angkatan?: number | string | null;
}

export interface TeamMemberAutocompleteProps {
  value: string;
  userId?: string;
  onChange: (value: string, user_id?: string, avatar?: string) => void;
  mahasiswaList: Profile[];
  existingMemberUserIds?: (string | null | undefined)[];
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

export default function TeamMemberAutocomplete({
  value,
  userId,
  onChange,
  mahasiswaList,
  existingMemberUserIds = [],
  placeholder = "Cari mahasiswa STMIK Tazkia...",
  id,
  disabled,
}: TeamMemberAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsTyping(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter list based on search or show all if empty/matching
  const filteredList = useMemo(() => {
    const q = isTyping ? searchQuery.trim().toLowerCase() : (searchQuery.trim().toLowerCase() || (userId ? "" : value.trim().toLowerCase()));

    if (!q) {
      // If no query, show all mahasiswa, placing currently selected student first
      return [...mahasiswaList].sort((a, b) => {
        if (a.user_id === userId) return -1;
        if (b.user_id === userId) return 1;
        return a.full_name.localeCompare(b.full_name);
      });
    }

    return mahasiswaList.filter((m) => {
      const nameMatch = m.full_name?.toLowerCase().includes(q);
      const prodiMatch = m.prodi?.toLowerCase().includes(q);
      return nameMatch || prodiMatch;
    });
  }, [mahasiswaList, searchQuery, isTyping, userId, value]);

  const handleSelect = (profile: Profile) => {
    // If student is already in another slot of the team, don't allow duplicate
    if (existingMemberUserIds.includes(profile.user_id) && profile.user_id !== userId) {
      return;
    }

    onChange(profile.full_name, profile.user_id, profile.avatar_url || "");
    setSearchQuery("");
    setIsTyping(false);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setIsTyping(true);
    setIsOpen(true);

    // If text was changed from a selected student, reset userId/avatar
    onChange(val, "", "");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("", "", "");
    setSearchQuery("");
    setIsTyping(false);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (disabled) return;
    setIsOpen(true);
    setSearchQuery("");
    setIsTyping(false);
  };

  const isVerifiedStudent = Boolean(userId && mahasiswaList.some((m) => m.user_id === userId));

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        {/* Left icon: user status */}
        <div className="absolute left-3.5 pointer-events-none flex items-center justify-center text-muted-foreground">
          {isVerifiedStudent ? (
            <FiUserCheck className="text-emerald-500" size={16} />
          ) : (
            <FiSearch className="text-muted-foreground/60" size={15} />
          )}
        </div>

        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`w-full bg-background border border-border rounded-xl pl-10 pr-16 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
            disabled ? "opacity-60 cursor-not-allowed bg-muted/40" : ""
          } ${isVerifiedStudent ? "border-emerald-500/40 focus:border-emerald-500 focus:ring-emerald-500/20" : ""}`}
        />

        {/* Right action controls */}
        <div className="absolute right-2.5 flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Hapus / ganti anggota"
              className="p-1 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              <FiX size={14} />
            </button>
          )}

          {!disabled && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <FiChevronDown
                size={14}
                className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card dark:bg-[#0E2554] border-2 border-border dark:border-[#1e3a8a] rounded-2xl shadow-2xl shadow-slate-900/15 dark:shadow-black/70 z-50 overflow-hidden flex flex-col max-h-72">
          {/* Header Info */}
          <div className="px-3.5 py-2.5 bg-muted/40 dark:bg-[#132E6B]/40 border-b border-border/70 flex items-center justify-between text-xs text-muted-foreground shrink-0">
            <span className="font-semibold flex items-center gap-1.5">
              <FiUser size={13} className="text-primary" />
              {isTyping && searchQuery ? `Mencari: "${searchQuery}"` : "Pilih Mahasiswa STMIK Tazkia"}
            </span>
            <span className="text-[11px] font-medium bg-background/80 dark:bg-card px-2 py-0.5 rounded-full border border-border">
              {filteredList.length} mahasiswa
            </span>
          </div>

          {/* List Content */}
          <div className="p-1.5 overflow-y-auto space-y-1 divide-y divide-border/20">
            {filteredList.length > 0 ? (
              filteredList.map((m) => {
                const isSelected = m.user_id === userId;
                const isAlreadyInTeam =
                  existingMemberUserIds.includes(m.user_id) && !isSelected;

                return (
                  <div
                    key={m.user_id || m.full_name}
                    onClick={() => !isAlreadyInTeam && handleSelect(m)}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      isSelected
                        ? "bg-primary/10 border border-primary/30 text-primary"
                        : isAlreadyInTeam
                        ? "opacity-45 cursor-not-allowed bg-muted/20"
                        : "hover:bg-muted/70 dark:hover:bg-[#132E6B]/50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-primary/10 border border-border flex items-center justify-center">
                        {m.avatar_url ? (
                          <img
                            src={m.avatar_url}
                            alt={m.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-xs text-primary">
                            {m.full_name.charAt(0).toUpperCase() || <FiUser />}
                          </span>
                        )}
                      </div>

                      {/* Text */}
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-bold truncate ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {m.full_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {m.prodi
                            ? `${m.prodi}${m.angkatan ? ` • Angkatan ${m.angkatan}` : ""}`
                            : "Mahasiswa Terdaftar"}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="shrink-0">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-white shadow-xs">
                          <FiCheck size={11} /> Terpilih
                        </span>
                      ) : isAlreadyInTeam ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                          Sudah di Tim
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground/60 group-hover:text-foreground">
                          Pilih
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  Tidak ditemukan mahasiswa dengan nama &quot;{searchQuery || value}&quot;.
                </p>
                <div className="inline-block text-left bg-muted/40 dark:bg-[#132E6B]/30 border border-border rounded-xl p-2.5 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground flex items-center gap-1 mb-1">
                    <span>💡 Anggota Eksternal (Luar Kampus)</span>
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Anda tetap bisa menggunakan nama ini. Biarkan nama terisi dan Anda dapat mengunggah foto profil secara manual di samping.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
