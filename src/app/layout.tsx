import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AppLayoutWrapper } from "@/components/layout/AppLayoutWrapper";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Karya Tazkia - Galeri Portofolio Mahasiswa STMIK Tazkia",
  description: "Galeri digital karya mahasiswa STMIK Tazkia. Temukan inovasi, kreativitas, dan portofolio terbaik mahasiswa.",
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
            <AppLayoutWrapper>
              {children}
            </AppLayoutWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
