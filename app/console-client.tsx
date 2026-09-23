"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Station = {
  name: string;
  code: string;
  gdb: string;
  g1?: string;
  g8?: string;
};

type TodayPayload = {
  date?: string;
  dateIso?: string;
  completed?: boolean;
  station_count?: number;
  stations?: Station[];
  caption?: string;
  imageUrl?: string;
  error?: string;
};

const DEMO_DATE = "2026-09-19";
const HANDOFF_URL =
  "https://github.com/DanhSteve/kqxs-phuocdanh-api/blob/master/HANDOFF_N8N.md";

function toast(msg: string) {
  const el = document.querySelector(".toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("is-on");
  window.setTimeout(() => el.classList.remove("is-on"), 1400);
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Đã sao chép");
  } catch {
    toast("Không sao chép được — hãy chọn rồi Ctrl+C");
  }
}

export default function N8nConsole() {
  const [origin, setOrigin] = useState("https://kqxs-phuocdanh-api.vercel.app");
  const [dateIso, setDateIso] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TodayPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const todayUrl = useMemo(() => {
    const q = dateIso ? `?date=${dateIso}` : "";
    return `${origin}/api/kqxs/today${q}`;
  }, [origin, dateIso]);

  const imageUrl = useMemo(() => {
    if (data?.imageUrl) return data.imageUrl;
    const q = dateIso ? `?date=${dateIso}` : "";
    return `${origin}/api/kqxs/image${q}`;
  }, [origin, dateIso, data]);

  const liveUrl = `${origin}/api/kqxs/today`;
  const demoUrl = `${origin}/api/kqxs/today?date=${DEMO_DATE}`;
  const demoImageUrl = `${origin}/api/kqxs/image?date=${DEMO_DATE}`;

  const load = useCallback(async (iso?: string) => {
    setLoading(true);
    setError(null);
    try {
      const q = iso ? `?date=${iso}` : "";
      const res = await fetch(`/api/kqxs/today${q}`, { cache: "no-store" });
      const json = (await res.json()) as TodayPayload;
      if (!res.ok) throw new Error(json.error || `Lỗi máy chủ ${res.status}`);
      setData(json);
      if (json.dateIso) setDateIso(json.dateIso);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const badge = error
    ? { cls: "badge badge--err", text: "Lỗi kết nối" }
    : loading
      ? { cls: "badge badge--wait", text: "Đang tải…" }
      : data?.completed
        ? { cls: "badge badge--ok", text: "Đủ giải đặc biệt — có thể đăng" }
        : { cls: "badge badge--wait", text: "Chưa đủ giải đặc biệt" };

  return (
    <div className="shell">
      <header className="top">
        <div className="brand">
          <h1 className="brand__name">
            Phước <span>Danh</span> · Bảng điều khiển đăng bài
          </h1>
          <p className="brand__sub">
            Dùng để gắn vào n8n: sao chép đường dẫn, kiểm tra kết quả và ảnh trước khi đăng Fanpage.
          </p>
        </div>
        <div className="ext-links">
          <a className="btn btn--ghost btn--sm" href="https://vesophuocdanh.vn" target="_blank" rel="noopener">
            Trang web
          </a>
          <a className="btn btn--ghost btn--sm" href={HANDOFF_URL} target="_blank" rel="noopener">
            Hướng dẫn team
          </a>
        </div>
      </header>

      <section className="panel">
        <h2 className="panel__title">1. Đường dẫn lấy kết quả (dán vào n8n)</h2>
        <p className="panel__hint">
          Thay đường dẫn cũ bị lỗi bằng đường dẫn chính thức. Khi thử đăng demo, dùng ngày đã có đủ giải đặc biệt.
        </p>

        <div className="row">
          <div className="field">
            <div className="field__label">Đường dẫn chính (dùng khi chạy thật)</div>
            <div className="field__bar">
              <div className="url-box url">{liveUrl}</div>
              <button type="button" className="btn btn--gold btn--sm" onClick={() => copyText(liveUrl)}>
                Sao chép
              </button>
            </div>
          </div>

          <div className="field">
            <div className="field__label">Đường dẫn thử nghiệm</div>
            <div className="field__bar">
              <div className="url-box url">{demoUrl}</div>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => copyText(demoUrl)}>
                Sao chép
              </button>
            </div>
          </div>

          <div className="field">
            <div className="field__label">Ảnh thử nghiệm (khi cần dán tay)</div>
            <div className="field__bar">
              <div className="url-box url">{demoImageUrl}</div>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => copyText(demoImageUrl)}>
                Sao chép
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__title">2. Kiểm tra trước khi đăng</h2>
        <p className="panel__hint">
          n8n chỉ đăng khi trường <code>completed</code> = đúng (đã đủ giải đặc biệt). Nội dung bài nằm ở{" "}
          <code>caption</code>, đường dẫn ảnh ở <code>imageUrl</code>.
        </p>

        <div className="status-line">
          <span className={badge.cls}>{badge.text}</span>
          <span className="meta">
            {data
              ? `${data.date || "—"} · ${data.station_count ?? 0} đài`
              : error || "Chưa có dữ liệu"}
          </span>
          <div className="field__bar" style={{ maxWidth: 280 }}>
            <input
              type="date"
              value={dateIso}
              onChange={(e) => setDateIso(e.target.value)}
              aria-label="Chọn ngày"
            />
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={loading}
              onClick={() => load(dateIso || undefined)}
            >
              Tải lại
            </button>
          </div>
        </div>

        {!loading && data && !data.completed && !error ? (
          <p className="panel__hint" style={{ marginTop: 8, color: "#fbbf24" }}>
            Hôm nay chưa có đủ số nên ảnh chỉ hiện dấu —. Bấm{" "}
            <strong>Mẫu ngày 19/09/2026</strong> để xem form đầy đủ số (kiểm in đậm / bố cục).
          </p>
        ) : null}

        <div className="actions">
          <button type="button" className="btn btn--gold btn--sm" disabled={loading} onClick={() => load()}>
            Kết quả hôm nay
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={loading}
            onClick={() => {
              setDateIso(DEMO_DATE);
              void load(DEMO_DATE);
            }}
          >
            Mẫu ngày 19/09/2026
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={!data?.caption}
            onClick={() => data?.caption && copyText(data.caption)}
          >
            Sao chép nội dung bài
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={!imageUrl}
            onClick={() => copyText(imageUrl)}
          >
            Sao chép đường dẫn ảnh
          </button>
          <a className="btn btn--ghost btn--sm" href={todayUrl} target="_blank" rel="noopener">
            Xem dữ liệu
          </a>
          <a className="btn btn--ghost btn--sm" href={imageUrl} target="_blank" rel="noopener">
            Xem ảnh bảng
          </a>
        </div>

        <div className="preview" style={{ marginTop: "1rem" }}>
          <div className="preview__box">
            <div className="field__label" style={{ marginBottom: 8 }}>
              Dữ liệu rút gọn
            </div>
            <pre>
              {error
                ? error
                : data
                  ? JSON.stringify(
                      {
                        date: data.date,
                        dateIso: data.dateIso,
                        completed: data.completed,
                        station_count: data.station_count,
                        stations: (data.stations || []).map((s) => ({
                          name: s.name,
                          code: s.code,
                          gdb: s.gdb,
                          g1: s.g1,
                          g8: s.g8,
                        })),
                        imageUrl: data.imageUrl,
                        caption: data.caption
                          ? `${data.caption.slice(0, 120)}…`
                          : undefined,
                      },
                      null,
                      2
                    )
                  : "Đang tải…"}
            </pre>
          </div>
          <div className="preview__box">
            <div className="field__label" style={{ marginBottom: 8 }}>
              Ảnh bảng đăng Fanpage
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={imageUrl} src={imageUrl} alt="Bảng kết quả xổ số miền Nam" />
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__title">3. Việc team n8n cần làm</h2>
        <ol className="steps">
          <li>
            Ô lấy dữ liệu: dán <strong>đường dẫn chính</strong> ở mục 1
          </li>
          <li>
            Chỉ đăng khi đã đủ giải đặc biệt: <code>if (!data.completed) return [];</code>
          </li>
          <li>
            Đăng ảnh lên Fanpage: dùng đường dẫn ảnh (<code>imageUrl</code>) và nội dung bài (
            <code>caption</code>)
          </li>
          <li>
            Thử với đường dẫn thử nghiệm → chạy 1 lần → kiểm Fanpage → bật lịch 16:15–16:35
          </li>
        </ol>
        <div className="actions">
          <a className="btn btn--gold" href={HANDOFF_URL} target="_blank" rel="noopener">
            Đọc hướng dẫn đầy đủ
          </a>
        </div>
      </section>

      <footer className="foot">
        Điện thoại: 091.949.4566 – 0987.494.565 ·{" "}
        <a href="https://vesophuocdanh.vn" target="_blank" rel="noopener">
          vesophuocdanh.vn
        </a>
        {" · "}
        Kho mã{" "}
        <a
          href="https://github.com/DanhSteve/kqxs-phuocdanh-api"
          target="_blank"
          rel="noopener"
        >
          DanhSteve/kqxs-phuocdanh-api
        </a>
      </footer>

      <div className="toast" role="status" />
    </div>
  );
}
