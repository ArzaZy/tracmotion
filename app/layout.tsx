import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "TracMotion — Motion Graphics Studio",
  description: "Ruang kerja modern untuk project motion graphics.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0b10",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={inter.className}>
      <body>
        <div className="app">
          <Sidebar />
          <div className="main">
            <Header />
            <main className="content">{children}</main>
          </div>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
