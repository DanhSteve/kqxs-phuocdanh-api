import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phước Danh · Bảng điều khiển đăng bài",
  description:
    "Sao chép đường dẫn, kiểm tra kết quả và ảnh bảng trước khi n8n đăng Fanpage",
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
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800;900&family=Fraunces:opsz,wght@9..144,600;9..144,650&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
