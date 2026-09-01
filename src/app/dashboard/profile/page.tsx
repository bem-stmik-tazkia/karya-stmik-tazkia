"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FiSave, FiUser, FiInfo, FiAlertCircle, FiX, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import toast from "react-hot-toast";
import { fetchMasterProdiOptions, fetchMasterAngkatanOptions } from "@/utils/prodiOptions";

const PREDEFINED_SKILLS = [
  "Frontend Developer", "Backend Developer", "Fullstack Developer", 
  "Mobile Developer", "UI/UX Designer", "Data Analyst", "Data Scientist", 
  "Cyber Security", "DevOps Engineer", "System Administrator", "Cloud Engineer", 
  "Machine Learning Engineer", "Game Developer", "Product Manager", 
  "Quality Assurance (QA)", "Network Engineer", "IT Support", 
  "Graphic Designer", "Digital Marketing"
];

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
  const [skillInput, setSkillInput] = useState("");

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
          skills: data.skills || [],
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

  const addSkill = (skill: string) => {
    if (formData.skills.length >= 5) {
      toast.error('Maksimal 5 keahlian');
      return;
    }
    if (formData.skills.includes(skill)) return;
    
    setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    setIsDirty(true);
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    setIsDirty(true);
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
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-secondary text-secondary-foreground border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] rounded-2xl flex items-center justify-center">
          <FiUser size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">
            Edit Profil
          </h1>
          <p className="text-muted-foreground font-bold">
            Sesuaikan profil portofoliomu agar tampil profesional.
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
            <div className="bg-accent/20 border-4 border-accent text-accent-foreground p-4 rounded-2xl flex items-center gap-3 font-black text-sm">
              <FiAlertCircle size={20} />
              Ada perubahan yang belum disimpan!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="card-3d bg-card border-4 border-border rounded-3xl p-6 sm:p-8 space-y-8">
        
        {/* Photo Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-muted rounded-2xl border-2 border-border/50">
          <div className="relative w-32 h-32 rounded-2xl border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] overflow-hidden bg-background flex items-center justify-center shrink-0">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <FiUser size={48} className="text-muted-foreground" />
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center sm:items-start gap-3">
            <h3 className="font-black text-lg text-foreground">Foto Profil</h3>
            <p className="text-sm font-bold text-muted-foreground text-center sm:text-left">
              Disarankan rasio 1:1, ukuran maksimal 2MB.
            </p>
            <label className="cursor-pointer bg-primary text-primary-foreground font-black text-sm px-6 py-2.5 rounded-xl border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-border)] transition-all">
              Pilih Foto
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar || saving} />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-foreground uppercase border-b-4 border-border/30 pb-2">Informasi Dasar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-black text-sm text-foreground flex justify-between">
                Nama Lengkap <span className="text-xs text-primary bg-primary/10 px-2 rounded-md">Dari Google</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                readOnly
                disabled
                className="w-full px-4 py-3 rounded-xl border-4 border-border/50 bg-muted text-muted-foreground font-bold outline-none cursor-not-allowed"
              />
            </div>
            
            <div className="space-y-2">
              <label className="font-black text-sm text-foreground flex justify-between">
                Email Kontak <span className="text-xs text-muted-foreground bg-muted px-2 rounded-md">Bisa email pribadi</span>
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="namakamu@gmail.com"
                className="w-full px-4 py-3 rounded-xl border-4 border-border bg-background font-bold outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="font-black text-sm text-foreground flex justify-between">
                Program Studi
              </label>
              <select
                name="prodi"
                value={formData.prodi}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-4 border-border bg-background font-bold outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all appearance-none"
              >
                {prodiOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-black text-sm text-foreground flex justify-between">
                Angkatan
              </label>
              <select
                name="angkatan"
                value={formData.angkatan}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-4 border-border bg-background font-bold outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all appearance-none"
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
        <div className="space-y-6">
          <h2 className="text-xl font-black text-foreground uppercase border-b-4 border-border/30 pb-2">Profil & Keahlian</h2>
          
          <div className="space-y-2">
            <label className="font-black text-sm text-foreground flex justify-between">
              Status Kesibukan
            </label>
            <select
              name="status_badge"
              value={formData.status_badge}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-4 border-border bg-background font-bold outline-none focus:border-accent focus:shadow-[4px_4px_0px_0px_var(--color-accent)] transition-all appearance-none"
            >
              {PREDEFINED_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-black text-sm text-foreground">Tentang Saya (Bio)</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Ceritakan sedikit tentang dirimu, passion, dan tujuanmu..."
              className="w-full px-4 py-3 rounded-xl border-4 border-border bg-background font-bold outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="font-black text-sm text-foreground flex justify-between">
              Keahlian Utama (Skills) <span className="text-xs text-muted-foreground bg-muted px-2 rounded-md">Max 5</span>
            </label>
            
            {/* Selected Skills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.skills.map(skill => (
                <span key={skill} className="px-3 py-1.5 rounded-xl border-2 border-border bg-primary/20 text-primary-foreground font-black text-xs flex items-center gap-2 shadow-[2px_2px_0px_0px_var(--color-border)]">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                    <FiX size={14} />
                  </button>
                </span>
              ))}
              {formData.skills.length === 0 && (
                <span className="text-xs font-bold text-muted-foreground italic bg-muted px-3 py-1.5 rounded-xl border-2 border-dashed border-border/50">Belum ada keahlian ditambahkan</span>
              )}
            </div>

            {/* Add Skill Input */}
            {formData.skills.length < 5 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if(skillInput) addSkill(skillInput.trim()); } }}
                  placeholder="Ketik keahlian (mis: React, Node.js)"
                  className="flex-1 px-4 py-3 rounded-xl border-4 border-border bg-background font-bold outline-none focus:border-secondary focus:shadow-[4px_4px_0px_0px_var(--color-secondary)] transition-all"
                  list="skill-suggestions"
                />
                <datalist id="skill-suggestions">
                  {PREDEFINED_SKILLS.filter(s => !formData.skills.includes(s)).map(s => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <button
                  type="button"
                  onClick={() => { if(skillInput) addSkill(skillInput.trim()); }}
                  className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-black border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-border)] transition-all whitespace-nowrap"
                >
                  Tambah
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-foreground uppercase border-b-4 border-border/30 pb-2">Tautan Sosial</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-black text-sm text-foreground">URL GitHub</label>
              <input
                type="url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full px-4 py-3 rounded-xl border-4 border-border bg-background font-bold outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="font-black text-sm text-foreground">URL LinkedIn</label>
              <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-3 rounded-xl border-4 border-border bg-background font-bold outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="font-black text-sm text-foreground">URL Instagram</label>
              <input
                type="url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleChange}
                placeholder="https://instagram.com/username"
                className="w-full px-4 py-3 rounded-xl border-4 border-border bg-background font-bold outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="font-black text-sm text-foreground">URL Website Pribadi</label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                placeholder="https://domainkamu.com"
                className="w-full px-4 py-3 rounded-xl border-4 border-border bg-background font-bold outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t-4 border-border/30 flex gap-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-6 py-4 rounded-xl bg-muted text-muted-foreground font-black border-4 border-border hover:bg-muted/80 transition-all flex-1 md:flex-none text-center"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving || (!isDirty && !avatarFile)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-primary-foreground font-black border-4 border-border shadow-[6px_6px_0px_0px_var(--color-border)] hover:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-border)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0px_0px_var(--color-border)]"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <FiSave size={20} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
