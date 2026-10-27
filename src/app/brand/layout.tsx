import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio Logo & Identitas Resmi | Karya Tazkia",
  description: "Panduan identitas visual, unduh aset logo vektor SVG, PNG HD transparan, dan kode komponen resmi Karya Tazkia.",
};

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

