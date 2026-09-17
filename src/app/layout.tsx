import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { E2EEProvider } from "@/components/providers/E2EEProvider";
import { AppLayoutWrapper } from "@/components/layout/AppLayoutWrapper";
import { Toaster } from "react-hot-toast";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://karya.stmik.tazkia.ac.id"),
  title: {
    default: "Karya Tazkia - Galeri Portofolio Mahasiswa STMIK Tazkia",
    template: "%s | Karya Tazkia"
  },
  description: "Galeri digital karya mahasiswa STMIK Tazkia. Temukan inovasi, kreativitas, dan portofolio terbaik mahasiswa.",
  keywords: ["Portofolio Mahasiswa", "STMIK Tazkia", "Karya Mahasiswa", "Tugas Akhir", "Inovasi Digital", "Kampus Bisnis Digital"],
  authors: [{ name: "STMIK Tazkia" }],
  openGraph: {
    title: "Karya Tazkia - Galeri Portofolio Mahasiswa",
    description: "Galeri digital karya mahasiswa STMIK Tazkia. Temukan inovasi, kreativitas, dan portofolio terbaik mahasiswa.",
    url: "https://karya.stmik.tazkia.ac.id",
    siteName: "Karya STMIK Tazkia",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Karya Tazkia - Galeri Portofolio Mahasiswa",
    description: "Galeri digital karya mahasiswa STMIK Tazkia. Temukan inovasi, kreativitas, dan portofolio terbaik mahasiswa.",
  },
  verification: {
    google: "google88a80d49b5d89521",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${lexend.variable} font-sans antialiased max-w-full overflow-x-clip`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground flex flex-col max-w-full overflow-x-clip relative" suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster 
              position="top-center" 
              toastOptions={{ 
                style: { 
                  background: 'var(--card)', 
                  color: 'var(--foreground)', 
                  border: '2px solid var(--border)', 
                  borderRadius: '1rem', 
                  fontWeight: 'bold',
                  maxWidth: '420px',
                  width: '100%',
                } 
              }} 
            />
            <E2EEProvider>
              <AppLayoutWrapper>
                {children}
              </AppLayoutWrapper>
            </E2EEProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
