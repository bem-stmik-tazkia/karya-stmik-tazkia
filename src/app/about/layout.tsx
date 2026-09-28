import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Pelajari lebih lanjut tentang Karya Tazkia, platform portofolio digital resmi mahasiswa STMIK Tazkia tempat inovasi, kreativitas, dan proyek terbaik ditampilkan.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
