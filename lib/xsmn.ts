/**
 * Proxy + chuẩn hóa KQXS miền Nam từ vesophuocdanh.vn/api/xsmn/live
 * Contract ổn định cho n8n → Fanpage Phước Danh
 */

import { spinFrame } from "./live-reveal";

export const SOURCE_API = "https://vesophuocdanh.vn/api/xsmn/live";
export const HOTLINE = "091.949.4566 - 0987.494.565";
export const WEBSITE = "https://vesophuocdanh.vn";
export const ADDRESSES = [
  "137 Lê Lợi, P. Trà Vinh, Vĩnh Long",
  "09-11 Điện Biên Phủ, P. Trà Vinh, Vĩnh Long",
  "66B Minh Phụng, Phường 2, Quận 6, TP.HCM",
];

export type Station = {
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

export type KqxsPayload = {
  date: string;
  dateIso: string;
  completed: boolean;
  /** waiting = chưa số | live = đang sổ | completed = đủ ĐB */
  stage: "waiting" | "live" | "completed";
  /** Chuỗi đổi khi có số mới — n8n dùng để biết có cần cập nhật Fanpage không */
  progressKey: string;
  station_count: number;
  stations: Station[];
  caption: string;
  /**
   * Caption gắn bài Live Video sau khi tắt live (giữ VOD).
   * Giữ nội dung thương hiệu — không dòng giải ĐB, không bảng live sổ.
   */
  captionAfterLive: string;
  /** Caption dạng bảng chữ cập nhật dần khi đang live */
  liveCaption: string;
  /** Trang HTML vòng quay CSS thật + hiện từng chữ số */
  liveBoardUrl?: string;
  imageUrl: string;
  source: string;
  serverTime?: string;
};

type RawPrize = {
  dacBiet?: string;
  nhat?: string;
  nhi?: string;
  ba?: string[];
  tu?: string[];
  nam?: string;
  sau?: string[];
  bay?: string;
  tam?: string;
};

type RawStation = {
  stationName?: string;
  ticketCode?: string;
  prizes?: RawPrize;
};

function onlyDigits(v: unknown): string {
  return String(v ?? "").replace(/\D/g, "");
}

function onlyDigitsList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(onlyDigits).filter(Boolean);
  if (typeof v === "string" && v.trim()) return (v.match(/\d+/g) || []);
  return [];
}

export function isoToVn(iso: string): string {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${now.getFullYear()}`;
  }
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function shortStationName(name: string): string {
  const n = (name || "").toUpperCase().replace(/\s+/g, " ").trim();
  const map: Record<string, string> = {
    "TP. HỒ CHÍ MINH": "TP.HCM",
    "HỒ CHÍ MINH": "TP.HCM",
    "LONG AN": "L.AN",
    "BÌNH PHƯỚC": "B.PHƯỚC",
    "HẬU GIANG": "H.GIANG",
    "TIỀN GIANG": "T.GIANG",
    "KIÊN GIANG": "K.GIANG",
    "ĐÀ LẠT": "Đ.LẠT",
    "TÂY NINH": "T.NINH",
    "AN GIANG": "A.GIANG",
    "BÌNH THUẬN": "B.THUẬN",
    "BẾN TRE": "BẾN TRE",
    "VŨNG TÀU": "V.TÀU",
    "BÀ RỊA - VŨNG TÀU": "V.TÀU",
    "BÀ RỊA VŨNG TÀU": "V.TÀU",
    "BẠC LIÊU": "B.LIÊU",
    "ĐỒNG THÁP": "Đ.THÁP",
    "CÀ MAU": "CÀ MAU",
    "SÓC TRĂNG": "S.TRĂNG",
    "TRÀ VINH": "T.VINH",
    "CẦN THƠ": "CẦN THƠ",
    "ĐỒNG NAI": "Đ.NAI",
    "BÌNH DƯƠNG": "B.DƯƠNG",
  };
  return map[n] || n.slice(0, 10);
}

function mapStation(item: RawStation): Station {
  const p = item.prizes || {};
  return {
    name: String(item.stationName || "").toUpperCase(),
    code: String(item.ticketCode || "").toUpperCase(),
    gdb: onlyDigits(p.dacBiet),
    g1: onlyDigits(p.nhat),
    g2: onlyDigits(p.nhi),
    g3: onlyDigitsList(p.ba),
    g4: onlyDigitsList(p.tu),
    g5: onlyDigits(p.nam),
    g6: onlyDigitsList(p.sau),
    g7: onlyDigits(p.bay),
    g8: onlyDigits(p.tam),
  };
}

export function buildCaption(date: string, stations: Station[]): string {
  const gdbLine = stations
    .map((s) => `${shortStationName(s.name)} ${s.gdb || "—"}`)
    .join(" · ");
  return [
    `🔴 [CHÍNH THỨC] KQXS MIỀN NAM ${date} 🔴`,
    `⭐ Đại lý vé số PHƯỚC DANH`,
    `🏆 Giải ĐB: ${gdbLine}`,
    `☎️ Hotline: ${HOTLINE}`,
    `📍 ${ADDRESSES.join(" | ")}`,
    `🌐 ${WEBSITE}`,
  ].join("\n");
}

/**
 * Nội dung bài viết gắn video Live đã quay (sau khi sổ xong).
 * Theo góp ý: giữ nội dung — bỏ dòng giải ĐB + bỏ phần live sổ (số nằm trong video).
 */
export function buildCaptionAfterLive(date: string): string {
  return [
    `🔴 [CHÍNH THỨC] KQXS MIỀN NAM ${date} 🔴`,
    `⭐ Đại lý vé số PHƯỚC DANH`,
    `▶️ Xem lại video xổ trực tiếp bên trên`,
    `☎️ Hotline: ${HOTLINE}`,
    `📍 ${ADDRESSES.join(" | ")}`,
    `🌐 ${WEBSITE}`,
  ].join("\n");
}

/** Ô trống — khung spinner đổi theo thời gian (cập nhật mỗi lần n8n poll) */
function liveCell(value: string, nowMs: number): string {
  const v = String(value || "").trim();
  return v || spinFrame(nowMs);
}

function liveMulti(values: string[], nowMs: number): string {
  if (!values.length) return spinFrame(nowMs);
  return values.map((v) => (v ? v : spinFrame(nowMs))).join("·");
}

/**
 * Bảng chữ live cho Fanpage.
 * Vòng quay CSS THẬT + hiện từng chữ số: trang /live
 * (FB không chạy CSS trong bài — n8n gắn link /live + poll ~2s sửa chữ)
 */
export function buildLiveCaption(
  date: string,
  stations: Station[],
  stage: "waiting" | "live" | "completed",
  liveBoardUrl?: string
): string {
  const nowMs = Date.now();
  const statusLine =
    stage === "completed"
      ? `✅ ĐÃ ĐỦ GIẢI ĐẶC BIỆT — ${date}`
      : stage === "live"
        ? `🔴 ĐANG XỔ TRỰC TIẾP — ${date}`
        : `⏳ CHUẨN BỊ XỔ — ${date}`;

  const names = stations.map((s) => shortStationName(s.name));
  const codes = stations.map((s) => s.code || "—");

  const row = (
    label: string,
    mark: string,
    getter: (s: Station) => string
  ): string => {
    const cells = stations.map((s) => getter(s)).join(" │ ");
    return `${mark}${label}│ ${cells}`;
  };

  return [
    "╔══════════════════════════════╗",
    "║ 🟥 ĐẠI LÝ VÉ SỐ PHƯỚC DANH  ║",
    "║ 📍 137 LÊ LỢI — VĨNH LONG   ║",
    "╚══════════════════════════════╝",
    "",
    statusLine,
    `🔵 ĐỔI SỐ TRÚNG ĐẶC BIỆT TẬN NƠI  🔴 0919.494.566`,
    liveBoardUrl
      ? `\n▶️ LIVE QUAY THẬT (từng chữ số 7→77→778):\n${liveBoardUrl}\n`
      : "",
    `🏷 Đài: ${names.map((n, i) => `${n}(${codes[i]})`).join(" · ")}`,
    "",
    "——— BẢNG KẾT QUẢ (LIVE) ———",
    `GIẢI     │ ${names.join(" │ ")}`,
    row("G.8 100N", "🔴 ", (s) => liveCell(s.g8, nowMs)),
    row("G.7 200N", "⬛ ", (s) => liveCell(s.g7, nowMs)),
    row("G.6 400N", "⬛ ", (s) => liveMulti(s.g6 || [], nowMs)),
    row("G.5 1TR ", "⬛ ", (s) => liveCell(s.g5, nowMs)),
    row("G.4 3TR ", "⬛ ", (s) => liveMulti(s.g4 || [], nowMs)),
    row("G.3 10TR", "⬛ ", (s) => liveMulti(s.g3 || [], nowMs)),
    row("G.2 15TR", "⬛ ", (s) => liveCell(s.g2, nowMs)),
    row("G.1 30TR", "⬛ ", (s) => liveCell(s.g1, nowMs)),
    row("ĐB  2TỶ ", "🟡🔴 ", (s) => liveCell(s.gdb, nowMs)),
    "",
    "⠋ = đang chờ (đổi mỗi lần cập nhật ~2 giây)",
    "Vòng tròn quay THẬT + hiện từng chữ số: mở link LIVE.",
    "",
    stage === "completed"
      ? "✅ Đủ ĐB — đăng ẢNH bảng form + caption chuẩn."
      : "📡 Poll gần realtime từ nguồn chính thức…",
    `☎️ Hotline: ${HOTLINE}`,
    `🌐 ${WEBSITE}`,
  ].join("\n");
}

function buildProgressKey(stations: Station[]): string {
  return stations
    .map((s) =>
      [
        s.code,
        s.g8,
        s.g7,
        (s.g6 || []).join(","),
        s.g5,
        (s.g4 || []).join(","),
        (s.g3 || []).join(","),
        s.g2,
        s.g1,
        s.gdb,
      ].join("|")
    )
    .join("||");
}

function detectStage(
  stations: Station[],
  completed: boolean
): "waiting" | "live" | "completed" {
  if (completed) return "completed";
  const hasAny = stations.some(
    (s) =>
      s.g8 ||
      s.g7 ||
      s.g5 ||
      s.g2 ||
      s.g1 ||
      s.gdb ||
      (s.g6 && s.g6.length) ||
      (s.g4 && s.g4.length) ||
      (s.g3 && s.g3.length)
  );
  return hasAny ? "live" : "waiting";
}

export async function fetchXsmn(dateIso?: string | null): Promise<{
  raw: unknown;
  payload: Omit<KqxsPayload, "imageUrl">;
}> {
  const url =
    dateIso && /^\d{4}-\d{2}-\d{2}$/.test(dateIso)
      ? `${SOURCE_API}?date=${dateIso}`
      : SOURCE_API;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "PhuocDanh-KQXS-API/1.0 (+https://github.com/DanhSteve/kqxs-phuocdanh-api)",
    },
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(`Upstream HTTP ${res.status} for ${url}`);
  }

  const raw = (await res.json()) as {
    result?: { date?: string; stations?: RawStation[] };
    today?: string;
    serverTime?: string;
  };

  const result = raw.result || {};
  const list = Array.isArray(result.stations) ? result.stations : [];
  const stations = list.map(mapStation);
  const dateIsoResolved = String(result.date || raw.today || dateIso || "").slice(
    0,
    10
  );
  const date = isoToVn(dateIsoResolved);
  const completed =
    stations.length >= 3 &&
    stations.every((s) => onlyDigits(s.gdb).length === 6);
  const stage = detectStage(stations, completed);
  const progressKey = buildProgressKey(stations);

  return {
    raw,
    payload: {
      date,
      dateIso: dateIsoResolved,
      completed,
      stage,
      progressKey,
      station_count: stations.length,
      stations,
      caption: buildCaption(date, stations),
      captionAfterLive: buildCaptionAfterLive(date),
      liveCaption: buildLiveCaption(date, stations, stage),
      source: url,
      serverTime: raw.serverTime,
    },
  };
}

export function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
  };
}
