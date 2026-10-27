"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Download, Moon, Sun, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function BrandStudioPage() {
  const [navy, setNavy] = useState("#131F33");
  const [orange, setOrange] = useState("#FF7F0A");
  const [showSlogan, setShowSlogan] = useState(true);
  const [showShadow, setShowShadow] = useState(true);
  const [activeTab, setActiveTab] = useState<"html" | "svg" | "tailwind">("html");
  const [darkNavbar, setDarkNavbar] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const copyText = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    toast.success(msg);
  };

  const downloadSVG = (svgId: string, filename: string) => {
    const svgEl = document.getElementById(svgId);
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgEl);
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Mengunduh ${filename}...`);
  };

  const downloadPNG = (svgId: string, filename: string, width: number, height: number) => {
    const svgEl = document.getElementById(svgId);
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success(`Mengunduh ${filename} (HD)...`);
      }
    };
    img.src = url;
  };

  const getGeneratedCode = () => {
    const sloganHTML = showSlogan
      ? `\n    <span class="kt-slogan">Kreativitas &amp; Inspirasi Tanpa Batas</span>`
      : "";
    const sloganSVG = showSlogan
      ? `\n    <text x="3" y="122" font-family="'Montserrat', sans-serif" font-size="18.5" font-weight="400" fill="#2D3748" letter-spacing="0.3">Kreativitas &amp; Inspirasi Tanpa Batas</text>`
      : "";
    const titleY = showSlogan ? "92" : "104";

    if (activeTab === "html") {
      return `<!-- Load Font Montserrat dari Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;800&display=swap" rel="stylesheet">

<!-- Logo Karya Tazkia (HTML + SVG) -->
<a href="/" class="kt-brand-logo">
  <!-- Simbol Monogram KT -->
  <svg class="kt-icon" viewBox="0 0 155 130" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(2, 2)">
      <rect x="10" y="10" width="28" height="108" rx="14" fill="${orange}"/>
      <rect x="54" y="26" width="17" height="78" fill="${navy}"/>
      <polygon points="67,63 105,26 126,26 80,72" fill="${navy}"/>
      <polygon points="75,58 128,104 107,104 65,68" fill="${navy}"/>
      <path d="M 90 26 L 99 26 L 83 42 L 77 42 C 77 32 82 26 90 26 Z" fill="${orange}"/>
      <path d="M 131 26 L 147 26 C 147 35 141 42 132 42 L 122 42 L 122 92 C 122 99 116 104 106 104 L 106 56 L 131 26 Z" fill="${orange}"/>
    </g>
  </svg>

  <div class="kt-text-wrap">
    <div class="kt-title">
      <span class="kt-navy">Karya</span> <span class="kt-orange">Tazkia</span>
    </div>${sloganHTML}
  </div>
</a>

<style>
  .kt-brand-logo { display: inline-flex; align-items: center; gap: 14px; text-decoration: none; font-family: 'Montserrat', sans-serif; }
  .kt-icon { width: 56px; height: 48px; filter: drop-shadow(0 3px 4px rgba(15, 23, 42, 0.16)); transition: transform 0.25s ease; }
  .kt-brand-logo:hover .kt-icon { transform: scale(1.05); }
  .kt-text-wrap { display: flex; flex-direction: column; }
  .kt-title { font-size: 28px; font-weight: 800; line-height: 1.05; letter-spacing: -0.5px; }
  .kt-navy { color: ${navy}; }
  .kt-orange { color: ${orange}; }
  .kt-slogan { font-size: 11px; font-weight: 400; color: #2D3748; margin-top: 3px; letter-spacing: 0.25px; }
</style>`;
    }

    if (activeTab === "svg") {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 160" width="100%" height="100%" fill="none">
  <defs>
    <filter id="ktShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="4" stdDeviation="3.5" flood-color="#0F172A" flood-opacity="0.18"/>
    </filter>
  </defs>

  <g ${showShadow ? 'filter="url(#ktShadow)" ' : ''}transform="translate(15, 16)">
    <rect x="10" y="10" width="28" height="108" rx="14" fill="${orange}"/>
    <rect x="54" y="26" width="17" height="78" fill="${navy}"/>
    <polygon points="67,63 105,26 126,26 80,72" fill="${navy}"/>
    <polygon points="75,58 128,104 107,104 65,68" fill="${navy}"/>
    <path d="M 90 26 L 99 26 L 83 42 L 77 42 C 77 32 82 26 90 26 Z" fill="${orange}"/>
    <path d="M 131 26 L 147 26 C 147 35 141 42 132 42 L 122 42 L 122 92 C 122 99 116 104 106 104 L 106 56 L 131 26 Z" fill="${orange}"/>
  </g>

  <g transform="translate(195, 0)">
    <g ${showShadow ? 'filter="url(#ktShadow)"' : ''}>
      <text x="0" y="${titleY}" font-family="'Montserrat', 'Plus Jakarta Sans', sans-serif" font-size="60" font-weight="800" letter-spacing="-1">
        <tspan fill="${navy}">Karya</tspan>
        <tspan fill="${orange}" dx="4">Tazkia</tspan>
      </text>
    </g>${sloganSVG}
  </g>
</svg>`;
    }

    return `<!-- Komponen Logo Karya Tazkia dengan Tailwind CSS -->
<a href="/" class="inline-flex items-center gap-3.5 group focus:outline-none">
  <svg class="w-14 h-12 drop-shadow-sm transition-transform duration-300 group-hover:scale-105" viewBox="0 0 155 130" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(2, 2)">
      <rect x="10" y="10" width="28" height="108" rx="14" fill="${orange}"/>
      <rect x="54" y="26" width="17" height="78" fill="${navy}"/>
      <polygon points="67,63 105,26 126,26 80,72" fill="${navy}"/>
      <polygon points="75,58 128,104 107,104 65,68" fill="${navy}"/>
      <path d="M 90 26 L 99 26 L 83 42 L 77 42 C 77 32 82 26 90 26 Z" fill="${orange}"/>
      <path d="M 131 26 L 147 26 C 147 35 141 42 132 42 L 122 42 L 122 92 C 122 99 116 104 106 104 L 106 56 L 131 26 Z" fill="${orange}"/>
    </g>
  </svg>

  <div class="flex flex-col">
    <div class="text-2xl sm:text-3xl font-extrabold tracking-tight leading-none drop-shadow-2xs">
      <span class="text-[${navy}]">Karya</span>
      <span class="text-[${orange}] ml-1">Tazkia</span>
    </div>${showSlogan ? `\n    <span class="text-[11px] font-normal text-slate-700 tracking-wide mt-1">\n      Kreativitas &amp; Inspirasi Tanpa Batas\n    </span>` : ""}
  </div>
</a>`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07132B] text-slate-800 dark:text-slate-100 transition-colors">
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Banner simulation */}
      <header
        className="sticky top-0 z-30 transition-colors duration-300 border-b shadow-xs"
        style={{
          backgroundColor: darkNavbar ? navy : "#FFFFFF",
          borderColor: darkNavbar ? "#1E293B" : "#E2E8F0",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group focus:outline-none">
            <svg
              className="w-12 h-11 transition-transform duration-300 group-hover:scale-105"
              viewBox="0 0 155 130"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="translate(2, 2)">
                <rect x="10" y="10" width="28" height="108" rx="14" fill={orange} />
                <rect x="54" y="26" width="17" height="78" fill={darkNavbar ? "#FFFFFF" : navy} />
                <polygon points="67,63 105,26 126,26 80,72" fill={darkNavbar ? "#FFFFFF" : navy} />
                <polygon points="75,58 128,104 107,104 65,68" fill={darkNavbar ? "#FFFFFF" : navy} />
                <path d="M 90 26 L 99 26 L 83 42 L 77 42 C 77 32 82 26 90 26 Z" fill={orange} />
                <path
                  d="M 131 26 L 147 26 C 147 35 141 42 132 42 L 122 42 L 122 92 C 122 99 116 104 106 104 L 106 56 L 131 26 Z"
                  fill={orange}
                />
              </g>
            </svg>

            <div className="flex flex-col justify-center">
              <div
                className="font-['Montserrat',sans-serif] text-2xl sm:text-[26px] font-extrabold tracking-tight leading-none flex items-center"
                style={{ color: darkNavbar ? "#FFFFFF" : navy }}
              >
                <span>Karya</span>
                <span className="ml-1.5" style={{ color: orange }}>
                  Tazkia
                </span>
              </div>
              {showSlogan && (
                <span
                  className="font-['Montserrat',sans-serif] text-[10px] sm:text-[11px] font-normal tracking-wide mt-1 transition-all"
                  style={{ color: darkNavbar ? "#CBD5E1" : "#64748B" }}
                >
                  Kreativitas &amp; Inspirasi Tanpa Batas
                </span>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Simulasi Header Website
            </span>
            <button
              onClick={() => setDarkNavbar(!darkNavbar)}
              className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {darkNavbar ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              <span>{darkNavbar ? "Coba Header Terang" : "Coba Header Navy"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Customizer Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 sm:p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400 px-2.5 py-1 rounded-md">
                Official Campus Identity
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                Studio Logo &amp; Kode <span className="text-[#FF7F0A]">Karya Tazkia</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">
                Sesuaikan nuansa warna Navy &amp; Orange, uji tampilan di berbagai tema, lalu unduh aset vektor SVG, PNG HD transparan, atau salin kode siap pakai.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {/* Navy Selector */}
              <div className="flex flex-col">
                <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  Pilihan Navy Biru
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setNavy("#131F33")}
                    title="Original Deep Navy (#131F33)"
                    className={`w-7 h-7 rounded-lg bg-[#131F33] transition hover:scale-105 cursor-pointer ${
                      navy === "#131F33" ? "ring-2 ring-offset-1 ring-orange-500" : ""
                    }`}
                  />
                  <button
                    onClick={() => setNavy("#0F172A")}
                    title="Slate Navy (#0F172A)"
                    className={`w-7 h-7 rounded-lg bg-[#0F172A] transition hover:scale-105 cursor-pointer ${
                      navy === "#0F172A" ? "ring-2 ring-offset-1 ring-orange-500" : ""
                    }`}
                  />
                  <button
                    onClick={() => setNavy("#1E3A8A")}
                    title="Royal Navy Blue (#1E3A8A)"
                    className={`w-7 h-7 rounded-lg bg-[#1E3A8A] transition hover:scale-105 cursor-pointer ${
                      navy === "#1E3A8A" ? "ring-2 ring-offset-1 ring-orange-500" : ""
                    }`}
                  />
                  <input
                    type="color"
                    value={navy}
                    onChange={(e) => setNavy(e.target.value.toUpperCase())}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                    title="Pilih warna Navy sendiri"
                  />
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

              {/* Orange Selector */}
              <div className="flex flex-col">
                <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  Pilihan Orange
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setOrange("#FF7F0A")}
                    title="Original Tazkia Orange (#FF7F0A)"
                    className={`w-7 h-7 rounded-lg bg-[#FF7F0A] transition hover:scale-105 cursor-pointer ${
                      orange === "#FF7F0A" ? "ring-2 ring-offset-1 ring-slate-800" : ""
                    }`}
                  />
                  <button
                    onClick={() => setOrange("#F97316")}
                    title="Vibrant Orange (#F97316)"
                    className={`w-7 h-7 rounded-lg bg-[#F97316] transition hover:scale-105 cursor-pointer ${
                      orange === "#F97316" ? "ring-2 ring-offset-1 ring-slate-800" : ""
                    }`}
                  />
                  <button
                    onClick={() => setOrange("#EA580C")}
                    title="Deep Orange (#EA580C)"
                    className={`w-7 h-7 rounded-lg bg-[#EA580C] transition hover:scale-105 cursor-pointer ${
                      orange === "#EA580C" ? "ring-2 ring-offset-1 ring-slate-800" : ""
                    }`}
                  />
                  <input
                    type="color"
                    value={orange}
                    onChange={(e) => setOrange(e.target.value.toUpperCase())}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                    title="Pilih warna Orange sendiri"
                  />
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

              {/* Toggles */}
              <div className="flex flex-col gap-1.5">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSlogan}
                    onChange={(e) => setShowSlogan(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all relative peer-checked:bg-[#FF7F0A]" />
                  <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Tampilkan Slogan</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showShadow}
                    onChange={(e) => setShowShadow(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all relative peer-checked:bg-[#131F33]" />
                  <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Efek Bayangan 3D</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* LOGO SHOWCASE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          {/* CARD 1: VERSI UTAMA LIGHT */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-2 bg-slate-50/60 dark:bg-slate-950/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Logo Utama (Presisi 1:1)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadSVG("svg-master-light", "logo-karya-tazkia.svg")}
                  className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-orange-500" />
                  Unduh .SVG
                </button>
                <button
                  onClick={() => downloadPNG("svg-master-light", "logo-karya-tazkia.png", 1600, 420)}
                  className="text-xs font-bold text-white bg-[#FF7F0A] hover:bg-orange-600 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh .PNG (HD)
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-12 flex-1 flex items-center justify-center bg-white dark:bg-slate-950 min-h-[260px]">
              <svg
                id="svg-master-light"
                className="w-full max-w-[680px] h-auto"
                viewBox="0 0 680 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <filter id="dropShadowLight" x="-10%" y="-10%" width="125%" height="125%">
                    <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#0F172A" floodOpacity="0.18" />
                  </filter>
                </defs>

                <g filter={showShadow ? "url(#dropShadowLight)" : undefined} transform="translate(15, 16)">
                  <rect x="10" y="10" width="28" height="108" rx="14" fill={orange} />
                  <rect x="54" y="26" width="17" height="78" fill={navy} />
                  <polygon points="67,63 105,26 126,26 80,72" fill={navy} />
                  <polygon points="75,58 128,104 107,104 65,68" fill={navy} />
                  <path d="M 90 26 L 99 26 L 83 42 L 77 42 C 77 32 82 26 90 26 Z" fill={orange} />
                  <path
                    d="M 131 26 L 147 26 C 147 35 141 42 132 42 L 122 42 L 122 92 C 122 99 116 104 106 104 L 106 56 L 131 26 Z"
                    fill={orange}
                  />
                </g>

                <g transform="translate(195, 0)">
                  <g filter={showShadow ? "url(#dropShadowLight)" : undefined}>
                    <text
                      x="0"
                      y={showSlogan ? "92" : "104"}
                      fontFamily="'Montserrat', 'Plus Jakarta Sans', sans-serif"
                      fontSize="60"
                      fontWeight="800"
                      letterSpacing="-1"
                    >
                      <tspan fill={navy}>Karya</tspan>
                      <tspan fill={orange} dx="4">
                        Tazkia
                      </tspan>
                    </text>
                  </g>
                  {showSlogan && (
                    <text
                      x="3"
                      y="122"
                      fontFamily="'Montserrat', 'Plus Jakarta Sans', sans-serif"
                      fontSize="18.5"
                      fontWeight="400"
                      fill="#2D3748"
                      letterSpacing="0.3"
                    >
                      Kreativitas &amp; Inspirasi Tanpa Batas
                    </text>
                  )}
                </g>
              </svg>
            </div>
          </div>

          {/* CARD 2: SIMBOL FAVICON */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/60 dark:bg-slate-950/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Simbol / Monogram KT
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => downloadSVG("svg-master-icon", "favicon-karya-tazkia.svg")}
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  .SVG
                </button>
                <button
                  onClick={() => downloadPNG("svg-master-icon", "favicon-karya-tazkia.png", 512, 512)}
                  className="text-xs font-bold text-white bg-[#FF7F0A] hover:bg-orange-600 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  .PNG
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col items-center justify-center gap-5 bg-slate-50/40 dark:bg-slate-950/20">
              <div className="flex items-center gap-5">
                {/* Light tile */}
                <div className="w-28 h-28 rounded-3xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center p-3">
                  <svg
                    id="svg-master-icon"
                    className="w-full h-full"
                    viewBox="0 0 155 130"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g transform="translate(2, 2)">
                      <rect x="10" y="10" width="28" height="108" rx="14" fill={orange} />
                      <rect x="54" y="26" width="17" height="78" fill={navy} />
                      <polygon points="67,63 105,26 126,26 80,72" fill={navy} />
                      <polygon points="75,58 128,104 107,104 65,68" fill={navy} />
                      <path d="M 90 26 L 99 26 L 83 42 L 77 42 C 77 32 82 26 90 26 Z" fill={orange} />
                      <path
                        d="M 131 26 L 147 26 C 147 35 141 42 132 42 L 122 42 L 122 92 C 122 99 116 104 106 104 L 106 56 L 131 26 Z"
                        fill={orange}
                      />
                    </g>
                  </svg>
                </div>

                {/* Navy tile */}
                <div
                  className="w-28 h-28 rounded-3xl shadow-md border border-slate-800 flex items-center justify-center p-3"
                  style={{ backgroundColor: navy }}
                >
                  <svg className="w-full h-full" viewBox="0 0 155 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(2, 2)">
                      <rect x="10" y="10" width="28" height="108" rx="14" fill={orange} />
                      <rect x="54" y="26" width="17" height="78" fill="#FFFFFF" />
                      <polygon points="67,63 105,26 126,26 80,72" fill="#FFFFFF" />
                      <polygon points="75,58 128,104 107,104 65,68" fill="#FFFFFF" />
                      <path d="M 90 26 L 99 26 L 83 42 L 77 42 C 77 32 82 26 90 26 Z" fill={orange} />
                      <path
                        d="M 131 26 L 147 26 C 147 35 141 42 132 42 L 122 42 L 122 92 C 122 99 116 104 106 104 L 106 56 L 131 26 Z"
                        fill={orange}
                      />
                    </g>
                  </svg>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center px-2">
                Ikon monogram <strong>Pil + KT</strong> untuk Favicon tab browser, foto profil sosial media, atau watermark.
              </p>
            </div>
          </div>

          {/* CARD 3: VERSI BACKGROUND NAVY DARK */}
          <div className="lg:col-span-8 bg-[#0B1323] rounded-2xl border border-slate-800 shadow-lg overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-800 flex flex-wrap justify-between items-center gap-2 bg-slate-900/70">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  3. Versi Dark Mode / Footer
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadSVG("svg-master-dark", "logo-karya-tazkia-dark.svg")}
                  className="text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  Unduh .SVG
                </button>
                <button
                  onClick={() => downloadPNG("svg-master-dark", "logo-karya-tazkia-dark.png", 1600, 420)}
                  className="text-xs font-bold text-white bg-[#FF7F0A] hover:bg-orange-600 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  Unduh .PNG (HD)
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-12 flex-1 flex items-center justify-center bg-[#070D18] min-h-[240px]">
              <svg
                id="svg-master-dark"
                className="w-full max-w-[680px] h-auto"
                viewBox="0 0 680 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <filter id="dropShadowDark" x="-10%" y="-10%" width="125%" height="125%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.45" />
                  </filter>
                </defs>
                <g filter={showShadow ? "url(#dropShadowDark)" : undefined} transform="translate(15, 16)">
                  <rect x="10" y="10" width="28" height="108" rx="14" fill={orange} />
                  <rect x="54" y="26" width="17" height="78" fill="#FFFFFF" />
                  <polygon points="67,63 105,26 126,26 80,72" fill="#FFFFFF" />
                  <polygon points="75,58 128,104 107,104 65,68" fill="#FFFFFF" />
                  <path d="M 90 26 L 99 26 L 83 42 L 77 42 C 77 32 82 26 90 26 Z" fill={orange} />
                  <path
                    d="M 131 26 L 147 26 C 147 35 141 42 132 42 L 122 42 L 122 92 C 122 99 116 104 106 104 L 106 56 L 131 26 Z"
                    fill={orange}
                  />
                </g>

                <g transform="translate(195, 0)">
                  <g filter={showShadow ? "url(#dropShadowDark)" : undefined}>
                    <text
                      x="0"
                      y={showSlogan ? "92" : "104"}
                      fontFamily="'Montserrat', 'Plus Jakarta Sans', sans-serif"
                      fontSize="60"
                      fontWeight="800"
                      letterSpacing="-1"
                    >
                      <tspan fill="#FFFFFF">Karya</tspan>
                      <tspan fill={orange} dx="4">
                        Tazkia
                      </tspan>
                    </text>
                  </g>
                  {showSlogan && (
                    <text
                      x="3"
                      y="122"
                      fontFamily="'Montserrat', 'Plus Jakarta Sans', sans-serif"
                      fontSize="18.5"
                      fontWeight="400"
                      fill="#CBD5E1"
                      letterSpacing="0.3"
                    >
                      Kreativitas &amp; Inspirasi Tanpa Batas
                    </text>
                  )}
                </g>
              </svg>
            </div>
          </div>

          {/* CARD 4: SPESIFIKASI WARNA RESMI */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                Spesifikasi Warna &amp; Font (Klik Salin)
              </h2>

              <div className="space-y-3">
                {/* Navy Swatch */}
                <div
                  onClick={() => copyText(navy, `Kode warna ${navy} disalin!`)}
                  className="group cursor-pointer flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-400 transition bg-slate-50/60 dark:bg-slate-950/40"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl shadow-inner border border-black/10"
                      style={{ backgroundColor: navy }}
                    />
                    <div>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Tazkia Deep Navy</p>
                      <p className="text-xs text-slate-500 font-mono">{navy}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                    Salin
                  </span>
                </div>

                {/* Orange Swatch */}
                <div
                  onClick={() => copyText(orange, `Kode warna ${orange} disalin!`)}
                  className="group cursor-pointer flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-orange-400 transition bg-orange-50/30 dark:bg-orange-950/20"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl shadow-inner border border-black/10"
                      style={{ backgroundColor: orange }}
                    />
                    <div>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Tazkia Vibrant Orange</p>
                      <p className="text-xs text-slate-500 font-mono">{orange}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 group-hover:text-orange-600 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                    Salin
                  </span>
                </div>

                {/* Slogan Charcoal */}
                <div
                  onClick={() => copyText("#2D3748", "Kode warna slogan (#2D3748) disalin!")}
                  className="group cursor-pointer flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-400 transition bg-slate-50/60 dark:bg-slate-950/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#2D3748] shadow-inner" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Charcoal Slate (Slogan)</p>
                      <p className="text-xs text-slate-500 font-mono">#2D3748</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                    Salin
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                Font Utama: <strong>Montserrat (800)</strong>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                100% Vector SVG
              </span>
            </div>
          </div>
        </div>

        {/* CODE GENERATOR TABS */}
        <div className="bg-[#0F172A] rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 pt-4 border-b border-slate-800 gap-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveTab("html")}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl border-b-2 transition cursor-pointer ${
                  activeTab === "html"
                    ? "border-[#FF7F0A] text-white bg-slate-800/90"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                1. Kode HTML + CSS
              </button>
              <button
                onClick={() => setActiveTab("svg")}
                className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl border-b-2 transition cursor-pointer ${
                  activeTab === "svg"
                    ? "border-[#FF7F0A] text-white bg-slate-800/90"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                2. Kode SVG Utuh
              </button>
              <button
                onClick={() => setActiveTab("tailwind")}
                className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl border-b-2 transition cursor-pointer ${
                  activeTab === "tailwind"
                    ? "border-[#FF7F0A] text-white bg-slate-800/90"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                3. Komponen Tailwind CSS
              </button>
            </div>

            <div className="pb-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getGeneratedCode());
                  toast.success("Kode logo berhasil disalin!");
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="bg-[#FF7F0A] hover:bg-orange-600 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? "Tersalin!" : "Salin Kode Ini"}</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-xs text-slate-400 mb-3">
              💡 <strong>Siap Pakai:</strong> Kode di bawah ini otomatis menyesuaikan warna Navy &amp; Orange yang Anda pilih di atas. Tinggal salin dan tempelkan.
            </p>
            <pre className="bg-slate-950 text-slate-200 p-4 sm:p-5 rounded-xl text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed border border-slate-800/90 max-h-[420px]">
              <code>{getGeneratedCode()}</code>
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}

