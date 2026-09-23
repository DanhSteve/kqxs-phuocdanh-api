import { ImageResponse } from "next/og";
import type { Station } from "./xsmn";
import { shortStationName } from "./xsmn";

/** Form ảnh bảng Fanpage — bám 100% mẫu Đại lý vé số Phước Danh */
const C = {
  red: "#c8102e",
  redDeep: "#b71c1c",
  navy: "#0d3b7a",
  navyDeep: "#0a2f5c",
  beige: "#f5ecd8",
  orange: "#f5a623",
  yellow: "#ffe082",
  black: "#0a0a0a",
  gray: "#555555",
  grayMid: "#666666",
  blueText: "#0d47a1",
  white: "#ffffff",
  border: "#1a1a1a",
  dotted: "#888888",
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
  const labelW = 132;
  const colW = Math.max(155, Math.min(210, Math.floor((920 - labelW) / n)));
  const width = labelW + colW * n + 40;
  const height = 1140;
  const { dayMonth, year } = splitDate(date);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: C.white,
          padding: "18px 20px 16px",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 36,
              fontWeight: 800,
              color: C.red,
              letterSpacing: 0.5,
            }}
          >
            ĐẠI LÝ VÉ SỐ PHƯỚC DANH
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 15,
              fontWeight: 800,
              color: C.black,
              marginTop: 3,
            }}
          >
            137 LÊ LỢI, P. TRÀ VINH — VĨNH LONG
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 13,
              fontWeight: 700,
              fontStyle: "italic",
              color: C.gray,
              marginTop: 2,
            }}
          >
            XỔ SỐ MIỀN NAM
          </div>
        </div>

        {/* DATE + HOTLINE */}
        <div
          style={{
            display: "flex",
            width: "100%",
            marginBottom: 8,
            borderTop: `2px solid ${C.navy}`,
            borderBottom: `2px solid ${C.navy}`,
            borderLeft: `2px solid ${C.navy}`,
            borderRight: `2px solid ${C.navy}`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: labelW,
              background: C.redDeep,
              color: C.white,
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 4px",
            }}
          >
            <div style={{ display: "flex", fontSize: 30, fontWeight: 800 }}>
              {dayMonth}
            </div>
            <div style={{ display: "flex", fontSize: 14, fontWeight: 800 }}>
              {year}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              background: C.white,
              padding: "8px 8px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 17,
                fontWeight: 800,
                color: C.blueText,
                marginRight: 10,
              }}
            >
              ĐỔI SỐ TRÚNG ĐẶC BIỆT TẬN NƠI
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 800,
                color: C.red,
              }}
            >
              0919.494.566
            </div>
          </div>
        </div>

        {/* TABLE HEADER */}
        <div style={{ display: "flex", width: "100%" }}>
          <div
            style={{
              display: "flex",
              width: labelW,
              background: C.beige,
              color: C.black,
              fontWeight: 800,
              fontSize: 17,
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 4px",
              border: `1.5px solid ${C.border}`,
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
                background: C.navy,
                color: C.white,
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 4px",
                border: `1.5px solid ${C.border}`,
              }}
            >
              <div style={{ display: "flex", fontSize: 19, fontWeight: 800 }}>
                {shortStationName(s.name)}
              </div>
              <div style={{ display: "flex", fontSize: 13, fontWeight: 800 }}>
                {s.code || ""}
              </div>
            </div>
          ))}
        </div>

        {/* DATA ROWS */}
        {ROWS.map((row) => {
          const jackpot = row.kind === "jackpot";
          const vals = stations.map((s) => cellValue(s, row.key));
          const maxLines = Math.max(
            1,
            ...vals.map((v) => (Array.isArray(v) ? v.length : 1))
          );
          const lineH = row.kind === "multi" ? 24 : 0;
          const minH =
            row.kind === "multi"
              ? Math.max(row.note ? 168 : 58, maxLines * lineH + 12)
              : jackpot
                ? 58
                : 44;

          return (
            <div key={row.code} style={{ display: "flex", width: "100%" }}>
              {/* LABEL */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: labelW,
                  background: jackpot ? C.orange : C.beige,
                  alignItems: "stretch",
                  justifyContent: "center",
                  border: `1.5px solid ${C.border}`,
                  minHeight: minH,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    padding: "4px 2px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: jackpot ? 24 : 20,
                      fontWeight: 800,
                      color: jackpot ? C.white : C.black,
                    }}
                  >
                    {row.code}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 12,
                      fontWeight: 800,
                      color: jackpot ? C.white : C.grayMid,
                    }}
                  >
                    {row.prize}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 11,
                      fontWeight: 800,
                      color: jackpot ? C.white : C.gray,
                    }}
                  >
                    {row.digits}
                  </div>
                </div>

                {/* Chữ đỏ G.4: một dòng nằm ngang rồi xoay -90° (đọc từ dưới lên) — đúng form mẫu */}
                {row.note ? (
                  <div
                    style={{
                      display: "flex",
                      width: 26,
                      minHeight: minH,
                      borderLeft: `1.5px dashed ${C.dotted}`,
                      borderRight: `1.5px dashed ${C.dotted}`,
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      background: C.beige,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        color: C.red,
                        fontSize: 12,
                        fontWeight: 800,
                        fontStyle: "italic",
                        whiteSpace: "nowrap",
                        transform: "rotate(-90deg)",
                        width: minH - 10,
                        justifyContent: "center",
                        alignItems: "center",
                        letterSpacing: 0.3,
                      }}
                    >
                      Dò lại kết quả Công ty sau 17h
                    </div>
                  </div>
                ) : null}
              </div>

              {/* NUMBERS — tất cả in đậm */}
              {stations.map((s, si) => {
                const val = vals[si];
                const isMulti = Array.isArray(val);
                const numSize =
                  jackpot || row.kind === "red" ? 30 : isMulti ? 18 : 22;
                return (
                  <div
                    key={`${row.code}-${s.code}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      background: jackpot ? C.yellow : C.white,
                      color:
                        row.kind === "red" || jackpot ? C.red : C.black,
                      fontWeight: 800,
                      fontSize: numSize,
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "3px 2px",
                      border: `1.5px solid ${C.border}`,
                      minHeight: minH,
                      lineHeight: 1.25,
                    }}
                  >
                    {isMulti
                      ? (val as string[]).map((num, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              fontWeight: 800,
                              fontSize: numSize,
                            }}
                          >
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

        {/* FOOTER */}
        <div
          style={{
            display: "flex",
            marginTop: 8,
            width: "100%",
            background: C.navyDeep,
            color: C.white,
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 10px",
            fontSize: 16,
            fontWeight: 800,
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
