import { ImageResponse } from "next/og";
import type { Station } from "./xsmn";
import { shortStationName } from "./xsmn";

/** Form ảnh bảng Fanpage — bám mẫu Đại lý vé số Phước Danh */
const COLORS = {
  red: "#c41e1e",
  redDark: "#a01818",
  navy: "#1a3a7a",
  navyDeep: "#0f2a5c",
  beige: "#f0e6d2",
  beigeDark: "#e8dcc4",
  orange: "#f0a020",
  yellow: "#fff3c4",
  black: "#111111",
  gray: "#6b7280",
  blueText: "#1e40af",
  white: "#ffffff",
  border: "#222222",
};

type RowDef = {
  code: string;
  prize: string;
  digits: string;
  key: keyof Station;
  kind: "red" | "num" | "multi" | "jackpot";
  note?: boolean;
};

const ROWS: RowDef[] = [
  { code: "G.8", prize: "100N", digits: "(2 số)", key: "g8", kind: "red" },
  { code: "G.7", prize: "200N", digits: "(3 số)", key: "g7", kind: "num" },
  { code: "G.6", prize: "400N", digits: "(4 số)", key: "g6", kind: "multi" },
  { code: "G.5", prize: "1TR", digits: "(4 số)", key: "g5", kind: "num" },
  {
    code: "G.4",
    prize: "3TR",
    digits: "(5 số)",
    key: "g4",
    kind: "multi",
    note: true,
  },
  { code: "G.3", prize: "10TR", digits: "(5 số)", key: "g3", kind: "multi" },
  { code: "G.2", prize: "15TR", digits: "(5 số)", key: "g2", kind: "num" },
  { code: "G.1", prize: "30TR", digits: "(5 số)", key: "g1", kind: "num" },
  {
    code: "ĐB",
    prize: "2 TỶ",
    digits: "(6 số)",
    key: "gdb",
    kind: "jackpot",
  },
];

function cellValue(station: Station, key: keyof Station): string | string[] {
  const v = station[key];
  if (Array.isArray(v)) return v.length ? v : ["—"];
  return v || "—";
}

function splitDate(date: string): { dayMonth: string; year: string } {
  // "22/09/2026" → dayMonth 22/09, year 2026
  const parts = String(date || "").split("/");
  if (parts.length === 3) {
    return { dayMonth: `${parts[0]}/${parts[1]}`, year: parts[2] };
  }
  return { dayMonth: date || "—", year: "" };
}

export function renderKqxsImage(opts: {
  date: string;
  stations: Station[];
}): ImageResponse {
  const { date, stations } = opts;
  const n = Math.max(stations.length, 1);
  const labelW = 118;
  const colW = Math.max(150, Math.min(200, Math.floor((900 - labelW) / n)));
  const width = labelW + colW * n + 48;
  const height = 1100;
  const { dayMonth, year } = splitDate(date);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: COLORS.white,
          padding: "20px 22px 18px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* ===== HEADER ===== */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 34,
              fontWeight: 800,
              color: COLORS.red,
              letterSpacing: 1,
            }}
          >
            ĐẠI LÝ VÉ SỐ PHƯỚC DANH
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 15,
              fontWeight: 700,
              color: COLORS.black,
              marginTop: 4,
            }}
          >
            137 LÊ LỢI, P. TRÀ VINH — VĨNH LONG
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 13,
              fontStyle: "italic",
              color: COLORS.gray,
              marginTop: 2,
            }}
          >
            XỔ SỐ MIỀN NAM
          </div>
        </div>

        {/* ===== DATE + HOTLINE BAR ===== */}
        <div
          style={{
            display: "flex",
            width: "100%",
            marginBottom: 10,
            border: `2px solid ${COLORS.navy}`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: labelW,
              background: COLORS.red,
              color: COLORS.white,
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 4px",
            }}
          >
            <div style={{ display: "flex", fontSize: 28, fontWeight: 800 }}>
              {dayMonth}
            </div>
            <div style={{ display: "flex", fontSize: 14, fontWeight: 600 }}>
              {year}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              background: COLORS.white,
              padding: "8px 10px",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.blueText,
              }}
            >
              ĐỔI SỐ TRÚNG ĐẶC BIỆT TẬN NƠI
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 800,
                color: COLORS.red,
              }}
            >
              0919.494.566
            </div>
          </div>
        </div>

        {/* ===== TABLE HEADER ===== */}
        <div style={{ display: "flex", width: "100%" }}>
          <div
            style={{
              display: "flex",
              width: labelW,
              background: COLORS.beige,
              color: COLORS.black,
              fontWeight: 800,
              fontSize: 16,
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 4px",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            GIẢI
          </div>
          {stations.map((s) => (
            <div
              key={s.code || s.name}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                background: COLORS.navy,
                color: COLORS.white,
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 4px",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div style={{ display: "flex", fontSize: 18, fontWeight: 800 }}>
                {shortStationName(s.name)}
              </div>
              <div style={{ display: "flex", fontSize: 12, fontWeight: 600, opacity: 0.95 }}>
                {s.code || ""}
              </div>
            </div>
          ))}
        </div>

        {/* ===== DATA ROWS ===== */}
        {ROWS.map((row) => {
          const jackpot = row.kind === "jackpot";
          const vals = stations.map((s) => cellValue(s, row.key));
          const maxLines = Math.max(
            1,
            ...vals.map((v) => (Array.isArray(v) ? v.length : 1))
          );
          const minH =
            row.kind === "multi"
              ? Math.max(52, maxLines * 22 + 10)
              : jackpot
                ? 56
                : 42;

          return (
            <div key={row.code} style={{ display: "flex", width: "100%" }}>
              {/* Label column */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: labelW,
                  background: jackpot ? COLORS.orange : COLORS.beige,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 2px",
                  border: `1px solid ${COLORS.border}`,
                  minHeight: minH,
                }}
              >
                {row.note ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: 14,
                      marginRight: 2,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {"Dò lại kết quả Công ty sau 17h".split("").map((ch, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          fontSize: 7,
                          color: COLORS.red,
                          lineHeight: 1.05,
                          fontWeight: 600,
                        }}
                      >
                        {ch === " " ? "·" : ch}
                      </div>
                    ))}
                  </div>
                ) : null}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: jackpot ? 22 : 18,
                      fontWeight: 800,
                      color: jackpot ? COLORS.red : COLORS.black,
                    }}
                  >
                    {row.code}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 11,
                      fontWeight: 700,
                      color: jackpot ? COLORS.redDark : COLORS.black,
                    }}
                  >
                    {row.prize}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 10,
                      color: COLORS.gray,
                    }}
                  >
                    {row.digits}
                  </div>
                </div>
              </div>

              {/* Number columns */}
              {stations.map((s, si) => {
                const val = vals[si];
                const isMulti = Array.isArray(val);
                return (
                  <div
                    key={`${row.code}-${s.code}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      background: jackpot ? COLORS.yellow : COLORS.white,
                      color:
                        row.kind === "red" || jackpot
                          ? COLORS.red
                          : COLORS.black,
                      fontWeight: 800,
                      fontSize:
                        jackpot || row.kind === "red"
                          ? 28
                          : isMulti
                            ? 16
                            : 20,
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px 2px",
                      border: `1px solid ${COLORS.border}`,
                      minHeight: minH,
                      lineHeight: 1.2,
                    }}
                  >
                    {isMulti
                      ? (val as string[]).map((num, i) => (
                          <div key={i} style={{ display: "flex" }}>
                            {num}
                          </div>
                        ))
                      : (val as string)}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* ===== FOOTER ===== */}
        <div
          style={{
            display: "flex",
            marginTop: 10,
            width: "100%",
            background: COLORS.navyDeep,
            color: COLORS.white,
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 10px",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          Xem Trực Tiếp và In Vé Dò tại vesophuocdanh.vn
        </div>
      </div>
    ),
    {
      width,
      height,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
