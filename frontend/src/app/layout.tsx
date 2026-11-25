// layout.tsx = โครงที่ครอบ "ทุกหน้า" (มี <html> และ <body>)
// ใส่สิ่งที่ทุกหน้าใช้ร่วมกันที่นี่ เช่น เมนู ฟอนต์ CSS กลาง

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Fullstack App",
  description: "Next.js + Express + TypeScript + MySQL",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
