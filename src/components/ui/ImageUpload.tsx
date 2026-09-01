"use client";

import React, { useState, useRef } from "react";
import { FiUpload, FiX, FiImage, FiLoader } from "react-icons/fi";
import { createBrowserClient } from "@supabase/ssr";
import { compressImage } from "@/lib/imageCompression";
import toast from "react-hot-toast";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export default function ImageUpload({ value, onChange, className = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran file maksimal 2MB");
      toast.error("Ukuran file maksimal 2MB!");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Hanya file gambar yang diperbolehkan");
      toast.error("Hanya file gambar yang diperbolehkan!");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const toastId = toast.loading("Mengunggah foto...");

      const compressedFile = await compressImage(file, 1, 1920);
      const fileExt = compressedFile.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `karya/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("public_images")
        .upload(filePath, compressedFile, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("public_images").getPublicUrl(filePath);
      
      toast.success("Foto berhasil diunggah!", { id: toastId });
      onChange(publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Gagal mengunggah gambar");
      toast.dismiss();
      toast.error(err.message || "Gagal mengunggah gambar!");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFileChange({ target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>);
  };
  const handleRemove = (e: React.MouseEvent) => { e.stopPropagation(); onChange(""); };

  return (
    <div className={`relative ${className}`}>
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={isUploading} />
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-border aspect-square w-full max-w-[120px] bg-muted/30 flex items-center justify-center">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button onClick={handleRemove} className="w-8 h-8 bg-red-500 rounded-full text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md" title="Hapus foto" type="button">
              <FiX />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={isUploading}
          className={`aspect-square w-full max-w-[120px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all
            ${isUploading ? "border-primary/50 bg-primary/5 text-primary" : ""}
            ${isDragging ? "border-primary bg-primary/10 text-primary scale-105" : !isUploading ? "border-border text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary" : ""}
            ${error ? "border-red-400 bg-red-50 text-red-500" : ""}
          `}
        >
          {isUploading ? <FiLoader className="animate-spin text-xl" /> : (
            <>
              <FiImage className="text-2xl opacity-70" />
              <span className="text-[10px] font-medium px-2 text-center leading-tight">Upload Foto</span>
            </>
          )}
        </button>
      )}
      {error && <p className="text-[10px] text-red-500 mt-1.5 font-medium absolute -bottom-5 left-0 whitespace-nowrap">{error}</p>}
    </div>
  );
}
