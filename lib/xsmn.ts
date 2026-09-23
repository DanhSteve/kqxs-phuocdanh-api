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

/** Caption cập nhật dần khi đang xổ (đăng / sửa bài text Fanpage) */
export function buildLiveCaption(
  date: string,
  stations: Station[],
  stage: "waiting" | "live" | "completed"
): string {
  const header =
    stage === "completed"
      ? `✅ [CHÍNH THỨC] KQXS MIỀN NAM ${date}`
      : stage === "live"
        ? `🔴 ĐANG XỔ TRỰC TIẾP — KQXS MN ${date}`
        : `⏳ CHUẨN BỊ XỔ — KQXS MN ${date}`;

  const lines = stations.map((s) => {
    const name = shortStationName(s.name);
    const g8 = s.g8 || "…";
    const g7 = s.g7 || "…";
    const g1 = s.g1 || "…";
    const gdb = s.gdb || "……";
    return `${name} (${s.code || "—"})\nG8 ${g8} · G7 ${g7} · G1 ${g1} · ĐB ${gdb}`;
  });

  return [
    header,
    `⭐ Đại lý vé số PHƯỚC DANH`,
    "",
    ...lines,
    "",
    stage === "completed"
      ? "Ảnh bảng đầy đủ sẽ được đăng kèm / đã cập nhật."
      : "Đang cập nhật từng giải từ nguồn chính thức…",
    `☎️ ${HOTLINE}`,
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
