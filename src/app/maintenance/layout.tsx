import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sedang Dalam Pemeliharaan | Karya Tazkia",
  description: "Situs Karya Tazkia sedang dalam pemeliharaan. Kami akan segera kembali.",
  robots: "noindex, nofollow",
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Standalone layout - no navbar/footer during maintenance
  return <>{children}</>;
}
