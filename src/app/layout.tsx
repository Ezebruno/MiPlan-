import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SWRegister from "@/components/SWRegister";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MiPlan - Nutrición Inteligente",
  description: "Planificá tu alimentación diaria con tracking de macros, comidas y progreso personal.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MiPlan",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4F8F68",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('miplan-theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`,
          }}
        />
        <SWRegister />
        <div id="mobile-wrapper">
          <ThemeToggle />
          {children}
        </div>
      </body>
    </html>
  );
}
