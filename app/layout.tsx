export const metadata = {
  title: "KQXS Phước Danh API",
  description: "API KQXS miền Nam cho n8n → Fanpage Phước Danh",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, background: "#fafafa", color: "#111" }}>
        {children}
      </body>
    </html>
  );
}
