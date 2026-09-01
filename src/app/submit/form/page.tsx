"use client";

import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { FiPlus, FiTrash2, FiSend, FiArrowLeft, FiLoader, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import ImageUpload from "@/components/ui/ImageUpload";
import TechStackSelect from "@/components/upload/TechStackSelect";
import KTIToolsSelect from "@/components/upload/KTIToolsSelect";
import IoTComponentSelect from "@/components/upload/IoTComponentSelect";
import MultimediaToolsSelect from "@/components/upload/MultimediaToolsSelect";
import TeamMemberAutocomplete from "@/components/upload/TeamMemberAutocomplete";
import { useAuth } from "@/components/providers/AuthProvider";
import toast from "react-hot-toast";

const KATEGORI_OPTIONS = [
  { id: "Technology", label: "Aplikasi Web & Sistem" },
  { id: "Programming", label: "Aplikasi Mobile" },
  { id: "Research", label: "Karya Tulis & Jurnal" },
  { id: "IoT", label: "Proyek IoT" },
  { id: "Multimedia", label: "Desain & Lainnya" },
];

const initialFormState = {
  title: "",
  category: "",
  description: "",
  image_url: "",
  tech_stack: "",
  github_url: "",
  live_url: "",
  features: [{ title: "", desc: "" }],
  team: [{ name: "", role: "", avatar: "", user_id: "" }],
  gallery: [{ url: "", caption: "" }] as { url: string; caption: string }[],
};

export default function UploadKaryaFormPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams?.get("type") || "Technology";
  const editId = searchParams?.get("id");
  const { user, isLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [formData, setFormData] = useState({ ...initialFormState, category: typeParam });
  const [baseFormState, setBaseFormState] = useState({ ...initialFormState, category: typeParam });
  const [mahasiswaList, setMahasiswaList] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  // Fetch mahasiswa profiles + auto-fill user
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { data } = await supabase.from("mahasiswa_profiles").select("user_id, full_name, avatar_url");

      if (data) {
        setMahasiswaList(data);
        if (authUser) {
          const myProfile = data.find((m: any) => m.user_id === authUser.id);
          if (myProfile) {
            const autoFilledTeam = [{ name: myProfile.full_name, role: "Project Lead", avatar: myProfile.avatar_url || "", user_id: myProfile.user_id }];
            setBaseFormState(prev => ({ ...prev, team: autoFilledTeam }));
            setFormData(prev => {
              if (prev.team.length === 1 && prev.team[0].name === "") return { ...prev, team: autoFilledTeam };
              return prev;
            });
          }
        }
      }
    };
    fetchData();
  }, []);

  // Auto-set category from URL param (only if not editing)
  useEffect(() => {
    if (typeParam && !editId) {
      setFormData(prev => ({ ...prev, category: typeParam }));
      setBaseFormState(prev => ({ ...prev, category: typeParam }));
    }
  }, [typeParam, editId]);

  // Save draft to localStorage
  useEffect(() => {
    localStorage.setItem("karya_upload_draft", JSON.stringify(formData));
  }, [formData]);

  // Load draft from localStorage
  useEffect(() => {
    if (editId) return; // Do not load draft when editing an existing item
    const saved = localStorage.getItem("karya_upload_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({
          ...prev,
          ...parsed,
          category: typeParam, // Force URL parameter to dictate category over draft
          gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [],
          features: Array.isArray(parsed.features) && parsed.features.length > 0 ? parsed.features : prev.features,
          team: Array.isArray(parsed.team) && parsed.team.length > 0 ? parsed.team.map((t: any) => ({
            name: typeof t === "string" ? t : (t.name || ""),
            role: typeof t === "string" ? "" : (t.role || ""),
            avatar: typeof t === "string" ? "" : (t.avatar || ""),
            user_id: typeof t === "string" ? "" : (t.user_id || ""),
          })) : prev.team,
        }));
      } catch (e) {}
    }
  }, [typeParam, editId]);

  // Fetch existing data if editing
  useEffect(() => {
    if (!editId || !user) return;
    const fetchExisting = async () => {
      const { data, error } = await supabase.from("karya").select("*").eq("id", editId).single();
      if (data && !error) {
        // Prevent unauthorized edits
        if (data.user_id !== user.id) {
          router.push("/dashboard/projects");
          return;
        }
        const newFormData = {
          ...formData,
          title: data.title || "",
          category: data.category || typeParam,
          description: data.description || "",
          image_url: data.image_url || "",
          tech_stack: data.tech_stack ? data.tech_stack.join(", ") : "",
          github_url: data.github_url || "",
          live_url: data.live_url || "",
          features: data.features?.length > 0 ? data.features : [{ title: "", desc: "" }],
          team: data.team?.length > 0 ? data.team : formData.team,
          gallery: data.gallery?.length > 0 ? data.gallery : [{ url: "", caption: "" }],
        };
        setFormData(newFormData);
        setBaseFormState(newFormData);
      }
    };
    fetchExisting();
  }, [editId, user, supabase, router, typeParam]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(baseFormState);

  // Dynamic labels by category (use formData.category to support edit mode)
  const activeCategory = formData.category || typeParam;
  const isKTI = activeCategory === "Research";
  const isLainnya = activeCategory === "Multimedia";
  const techStackLabel = isKTI ? "Metode & Tools Penelitian" : activeCategory === "IoT" ? "Komponen & Platform IoT" : isLainnya ? "Software & Tools Kreatif" : "Tech Stack & Tools";
  const liveUrlLabel = isKTI ? "Link Jurnal / Repository" : activeCategory === "Programming" ? "Link App Store / APK" : activeCategory === "IoT" ? "Link Dokumentasi / Demo" : isLainnya ? "Link Portfolio / Behance" : "Link Demo / Live URL";
  const featuresLabel = isKTI ? "Poin Pembahasan Utama" : isLainnya ? "Fitur & Detail Karya" : activeCategory === "IoT" ? "Spesifikasi & Fitur" : "Fitur Utama";
  const featuresDesc = isKTI ? "Tambahkan poin-poin pembahasan utama dari karya tulis Anda." : isLainnya ? "Jelaskan detail, konsep, atau elemen utama karya." : "Jelaskan fitur-fitur unggulan dari projek Anda.";
  const showGithub = !isKTI && !isLainnya;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, id } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (id) setInvalidFields(prev => prev.filter(f => f !== id));
  };

  const handleFitur = (index: number, field: "title" | "desc", value: string) => {
    const updated = [...formData.features];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, features: updated }));
    setInvalidFields(prev => prev.filter(id => id !== `input-feature-0-title`));
  };

  const handleTim = (index: number, field: "name" | "role" | "avatar" | "user_id", value: string) => {
    const updated = [...formData.team];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, team: updated }));
    setInvalidFields(prev => prev.filter(id => id !== `input-team-0-name`));
  };

  const handleGallery = (index: number, field: "url" | "caption", value: string) => {
    const updated = [...formData.gallery];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, gallery: updated }));
    setInvalidFields(prev => prev.filter(id => id !== `input-gallery-0-url`));
  };

  const isValidUrl = (url: string) => { try { new URL(url); return true; } catch { return false; } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Use formData.category so we don't accidentally override it with the URL param when editing
    const dataToSubmit = { ...formData };

    const fields: string[] = [];
    if (!dataToSubmit.image_url) fields.push("section-image");
    if (!dataToSubmit.title.trim()) fields.push("input-title");
    if (!dataToSubmit.description.trim()) fields.push("input-description");
    if (!dataToSubmit.tech_stack.trim()) fields.push("input-tech-stack");
    if (!dataToSubmit.live_url.trim()) fields.push("input-live-url");
    else if (!isValidUrl(dataToSubmit.live_url.trim())) fields.push("input-live-url");
    if (dataToSubmit.github_url.trim() && !isValidUrl(dataToSubmit.github_url.trim())) fields.push("input-github-url");
    const validFeatures = dataToSubmit.features.filter(f => f.title.trim() !== "" || f.desc.trim() !== "");
    if (validFeatures.length === 0) {
      fields.push("input-feature-0-title");
      fields.push("input-feature-0-desc");
    } else {
      dataToSubmit.features.forEach((f, i) => {
        if (f.title.trim() || f.desc.trim()) {
          if (!f.title.trim()) fields.push(`input-feature-${i}-title`);
          if (!f.desc.trim()) fields.push(`input-feature-${i}-desc`);
        }
      });
    }

    const validTeam = formData.team.filter(t => t.name.trim() !== "" || t.role.trim() !== "");
    if (validTeam.length === 0) {
      fields.push("input-team-0-name");
      fields.push("input-team-0-role");
    } else {
      formData.team.forEach((t, i) => {
        if (t.name.trim() || t.role.trim()) {
          if (!t.name.trim()) fields.push(`input-team-${i}-name`);
          if (!t.role.trim()) fields.push(`input-team-${i}-role`);
        }
      });
    }

    const validGallery = formData.gallery.filter(g => g.url.trim() !== "");
    if (validGallery.length === 0 && formData.gallery.length > 0 && formData.gallery[0].url === "") {
      // Gallery is optional, so we don't strictly require it unless they added a new empty row and tried to submit.
      // But actually, gallery is required in the UI ("GALERI FOTO *")
      fields.push("input-gallery-0-url");
    } else if (validGallery.length === 0) {
      fields.push("input-gallery-0-url");
    }

    if (fields.length > 0) {
      setInvalidFields(fields);
      setErrorMsg("Mohon lengkapi semua field yang wajib diisi.");
      toast.error("Mohon lengkapi semua field yang wajib diisi.");
      document.getElementById(fields[0])?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!user) {
      toast.error("Sesi telah habis, silakan login kembali.");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Mengirim karya...");
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Silakan login kembali.");

      const techStackArray = dataToSubmit.tech_stack.split(",").map(t => t.trim()).filter(Boolean);
      const teamObjects = dataToSubmit.team.filter(t => t.name.trim() !== "").map(t => ({ name: t.name, role: t.role, avatar: t.avatar || "", user_id: t.user_id || undefined }));

      const dataToSave = {
        title: dataToSubmit.title,
        category: dataToSubmit.category,
        description: dataToSubmit.description,
        tech_stack: techStackArray,
        github_url: dataToSubmit.github_url || null,
        live_url: dataToSubmit.live_url || null,
        team: teamObjects,
        features: validFeatures,
        gallery: validGallery,
        status: "pending",
        ai_review_status: "pending_review",
        image_url: dataToSubmit.image_url,
      };

      if (editId) {
        // Edit Mode
        const { error } = await supabase.from("karya").update(dataToSave).eq("id", editId);
        if (error) throw error;
      } else {
        // Create Mode
        const { error } = await supabase.from("karya").insert({
          user_id: authUser.id,
          slug: dataToSubmit.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(2, 6),
          ...dataToSave
        });
        if (error) throw error;
      }

      // Trigger AI Worker secara asinkron (background) agar karya langsung direview
      fetch("/api/ai-review", {
        method: "POST",
        headers: {
          Authorization: "Bearer karya-tazkia-cron-2025"
        }
      }).catch(err => console.error("Gagal trigger AI worker:", err));

      localStorage.removeItem("karya_upload_draft");
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f97316", "#1e3a8a", "#fbbf24", "#ffffff"]
      });
      
      toast.success(editId ? "Karya berhasil diperbarui!" : "Karya berhasil diupload!", { id: toastId });
      setTimeout(() => { router.push("/dashboard/projects"); }, 2000);
    } catch (err: any) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error(err.message || "Gagal mengunggah karya. Silakan coba lagi.");
      setErrorMsg(err.message || "Gagal mengunggah karya. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (id: string) => `w-full px-4 py-3 bg-muted/30 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-medium text-foreground ${
    invalidFields.includes(id)
      ? "border-red-500 focus:ring-red-500/40 bg-red-50/20"
      : "border-border focus:ring-primary/30 focus:border-primary"
  }`;
  const labelClass = "block text-sm font-black text-foreground mb-1.5 uppercase";
  const sectionTitleClass = "text-sm font-black text-primary uppercase tracking-wider mb-4 flex items-center gap-2";

  if (isLoading || !user) return null;

  return (
    <div className="w-full pt-6 md:pt-10 pb-28 md:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => isDirty ? setShowLeaveConfirm(true) : router.push(editId ? "/dashboard/projects" : "/submit")}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-black mb-4 uppercase"
          >
            <FiArrowLeft className="w-4 h-4" /> Kembali
          </button>
          <h1 className="text-3xl font-black text-primary uppercase tracking-tight">
            {editId ? "Edit Karya" : "Form Upload Karya"}
          </h1>
          <p className="text-muted-foreground font-bold">
            Kategori: <span className="text-foreground font-black">{KATEGORI_OPTIONS.find(o => o.id === formData.category)?.label || formData.category}</span>
          </p>
        </div>

        <form noValidate onSubmit={handleSubmit} className="bg-card border-4 border-border rounded-3xl shadow-[8px_8px_0px_var(--color-border)] p-6 md:p-8 space-y-8">
          {errorMsg && (
            <div className="p-4 bg-red-100 text-red-700 border-2 border-red-500 rounded-xl text-sm font-bold flex items-center gap-2">
              <FiAlertCircle size={18} className="shrink-0" /> {errorMsg}
            </div>
          )}

          {/* Cover Image */}
          <div id="section-image">
            <h3 className={sectionTitleClass}>
              <span className="w-1 h-4 bg-secondary rounded-full block" /> Foto Utama Karya <span className="text-red-400 normal-case">*</span>
            </h3>
            <div className={`mb-2 p-1 rounded-2xl transition-all ${invalidFields.includes("section-image") ? "border-2 border-red-500 bg-red-50/20 shadow-[0_0_0_4px_rgba(239,68,68,0.15)]" : "border-2 border-transparent"}`}>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => { setFormData(prev => ({ ...prev, image_url: url })); setInvalidFields(prev => prev.filter(id => id !== "section-image")); }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 px-1 font-bold">Format: JPG, PNG, WEBP. Maksimal 2MB. Resolusi disarankan 1280×720px.</p>
          </div>

          {/* Informasi Utama */}
          <div>
            <h3 className={sectionTitleClass}><span className="w-1 h-4 bg-secondary rounded-full block" /> Informasi Utama</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={labelClass}>Judul Karya <span className="text-red-400">*</span></label>
                  <span className={`text-xs font-bold ${formData.title.length >= 100 ? "text-red-500" : "text-muted-foreground"}`}>{formData.title.length}/100</span>
                </div>
                <input id="input-title" name="title" type="text" maxLength={100} value={formData.title} onChange={handleInput} placeholder="Contoh: Smart Campus Navigation System" className={getInputClass("input-title")} />
              </div>
              <div>
                <label className={labelClass}>Kategori <span className="text-red-400">*</span></label>
                <select id="input-category" name="category" value={formData.category} onChange={handleInput} className={`${getInputClass("input-category")} ${!editId ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`} disabled={!editId}>
                  <option value="" disabled>Pilih kategori...</option>
                  {KATEGORI_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                </select>
                {!editId && <p className="text-xs text-muted-foreground mt-2 font-bold">Kategori dipilih dari halaman sebelumnya. Kembali untuk mengubah.</p>}
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={labelClass}>Deskripsi <span className="text-red-400">*</span></label>
                  <span className={`text-xs font-bold ${formData.description.length >= 500 ? "text-red-500" : "text-muted-foreground"}`}>{formData.description.length}/500</span>
                </div>
                <textarea id="input-description" name="description" rows={4} maxLength={500} value={formData.description} onChange={handleInput} placeholder="Jelaskan karya Anda secara singkat dan menarik..." className={`${getInputClass("input-description")} resize-none`} />
              </div>
            </div>
          </div>

          {/* Tech Stack & Links */}
          <div id="section-tech">
            <h3 className={sectionTitleClass}><span className="w-1 h-4 bg-secondary rounded-full block" /> {techStackLabel}</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="input-tech-stack" className={labelClass}>{techStackLabel} <span className="text-red-400">*</span></label>
                {isKTI ? (
                  <KTIToolsSelect value={formData.tech_stack} onChange={(val) => { setFormData(prev => ({ ...prev, tech_stack: val })); setInvalidFields(prev => prev.filter(id => id !== "input-tech-stack")); }} error={invalidFields.includes("input-tech-stack")} />
                ) : typeParam === "IoT" ? (
                  <IoTComponentSelect value={formData.tech_stack} onChange={(val) => { setFormData(prev => ({ ...prev, tech_stack: val })); setInvalidFields(prev => prev.filter(id => id !== "input-tech-stack")); }} error={invalidFields.includes("input-tech-stack")} />
                ) : isLainnya ? (
                  <MultimediaToolsSelect value={formData.tech_stack} onChange={(val) => { setFormData(prev => ({ ...prev, tech_stack: val })); setInvalidFields(prev => prev.filter(id => id !== "input-tech-stack")); }} error={invalidFields.includes("input-tech-stack")} />
                ) : (
                  <TechStackSelect value={formData.tech_stack} onChange={(val) => { setFormData(prev => ({ ...prev, tech_stack: val })); setInvalidFields(prev => prev.filter(id => id !== "input-tech-stack")); }} error={invalidFields.includes("input-tech-stack")} />
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{liveUrlLabel} <span className="text-red-400">*</span></label>
                  <input id="input-live-url" name="live_url" type="url" value={formData.live_url} onChange={handleInput} placeholder="https://..." className={getInputClass("input-live-url")} />
                </div>
                {showGithub && (
                  <div>
                    <label htmlFor="input-github-url" className={labelClass}>GitHub URL (Opsional)</label>
                    <input id="input-github-url" name="github_url" type="url" value={formData.github_url} onChange={handleInput} placeholder="https://github.com/..." className={getInputClass("input-github-url")} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fitur */}
          <div id="section-features">
            <div className="flex items-center justify-between mb-4">
              <h3 className={sectionTitleClass}>
                <span className="w-1 h-4 bg-secondary rounded-full block" /> {featuresLabel} <span className="text-red-400 normal-case">*</span>
              </h3>
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, features: [...prev.features, { title: "", desc: "" }] }))} className="flex items-center gap-1.5 text-xs font-black text-primary hover:text-secondary transition-colors uppercase">
                <FiPlus size={14} /> Tambah
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4 font-bold">{featuresDesc}</p>
            <div className="space-y-3">
              {formData.features.map((fitur, i) => (
                <div key={i} className="bg-muted/30 rounded-2xl p-4 border-2 border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-wide">{isKTI ? "Poin" : "Fitur"} {i + 1}</p>
                    {i > 0 && <button type="button" onClick={() => setFormData(prev => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }))} className="text-muted-foreground/50 hover:text-red-400 transition-colors"><FiTrash2 size={14} /></button>}
                  </div>
                  <div className="space-y-3">
                    <input type="text" value={fitur.title} onChange={(e) => handleFitur(i, "title", e.target.value)} placeholder="Judul fitur..." className={getInputClass(`input-feature-${i}-title`)} id={`input-feature-${i}-title`} />
                    <textarea rows={2} value={fitur.desc} onChange={(e) => handleFitur(i, "desc", e.target.value)} placeholder="Deskripsi singkat..." className={`${getInputClass(`input-feature-${i}-desc`)} resize-none`} id={`input-feature-${i}-desc`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tim */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className={sectionTitleClass}><span className="w-1 h-4 bg-secondary rounded-full block" /> Anggota Tim <span className="text-red-400 normal-case">*</span></h3>
              {formData.team.length < 5 && <button type="button" onClick={() => setFormData(prev => ({ ...prev, team: [...prev.team, { name: "", role: "", avatar: "", user_id: "" }] }))} className="flex items-center gap-1.5 text-xs font-black text-primary hover:text-secondary transition-colors uppercase"><FiPlus size={14} /> Tambah Anggota</button>}
            </div>
            <div className="space-y-3">
              {formData.team.map((anggota, i) => (
                <div key={i} className="bg-muted/30 rounded-2xl p-4 border-2 border-border/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-wide">{i === 0 ? "Project Lead" : `Anggota ${i + 1}`}</p>
                    {i > 0 && <button type="button" onClick={() => setFormData(prev => ({ ...prev, team: prev.team.filter((_, idx) => idx !== i) }))} className="text-muted-foreground/50 hover:text-red-400 transition-colors"><FiTrash2 size={14} /></button>}
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      {anggota.user_id ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-border bg-card flex items-center justify-center opacity-80 cursor-not-allowed">
                          {anggota.avatar ? <img src={anggota.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary text-white flex items-center justify-center font-black text-xl">{anggota.name.charAt(0) || "?"}</div>}
                        </div>
                      ) : (
                        <ImageUpload value={anggota.avatar || ""} onChange={(url) => handleTim(i, "avatar", url)} />
                      )}
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div id={`input-team-${i}-name`} className={`rounded-xl transition-all ${invalidFields.includes(`input-team-${i}-name`) ? "ring-2 ring-red-500 ring-offset-1" : ""}`}>
                        <TeamMemberAutocomplete
                          value={anggota.name}
                          mahasiswaList={mahasiswaList}
                          onChange={(name, user_id, avatar) => {
                            const u = [...formData.team];
                            u[i].name = name;
                            if (user_id !== undefined) u[i].user_id = user_id;
                            if (avatar !== undefined) u[i].avatar = avatar;
                            setFormData(prev => ({ ...prev, team: u }));
                          }}
                          placeholder="Nama Lengkap..."
                          disabled={i === 0}
                        />
                      </div>
                      <input type="text" value={anggota.role} onChange={e => handleTim(i, "role", e.target.value)} placeholder="Peran (misal: Backend Dev)" className={getInputClass(`input-team-${i}-role`)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Galeri */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className={sectionTitleClass}><span className="w-1 h-4 bg-secondary rounded-full block" /> Dokumentasi <span className="text-red-400 normal-case">*</span></h3>
              {formData.gallery.length < 10 && <button type="button" onClick={() => setFormData(prev => ({ ...prev, gallery: [...prev.gallery, { url: "", caption: "" }] }))} className="flex items-center gap-1.5 text-xs font-black text-primary hover:text-secondary transition-colors uppercase"><FiPlus size={14} /> Tambah Dokumentasi</button>}
            </div>
            <div className="space-y-3">
              {formData.gallery.map((gal, i) => (
                <div key={i} className="rounded-2xl p-4 border-2 border-border/50 bg-muted/30 flex flex-col sm:flex-row gap-4 items-start">
                  <div id={`input-gallery-${i}-url`} className={`shrink-0 p-1 rounded-2xl transition-all ${invalidFields.includes(`input-gallery-${i}-url`) ? "border-2 border-red-500 bg-red-50/20 shadow-[0_0_0_4px_rgba(239,68,68,0.15)]" : "border-2 border-transparent"}`}>
                    <ImageUpload value={gal.url} onChange={(url) => handleGallery(i, "url", url)} />
                  </div>
                  <div className="flex-1 flex flex-col gap-3 justify-center">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-wide">Dokumentasi {i + 1}</p>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, idx) => idx !== i) }))} className="text-muted-foreground/50 hover:text-red-400 transition-colors"><FiTrash2 size={14} /></button>
                    </div>
                    <input type="text" value={gal.caption} onChange={e => handleGallery(i, "caption", e.target.value)} placeholder="Keterangan dokumentasi (opsional)" className={getInputClass("")} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t-4 border-border/30">
            {editId && !isDirty && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-700 rounded-xl flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-yellow-800 dark:text-yellow-400 leading-tight">
                  Tombol kirim terkunci karena kamu belum membuat perubahan apa pun. Ubah minimal satu isian untuk dapat mengirim ulang.
                </p>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting || (!!editId && !isDirty)}
              className="w-full flex items-center justify-center gap-2.5 py-4 bg-primary text-primary-foreground font-black rounded-2xl border-4 border-border shadow-[4px_4px_0px_var(--color-border)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_var(--color-border)] active:translate-y-0 active:shadow-[2px_2px_0px_var(--color-border)] transition-all text-sm uppercase disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-[2px_2px_0px_var(--color-border)]"
            >
              {isSubmitting ? <FiLoader className="animate-spin" size={18} /> : <FiSend size={18} />}
              {isSubmitting 
                ? (editId ? "Memperbarui Karya..." : "Mengirim Karya...") 
                : (editId ? "Perbarui & Kirim Ulang" : "Kirim Karya untuk Ditinjau")}
            </button>
            <p className="text-center text-xs text-muted-foreground mt-3 font-bold">
              {editId 
                ? "Karya akan kembali berstatus Menunggu dan di-review ulang setelah diperbarui."
                : 'Karya akan masuk ke mode "Menunggu" dan ditinjau sebelum dipublikasikan.'}
            </p>
          </div>
        </form>
      </div>

      {/* Leave Confirm Modal */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-card border-4 border-border rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-[8px_8px_0px_var(--color-border)]">
              <div className="w-16 h-16 rounded-2xl bg-red-100 border-4 border-red-500 text-red-500 flex items-center justify-center mb-4"><FiAlertCircle size={28} /></div>
              <h3 className="text-xl font-black text-foreground mb-2 uppercase">Perubahan Belum Tersimpan</h3>
              <p className="text-muted-foreground text-sm mb-6 font-bold">Semua isian form akan hilang jika kamu meninggalkan halaman ini.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowLeaveConfirm(false)} className="flex-1 py-3 px-4 rounded-xl font-black text-sm text-foreground bg-muted border-2 border-border hover:bg-muted/80 transition-colors">Tetap di Sini</button>
                <button type="button" onClick={() => { setShowLeaveConfirm(false); router.push(editId ? "/dashboard/projects" : "/submit"); }} className="flex-1 py-3 px-4 rounded-xl font-black text-sm text-white bg-red-500 border-2 border-red-700 shadow-[3px_3px_0px_0px_#991b1b] hover:bg-red-600 hover:translate-y-0.5 transition-all">Ya, Kembali</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
