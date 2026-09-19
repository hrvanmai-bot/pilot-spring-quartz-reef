import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HUY HOÀNG BUILD — Quản lý công trình",
  description: "Hệ thống quản lý công trình thông minh | HUY HOÀNG XÂY DỰNG • ĐẦU TƯ • THƯƠNG MẠI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
