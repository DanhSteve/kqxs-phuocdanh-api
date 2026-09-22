export default function HomePage() {
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 720,
        margin: "40px auto",
        padding: "0 20px",
        lineHeight: 1.5,
      }}
    >
      <h1>KQXS Phước Danh API</h1>
      <p>
        API ổn định cho n8n tự động đăng Fanpage. Nguồn:{" "}
        <code>vesophuocdanh.vn/api/xsmn/live</code>
      </p>
      <ul>
        <li>
          <a href="/api/health">/api/health</a>
        </li>
        <li>
          <a href="/api/kqxs/today">/api/kqxs/today</a>
        </li>
        <li>
          <a href="/api/kqxs/today?date=2026-09-19">
            /api/kqxs/today?date=2026-09-19
          </a>
        </li>
        <li>
          <a href="/api/kqxs/image?date=2026-09-19">
            /api/kqxs/image?date=2026-09-19
          </a>
        </li>
      </ul>
      <p>
        Hotline: 091.949.4566 – 0987.494.565 ·{" "}
        <a href="https://vesophuocdanh.vn">vesophuocdanh.vn</a>
      </p>
    </main>
  );
}
