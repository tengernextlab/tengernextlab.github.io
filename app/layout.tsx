import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TengerNextLab — Вэб сайт, апп, бизнесийн систем",
  description:
    "Вэб сайт, гар утасны апп, цаг бүртгэл, агуулах, хүний нөөцийн систем, мэдээллийн шинжилгээ. Баян-Өлгий, Улаанбаатарын бизнесүүдэд ойлгомжтой шийдэл.",
  openGraph: {
    title: "TengerNextLab — Вэб сайт, апп, бизнесийн систем",
    description: "Бизнесийн тань өдөр тутмын ажлыг программаар хялбар болгоно. Баян-Өлгий, Улаанбаатар.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
