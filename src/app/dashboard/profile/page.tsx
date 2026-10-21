"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FiSave, FiUser, FiInfo, FiAlertCircle, FiX, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import toast from "react-hot-toast";
import { fetchMasterProdiOptions, fetchMasterAngkatanOptions } from "@/utils/prodiOptions";
import { PREDEFINED_SKILLS } from "@/utils/skillOptions";
import { SkillPicker } from "@/components/mahasiswa/SkillPicker";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { UnsavedChangesModal } from "@/components/ui/UnsavedChangesModal";

const PREDEFINED_STATUSES = [
  "🚀 Open for Collab", "💼 Mencari Magang", "🤝 Siap Freelance", 
  "📚 Fokus Belajar", "💻 Bekerja Full-time", "💡 Punya Ide Startup", 
  "🔍 Mencari Mentor"
];

export default function ProfileSettingsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    contact_email: "",
    prodi: "Teknik Informatika",
    angkatan: "2",
    bio: "",
    status_badge: "🚀 Open for Collab",
    github_url: "",
    linkedin_url: "",
    instagram_url: "",
    website_url: "",
    skills: [] as string[],
    avatar_url: ""
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const isFormDirty = isDirty || Boolean(avatarFile);

  const {
    showPrompt: showLeavePrompt,
    triggerLeave,
    confirmLeave,
    cancelLeave,
    allowNavigation,
  } = useUnsavedChangesWarning({
    isDirty: isFormDirty,
    defaultBackUrl: "/dashboard",
  });

  const [prodiOptions, setProdiOptions] = useState<{ value: string; label: string }[]>([
    { value: "Teknik Informatika", label: "Teknik Informatika" },
    { value: "Sistem Informasi", label: "Sistem Informasi" },
    { value: "Bisnis Digital", label: "Bisnis Digital" },
  ]);

  const [angkatanOptions, setAngkatanOptions] = useState<{ value: string; label: string }[]>([
    { value: "1", label: "Angkatan 1" },
    { value: "2", label: "Angkatan 2" },
    { value: "3", label: "Angkatan 3" },
  ]);

  useEffect(() => {
    // Fetch master options from system_settings (same DB as BEM)
    fetchMasterProdiOptions().then(setProdiOptions);
    fetchMasterAngkatanOptions().then(setAngkatanOptions);
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('mahasiswa_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setFormData({
          full_name: data.full_name || user.user_metadata?.full_name || "",
          contact_email: data.contact_email || "",
          prodi: data.prodi || "Teknik Informatika",
          angkatan: data.angkatan ? String(data.angkatan) : "2",
          bio: data.bio || "",
          status_badge: data.status_badge || "🚀 Open for Collab",
          github_url: data.github_url || "",
          linkedin_url: data.linkedin_url || "",
          instagram_url: data.instagram_url || "",
          website_url: data.website_url || "",
          skills: (data.skills || []).filter((s: string) => PREDEFINED_SKILLS.includes(s)),
          avatar_url: data.avatar_url || ""
        });
        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url);
        }
      } else {
        // Fallback to minimal data if not found
        setFormData(prev => ({
          ...prev,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "",
          avatar_url: user.user_metadata?.avatar_url || "",
        }));
        if (user.user_metadata?.avatar_url) {
          setAvatarPreview(user.user_metadata.avatar_url);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, isAuthLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setIsDirty(true);
    }
  };

  const uploadAvatarToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('public_images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    
    let finalAvatarUrl = formData.avatar_url;
    if (avatarFile) {
      setUploadingAvatar(true);
      const uploadedUrl = await uploadAvatarToSupabase(avatarFile);
      if (uploadedUrl) {
        finalAvatarUrl = uploadedUrl;
      }
      setUploadingAvatar(false);
    }

    const payload = {
      user_id: user.id,
      full_name: formData.full_name,
      contact_email: formData.contact_email,
      prodi: formData.prodi,
      angkatan: parseInt(formData.angkatan) || 2,
      bio: formData.bio,
      status_badge: formData.status_badge,
      github_url: formData.github_url,
      linkedin_url: formData.linkedin_url,
      instagram_url: formData.instagram_url,
      website_url: formData.website_url,
      skills: formData.skills,
      avatar_url: finalAvatarUrl,
      email: user.email || ""
    };

    // Upsert logic
    let { data: existing } = await supabase
      .from('mahasiswa_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      const { data: byEmail } = await supabase
        .from('mahasiswa_profiles')
        .select('id')
        .eq('email', payload.email)
        .is('user_id', null)
        .single();
      if (byEmail) existing = byEmail;
    }

    let error;
    if (existing) {
      const res = await supabase.from('mahasiswa_profiles').update(payload).eq('id', existing.id);
      error = res.error;
    } else {
      const res = await supabase.from('mahasiswa_profiles').insert([payload]);
      error = res.error;
    }

    setSaving(false);

    if (error) {
      toast.error(`Gagal menyimpan: ${error.message}`);
    } else {
      setIsDirty(false);
      allowNavigation();
      toast.success('Profil berhasil disimpan! ✅');
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    }
  };

  if (loading || isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl relative">
      
      <div className="flex items-center gap-3.5 mb-8">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
          <FiUser size={24} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Edit Profil
          </h1>
          <p className="text-muted-foreground font-normal text-sm mt-0.5">
            Sesuaikan profil portofoliomu agar tampil profesional dan terpercaya.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 p-4 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-medium shadow-xs">
              <FiAlertCircle size={18} className="shrink-0" />
              <span>Ada perubahan yang belum disimpan. Pastikan untuk menekan Simpan Perubahan.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs">
        
        {/* Photo Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-muted/40 rounded-xl border border-border/80">
          <div className="relative w-28 h-28 rounded-2xl border border-border shadow-xs overflow-hidden bg-background flex items-center justify-center shrink-0">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <FiUser size={40} className="text-muted-foreground" />
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center sm:items-start gap-2.5">
            <h3 className="font-bold text-base text-foreground">Foto Profil</h3>
            <p className="text-xs text-muted-foreground text-center sm:text-left font-normal">
              Disarankan foto persegi beresolusi jelas (rasio 1:1), ukuran maksimal 2MB.
            </p>
            <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-[#ea580c] shadow-xs hover:shadow-md transition-all">
              <span>Pilih Foto Baru</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar || saving} />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-5">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Informasi Dasar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="font-semibold text-xs text-foreground flex justify-between">
                <span>Nama Lengkap</span>
                <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-medium">Dari Akun</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                readOnly
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-muted/60 text-muted-foreground text-sm font-medium outline-none cursor-not-allowed"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="font-semibold text-xs text-foreground flex justify-between">
                <span>Email Kontak</span>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-normal">Bisa email pribadi</span>
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="namakamu@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-xs text-foreground">
                Program Studi
              </label>
              <select
                name="prodi"
                value={formData.prodi}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                {prodiOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-xs text-foreground">
                Angkatan
              </label>
              <select
                name="angkatan"
                value={formData.angkatan}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                {angkatanOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bio & Skills */}
        <div className="space-y-5">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Profil & Keahlian</h2>
          
          <div className="space-y-2">
            <label className="font-semibold text-xs text-foreground flex items-center justify-between">
              <span>Status Ketersediaan / Badge</span>
              <span className="text-[10px] text-muted-foreground font-normal">Pilih satu status profilmu</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_STATUSES.map((status) => {
                const isSelected = formData.status_badge === status;
                return (
                  <button
                    type="button"
                    key={status}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, status_badge: status }));
                      setIsDirty(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-xs ring-2 ring-primary/20 -translate-y-0.5"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-xs text-foreground">Tentang Saya (Bio)</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Ceritakan sedikit tentang dirimu, passion teknologi, dan minat riset..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Skill Picker with Colorful Tags and Searchable Dropdown */}
          <SkillPicker
            selectedSkills={formData.skills}
            onChange={(newSkills) => {
              setFormData((prev) => ({ ...prev, skills: newSkills }));
              setIsDirty(true);
            }}
            maxSkills={5}
          />
        </div>

        {/* Social Links */}
        <div className="space-y-5">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Tautan Sosial &amp; Portfolio</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="font-semibold text-xs text-foreground">URL GitHub</label>
              <input
                type="url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-xs text-foreground">URL LinkedIn</label>
              <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-xs text-foreground">URL Instagram</label>
              <input
                type="url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleChange}
                placeholder="https://instagram.com/username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-xs text-foreground">URL Website Pribadi</label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                placeholder="https://domainkamu.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => triggerLeave()}
            className="px-5 py-2.5 rounded-xl bg-card border border-border text-foreground font-semibold text-xs sm:text-sm hover:bg-muted transition-all text-center cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving || (!isDirty && !avatarFile)}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs sm:text-sm hover:bg-[#ea580c] shadow-xs hover:shadow-md hover:shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <FiSave size={16} />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Unsaved Changes Confirmation Modal */}
      <UnsavedChangesModal
        open={showLeavePrompt}
        onStay={cancelLeave}
        onLeave={confirmLeave}
        title="Perubahan Profil Belum Disimpan"
        description="Ada perubahan data profil yang belum kamu simpan. Yakin ingin keluar? Semua perubahan akan hilang."
        stayText="Tetap Lanjut Edit"
        leaveText="Tinggalkan Halaman"
      />
    </div>
  );
}
