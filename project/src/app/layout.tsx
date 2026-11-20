import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TracMotion — Motion Graphics Studio",
  description: "A modern workspace for motion graphics projects.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
