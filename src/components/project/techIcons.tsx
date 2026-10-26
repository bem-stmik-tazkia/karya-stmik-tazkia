"use client";

import React, { useState } from "react";
import { BookOpen, Play, Image as ImageIcon, Globe, Code } from "lucide-react";

export function getTechIconUrl(tech: string): string | null {
  const lower = tech.toLowerCase().trim();

  // Simple Icons
  const simpleIconsMap: Record<string, string | null> = {
    "google scholar": "googlescholar",
    "google sheets": "googlesheets",
    "google forms": "googleforms",
    "google docs": "googledocs",
    "google drive": "googledrive",
    "google slides": "googleslides",
    "microsoft word": "microsoftword",
    "excel": "microsoftexcel",
    "microsoft excel": "microsoftexcel",
    "powerpoint": "microsoftpowerpoint",
    "microsoft powerpoint": "microsoftpowerpoint",
    "notion": "notion",
    "trello": "trello",
    "slack": "slack",
    "discord": "discord",
    "postman": "postman",
    "vercel": "vercel",
    "netlify": "netlify",
    "aws": "amazonaws",
    "gcp": "googlecloud",
    "google cloud": "googlecloud",
    "azure": "microsoftazure",
    "vscode": "visualstudiocode",
    "jetbrains": "jetbrains",
    "xcode": "xcode",
    "android studio": "androidstudio",
    "canva": "canva",
    "spss": "ibm",
    "mendeley": "mendeley",
    "zotero": "zotero",
    "overleaf": "overleaf",
    "latex": "latex",
    "quipper": "quipper",
    "zoom": "zoom",
    "kuantitatif": null,
  };

  // Devicon
  const deviconMap: Record<string, string> = {
    "react": "react",
    "next.js": "nextjs",
    "nextjs": "nextjs",
    "vue": "vuejs",
    "vue.js": "vuejs",
    "angular": "angular",
    "typescript": "typescript",
    "javascript": "javascript",
    "python": "python",
    "java": "java",
    "kotlin": "kotlin",
    "swift": "swift",
    "dart": "dart",
    "flutter": "flutter",
    "node.js": "nodejs",
    "nodejs": "nodejs",
    "express": "express",
    "laravel": "laravel",
    "php": "php",
    "django": "django",
    "flask": "flask",
    "fastapi": "fastapi",
    "mysql": "mysql",
    "postgresql": "postgresql",
    "mongodb": "mongodb",
    "firebase": "firebase",
    "supabase": "supabase",
    "redis": "redis",
    "docker": "docker",
    "kubernetes": "kubernetes",
    "git": "git",
    "github": "github",
    "figma": "figma",
    "tailwind": "tailwindcss",
    "tailwindcss": "tailwindcss",
    "css": "css3",
    "html": "html5",
    "sass": "sass",
    "tensorflow": "tensorflow",
    "pytorch": "pytorch",
    "arduino": "arduino",
    "raspberry pi": "raspberrypi",
    "unity": "unity",
    "blender": "blender",
    "photoshop": "photoshop",
    "illustrator": "illustrator",
    "after effects": "aftereffects",
  };

  for (const [key, slug] of Object.entries(simpleIconsMap)) {
    if (lower.includes(key)) {
      return slug ? `https://cdn.simpleicons.org/${slug}` : null;
    }
  }

  for (const [key, iconName] of Object.entries(deviconMap)) {
    if (lower.includes(key)) {
      return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${iconName}/${iconName}-original.svg`;
    }
  }
  return null;
}

export function getLinkLabel(category: string | undefined): { label: string; icon: React.ReactNode } {
  switch (category) {
    case "Research":
      return { label: "Baca Jurnal / Paper", icon: <BookOpen className="w-4 h-4" /> };
    case "IoT":
      return { label: "Tonton Demo Video", icon: <Play className="w-4 h-4" /> };
    case "Multimedia":
      return { label: "Lihat Berkas Karya", icon: <ImageIcon className="w-4 h-4" /> };
    case "Technology":
    case "Programming":
    default:
      return { label: "Lihat Live Demo", icon: <Globe className="w-4 h-4" /> };
  }
}

const SIMPLE_ICONS_MONOCHROME = new Set([
  "googlescholar",
  "mendeley",
  "zotero",
  "overleaf",
  "latex",
  "androidstudio",
  "xcode",
  "ibm",
]);

export function TechIcon({
  url,
  tech,
  isSimple,
}: {
  url: string;
  tech: string;
  isSimple: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Code className="w-4 h-4 text-primary shrink-0" />;
  const isMonochrome =
    isSimple &&
    SIMPLE_ICONS_MONOCHROME.has(
      url.replace("https://cdn.simpleicons.org/", "").split("/")[0]
    );
  return (
    <img
      src={url}
      alt={tech}
      className={`w-5 h-5 object-contain shrink-0 ${isMonochrome ? "dark:invert" : ""}`}
      onError={() => setFailed(true)}
    />
  );
}

