/**
 * Proxy + chuẩn hóa KQXS miền Nam từ vesophuocdanh.vn/api/xsmn/live
 * Contract ổn định cho n8n → Fanpage Phước Danh
 */

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
  /** Caption dạng bảng chữ cập nhật dần khi đang live */
  liveCaption: string;
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

/** Ô trống khi đang live → vòng tròn quay (Facebook hiển thị emoji) */
const SPIN = "🔄";

function liveCell(value: string, emptyWidth = 2): string {
  const v = String(value || "").trim();
  return v || SPIN;
}

function liveMulti(values: string[]): string {
  if (!values.length) return SPIN;
  return values.map((v) => v || SPIN).join("·");
}

/**
 * Bảng chữ live — khung cấu trúc gần form Phước Danh
 * (Fanpage không có CSS màu thật → dùng emoji + ký hiệu để phân tầng)
 */
export function buildLiveCaption(
  date: string,
  stations: Station[],
  stage: "waiting" | "live" | "completed"
): string {
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

  const board = [
    "╔══════════════════════════════╗",
    "║ 🟥 ĐẠI LÝ VÉ SỐ PHƯỚC DANH  ║",
    "║ 📍 137 LÊ LỢI, P. TRÀ VINH  ║",
    "║    — VĨNH LONG · XSMN       ║",
    "╚══════════════════════════════╝",
    "",
    statusLine,
    `🔵 ĐỔI SỐ TRÚNG ĐẶC BIỆT TẬN NƠI  🔴 0919.494.566`,
    "",
    `🏷 Đài: ${names.map((n, i) => `${n}(${codes[i]})`).join(" · ")}`,
    "",
    "——— BẢNG KẾT QUẢ (LIVE) ———",
    `GIẢI     │ ${names.join(" │ ")}`,
    "————————┼" + names.map(() => "——————").join("┼"),
    row("G.8 100N (2)", "🔴 ", (s) => liveCell(s.g8)),
    row("G.7 200N (3)", "⬛ ", (s) => liveCell(s.g7)),
    row("G.6 400N (4)", "⬛ ", (s) => liveMulti(s.g6 || [])),
    row("G.5 1TR  (4)", "⬛ ", (s) => liveCell(s.g5)),
    row("G.4 3TR  (5)", "⬛ ", (s) => liveMulti(s.g4 || [])),
    "         └ dò lại KQ Công ty sau 17h",
    row("G.3 10TR (5)", "⬛ ", (s) => liveMulti(s.g3 || [])),
    row("G.2 15TR (5)", "⬛ ", (s) => liveCell(s.g2)),
    row("G.1 30TR (5)", "⬛ ", (s) => liveCell(s.g1)),
    row("ĐB  2TỶ  (6)", "🟡🔴 ", (s) => liveCell(s.gdb, 6)),
    "",
    `${SPIN} = ô chưa có số (đang chờ)`,
    "🔴 = giải nổi bật (G.8 / ĐB) · 🟡 = hàng đặc biệt",
    "",
    stage === "completed"
      ? "✅ Đã đủ ĐB — bài ẢNH bảng form chuẩn sẽ đăng ngay."
      : "📡 Cập nhật tự động từ nguồn chính thức…",
    `☎️ Hotline: ${HOTLINE}`,
    `🌐 ${WEBSITE}`,
  ];

  return board.join("\n");
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
