import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phước Danh · n8n Console",
  description:
    "Console thao tác gắn n8n — copy URL, kiểm JSON/ảnh KQXS trước khi đăng Fanpage",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,650&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
