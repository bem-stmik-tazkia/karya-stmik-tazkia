import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medsos Kampus",
  description: "Tempatnya mahasiswa STMIK Tazkia berbagi ide, karya, pembaruan, dan kolaborasi dalam komunitas digital yang aktif.",
};

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
