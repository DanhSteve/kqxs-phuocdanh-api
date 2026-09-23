"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Station = {
  name: string;
  code: string;
  gdb: string;
  g1: string;
  g2: string;
  g3: string[];
  g4: string[];
  g5: string;
  g6: string[];
  g7: string;
  g8: string;
};

type Payload = {
  date?: string;
  dateIso?: string;
  completed?: boolean;
  stage?: string;
  stations?: Station[];
};

const ROWS: {
  key: keyof Station;
  label: string;
  meta: string;
  red?: boolean;
  jackpot?: boolean;
}[] = [
  { key: "g8", label: "G.8", meta: "100N (2 số)", red: true },
  { key: "g7", label: "G.7", meta: "200N (3 số)" },
  { key: "g6", label: "G.6", meta: "400N (4 số)" },
  { key: "g5", label: "G.5", meta: "1TR (4 số)" },
  { key: "g4", label: "G.4", meta: "3TR (5 số)" },
  { key: "g3", label: "G.3", meta: "10TR (5 số)" },
  { key: "g2", label: "G.2", meta: "15TR (5 số)" },
  { key: "g1", label: "G.1", meta: "30TR (5 số)" },
  { key: "gdb", label: "ĐB", meta: "2 TỶ (6 số)", red: true, jackpot: true },
];

function shortName(name: string): string {
  const n = (name || "").toUpperCase();
  const map: Record<string, string> = {
    "ĐỒNG NAI": "Đ.NAI",
    "CẦN THƠ": "CẦN THƠ",
    "SÓC TRĂNG": "S.TRĂNG",
    "BẾN TRE": "BẾN TRE",
    "VŨNG TÀU": "V.TÀU",
    "BẠC LIÊU": "B.LIÊU",
    "TP. HỒ CHÍ MINH": "TP.HCM",
    "HỒ CHÍ MINH": "TP.HCM",
  };
  return map[n] || n.slice(0, 10);
}

/** Trạng thái hiện từng chữ số theo ô */
type RevealMap = Record<string, { target: string; epoch: number; shown: number }>;

function cellKey(si: number, rowKey: string, multiIdx?: number) {
  return multiIdx === undefined ? `${si}:${rowKey}` : `${si}:${rowKey}:${multiIdx}`;
}

function Spin() {
  return <span className="live-spin" aria-hidden />;
}

function DigitCell({
  target,
  shown,
  red,
}: {
  target: string;
  shown: number;
  red?: boolean;
}) {
  if (!target) {
    return (
      <span className={`live-num ${red ? "is-red" : ""}`}>
        <Spin />
      </span>
    );
  }
  const chars = target.split("");
  return (
    <span className={`live-num ${red ? "is-red" : ""}`}>
      {chars.map((ch, i) =>
        i < shown ? (
          <span key={i} className="live-digit">
            {ch}
          </span>
        ) : (
          <Spin key={i} />
        )
      )}
    </span>
  );
}

export default function LiveBoardClient() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const revealRef = useRef<RevealMap>({});
  const [, bump] = useState(0);

  const syncReveal = useCallback((stations: Station[]) => {
    const map = revealRef.current;
    const now = Date.now();
    stations.forEach((s, si) => {
      ROWS.forEach((row) => {
        const raw = s[row.key];
        if (Array.isArray(raw)) {
          const arr = raw.length ? raw : [""];
          arr.forEach((val, mi) => {
            const k = cellKey(si, row.key, mi);
            const target = String(val || "");
            const prev = map[k];
            if (!prev || prev.target !== target) {
              map[k] = { target, epoch: now, shown: target ? 1 : 0 };
            }
          });
        } else {
          const k = cellKey(si, row.key);
          const target = String(raw || "");
          const prev = map[k];
          if (!prev || prev.target !== target) {
            map[k] = { target, epoch: now, shown: target ? 1 : 0 };
          }
        }
      });
    });
  }, []);

  // Tiến trình hiện từng chữ số mỗi 350ms
  useEffect(() => {
    const id = window.setInterval(() => {
      const map = revealRef.current;
      let changed = false;
      Object.values(map).forEach((r) => {
        if (!r.target) return;
        if (r.shown < r.target.length) {
          r.shown += 1;
          changed = true;
        }
      });
      if (changed) bump((x) => x + 1);
    }, 350);
    return () => window.clearInterval(id);
  }, []);

  // Poll API gần realtime
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/kqxs/today", { cache: "no-store" });
        const json = (await res.json()) as Payload;
        if (!alive) return;
        if (!res.ok) throw new Error((json as { error?: string }).error || "Lỗi");
        setData(json);
        setError(null);
        if (json.stations) syncReveal(json.stations);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Không tải được");
      }
    };
    void load();
    const id = window.setInterval(load, 1500);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [syncReveal]);

  const stations = data?.stations || [];
  const map = revealRef.current;

  const getReveal = (si: number, rowKey: string, multiIdx?: number) => {
    const k = cellKey(si, rowKey, multiIdx);
    return map[k] || { target: "", epoch: 0, shown: 0 };
  };

  return (
    <div className="live-shell">
      <header className="live-head">
        <h1>ĐẠI LÝ VÉ SỐ PHƯỚC DANH</h1>
        <p className="live-addr">137 LÊ LỢI, P. TRÀ VINH — VĨNH LONG</p>
        <p className="live-region">XỔ SỐ MIỀN NAM · LIVE</p>
      </header>

      <div className="live-bar">
        <div className="live-date">
          <strong>{(data?.date || "—").slice(0, 5)}</strong>
          <span>{(data?.date || "").slice(6) || "2026"}</span>
        </div>
        <div className="live-hotline">
          ĐỔI SỐ TRÚNG ĐẶC BIỆT TẬN NƠI{" "}
          <em>0919.494.566</em>
        </div>
      </div>

      <div className="live-status">
        {error
          ? `Lỗi: ${error}`
          : data?.completed
            ? "✅ Đã đủ giải đặc biệt"
            : data?.stage === "live"
              ? "🔴 Đang xổ trực tiếp — số mới hiện từng chữ"
              : "⏳ Chuẩn bị xổ — ô trống đang quay"}
      </div>

      <div className="live-table-wrap">
        <table className="live-table">
          <thead>
            <tr>
              <th className="col-giai">GIẢI</th>
              {stations.map((s) => (
                <th key={s.code || s.name}>
                  <div>{shortName(s.name)}</div>
                  <small>{s.code}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.key} className={row.jackpot ? "is-jackpot" : ""}>
                <td className={`col-giai ${row.jackpot ? "is-jackpot-label" : ""}`}>
                  <strong>{row.label}</strong>
                  <small>{row.meta}</small>
                </td>
                {stations.map((s, si) => {
                  const raw = s[row.key];
                  if (Array.isArray(raw)) {
                    const list = raw.length ? raw : [""];
                    return (
                      <td key={s.code} className={row.jackpot ? "is-jackpot" : ""}>
                        <div className="live-stack">
                          {list.map((_, mi) => {
                            const r = getReveal(si, row.key, mi);
                            return (
                              <DigitCell
                                key={mi}
                                target={r.target}
                                shown={r.shown}
                                red={row.red}
                              />
                            );
                          })}
                        </div>
                      </td>
                    );
                  }
                  const r = getReveal(si, row.key);
                  return (
                    <td key={s.code} className={row.jackpot ? "is-jackpot" : ""}>
                      <DigitCell target={r.target} shown={r.shown} red={row.red} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="live-foot">
        Xem Trực Tiếp và In Vé Dò tại vesophuocdanh.vn
      </footer>
    </div>
  );
}
