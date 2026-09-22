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
    toast("Đã copy");
  } catch {
    toast("Copy thất bại — chọn và Ctrl+C");
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
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setData(json);
      if (json.dateIso) setDateIso(json.dateIso);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Lỗi tải API");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const badge = error
    ? { cls: "badge badge--err", text: "Lỗi API" }
    : loading
      ? { cls: "badge badge--wait", text: "Đang tải…" }
      : data?.completed
        ? { cls: "badge badge--ok", text: "Đủ GĐB — có thể đăng" }
        : { cls: "badge badge--wait", text: "Chưa đủ GĐB" };

  return (
    <div className="shell">
      <header className="top">
        <div className="brand">
          <h1 className="brand__name">
            Phước <span>Danh</span> · n8n Console
          </h1>
          <p className="brand__sub">
            Chỉ thao tác gắn workflow — copy URL, kiểm JSON/ảnh, xem trạng thái đăng.
          </p>
        </div>
        <div className="ext-links">
          <a className="btn btn--ghost btn--sm" href="https://vesophuocdanh.vn" target="_blank" rel="noopener">
            Website
          </a>
          <a className="btn btn--ghost btn--sm" href={HANDOFF_URL} target="_blank" rel="noopener">
            HANDOFF_N8N.md
          </a>
        </div>
      </header>

      <section className="panel">
        <h2 className="panel__title">1. URL cho node Fetch</h2>
        <p className="panel__hint">
          Thay URL 404 cũ bằng URL Production. Test demo dùng ngày đã có đủ giải ĐB.
        </p>

        <div className="row">
          <div className="field">
            <div className="field__label">Production (Active sau khi test)</div>
            <div className="field__bar">
              <div className="url-box url">{liveUrl}</div>
              <button type="button" className="btn btn--gold btn--sm" onClick={() => copyText(liveUrl)}>
                Copy
              </button>
            </div>
          </div>

          <div className="field">
            <div className="field__label">Test demo</div>
            <div className="field__bar">
              <div className="url-box url">{demoUrl}</div>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => copyText(demoUrl)}>
                Copy
              </button>
            </div>
          </div>

          <div className="field">
            <div className="field__label">Ảnh demo (nếu cần dán tay)</div>
            <div className="field__bar">
              <div className="url-box url">{demoImageUrl}</div>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => copyText(demoImageUrl)}>
                Copy
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__title">2. Kiểm tra trước khi đăng</h2>
        <p className="panel__hint">
          n8n chỉ đăng khi <code>completed === true</code>. Dùng caption + imageUrl từ JSON.
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
              Tải
            </button>
          </div>
        </div>

        <div className="actions">
          <button type="button" className="btn btn--gold btn--sm" disabled={loading} onClick={() => load()}>
            Live hôm nay
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
            Mẫu {DEMO_DATE}
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={!data?.caption}
            onClick={() => data?.caption && copyText(data.caption)}
          >
            Copy caption
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={!imageUrl}
            onClick={() => copyText(imageUrl)}
          >
            Copy imageUrl
          </button>
          <a className="btn btn--ghost btn--sm" href={todayUrl} target="_blank" rel="noopener">
            Mở JSON
          </a>
          <a className="btn btn--ghost btn--sm" href={imageUrl} target="_blank" rel="noopener">
            Mở ảnh
          </a>
        </div>

        <div className="preview" style={{ marginTop: "1rem" }}>
          <div className="preview__box">
            <div className="field__label" style={{ marginBottom: 8 }}>
              JSON rút gọn
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
              Ảnh bảng Fanpage
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={imageUrl} src={imageUrl} alt="Bảng KQXS XSMN" />
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__title">3. Checklist n8n</h2>
        <ol className="steps">
          <li>
            Fetch = <strong>Production URL</strong> (mục 1)
          </li>
          <li>
            Code: <code>if (!data.completed) return [];</code>
          </li>
          <li>
            Facebook <code>/photos</code>: <code>url=imageUrl</code>, <code>caption=caption</code>
          </li>
          <li>
            Test bằng URL demo → Execute → kiểm Fanpage → Active cron 16:15–16:35
          </li>
        </ol>
        <div className="actions">
          <a className="btn btn--gold" href={HANDOFF_URL} target="_blank" rel="noopener">
            Mở hướng dẫn đầy đủ
          </a>
        </div>
      </section>

      <footer className="foot">
        Hotline 091.949.4566 – 0987.494.565 ·{" "}
        <a href="https://vesophuocdanh.vn" target="_blank" rel="noopener">
          vesophuocdanh.vn
        </a>
        {" · "}
        Repo{" "}
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
