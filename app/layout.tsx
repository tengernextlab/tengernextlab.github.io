import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TengerNextLab — Технологийн лаборатори",
  description:
    "Вэб, мобайл аппликейшн, хиймэл оюун ухаанд суурилсан шийдлүүдийг хөгжүүлдэг технологийн компани.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
