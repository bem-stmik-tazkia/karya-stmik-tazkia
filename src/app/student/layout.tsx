import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mahasiswa",
  description: "Jelajahi profil lengkap dan portofolio karya mahasiswa STMIK Tazkia berdasarkan angkatan dan program studi.",
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
