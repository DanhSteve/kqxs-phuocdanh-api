import { readFileSync } from "fs";
import { join } from "path";
import { ImageResponse } from "next/og";
import type { CSSProperties } from "react";
import type { Station } from "./xsmn";
import { shortStationName } from "./xsmn";

/** Form ảnh bảng Fanpage — bám mẫu Phước Danh; toàn bộ chữ/số ExtraBold */
const C = {
  red: "#c8102e",
  redDeep: "#b71c1c",
  navy: "#0d3b7a",
  navyDeep: "#0a2f5c",
  beige: "#f5ecd8",
  orange: "#f5a623",
  yellow: "#ffe082",
  black: "#0a0a0a",
  gray: "#444444",
  grayMid: "#555555",
  blueText: "#0d47a1",
  white: "#ffffff",
  border: "#1a1a1a",
  dotted: "#888888",
};

const FONT = "Be Vietnam Pro";

/** Nhóm cỡ chữ */
const T = {
  title: 36,
  address: 16,
  region: 14,
  dateBig: 30,
  dateYear: 16,
  slogan: 17,
  phone: 24,
  giai: 18,
  station: 19,
  ticket: 13,
  prizeCode: 20,
  prizeMeta: 13,
  note: 13,
  footer: 16,
} as const;

/** Nhóm cỡ số theo số chữ số (đồng bộ trong nhóm) */
const N = {
  d2: 32, // G.8
  d3: 26, // G.7
  d4: 22, // G.6 + G.5
  d5: 20, // G.4 + G.3 + G.2 + G.1
  d6: 32, // ĐB
} as const;

type RowDef = {
  code: string;
  prize: string;
  digits: string;
  key: keyof Station;
  kind: "red" | "num" | "multi" | "jackpot";
  digitGroup: 2 | 3 | 4 | 5 | 6;
  note?: boolean;
};

const ROWS: RowDef[] = [
  { code: "G.8", prize: "100N", digits: "(2 số)", key: "g8", kind: "red", digitGroup: 2 },
  { code: "G.7", prize: "200N", digits: "(3 số)", key: "g7", kind: "num", digitGroup: 3 },
  { code: "G.6", prize: "400N", digits: "(4 số)", key: "g6", kind: "multi", digitGroup: 4 },
  { code: "G.5", prize: "1TR", digits: "(4 số)", key: "g5", kind: "num", digitGroup: 4 },
  {
    code: "G.4",
    prize: "3TR",
    digits: "(5 số)",
    key: "g4",
    kind: "multi",
    digitGroup: 5,
    note: true,
  },
  { code: "G.3", prize: "10TR", digits: "(5 số)", key: "g3", kind: "multi", digitGroup: 5 },
  { code: "G.2", prize: "15TR", digits: "(5 số)", key: "g2", kind: "num", digitGroup: 5 },
  { code: "G.1", prize: "30TR", digits: "(5 số)", key: "g1", kind: "num", digitGroup: 5 },
  {
    code: "ĐB",
    prize: "2 TỶ",
    digits: "(6 số)",
    key: "gdb",
    kind: "jackpot",
    digitGroup: 6,
  },
];

function numSize(group: RowDef["digitGroup"]): number {
  switch (group) {
    case 2:
      return N.d2;
    case 3:
      return N.d3;
    case 4:
      return N.d4;
    case 5:
      return N.d5;
    case 6:
      return N.d6;
  }
}

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

function loadFonts() {
  const dir = join(process.cwd(), "public", "fonts");
  const files = [
    ["latin-800.ttf", 800, "normal"],
    ["viet-800.ttf", 800, "normal"],
    ["latin-800-italic.ttf", 800, "italic"],
    ["viet-800-italic.ttf", 800, "italic"],
  ] as const;

  return files.map(([file, weight, style]) => ({
    name: FONT,
    data: readFileSync(join(dir, file)),
    weight: weight as 800,
    style: style as "normal" | "italic",
  }));
}

const bold: CSSProperties = { fontWeight: 800, fontFamily: FONT };

export async function renderKqxsImage(opts: {
  date: string;
  stations: Station[];
}): Promise<ImageResponse> {
  const { date, stations } = opts;
  const n = Math.max(stations.length, 1);
  const labelW = 136;
  const colW = Math.max(160, Math.min(210, Math.floor((940 - labelW) / n)));
  const width = labelW + colW * n + 40;
  const height = 1180;
  const { dayMonth, year } = splitDate(date);
  const fonts = loadFonts();

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
          fontFamily: FONT,
          fontWeight: 800,
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
              fontSize: T.title,
              ...bold,
              color: C.red,
              letterSpacing: 0.5,
            }}
          >
            ĐẠI LÝ VÉ SỐ PHƯỚC DANH
          </div>
          <div
            style={{
              display: "flex",
              fontSize: T.address,
              ...bold,
              color: C.black,
              marginTop: 4,
            }}
          >
            137 LÊ LỢI, P. TRÀ VINH — VĨNH LONG
          </div>
          <div
            style={{
              display: "flex",
              fontSize: T.region,
              fontWeight: 800,
              fontFamily: FONT,
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
            border: `2px solid ${C.navy}`,
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
            <div
              style={{
                display: "flex",
                fontSize: T.dateBig,
                ...bold,
              }}
            >
              {dayMonth}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: T.dateYear,
                ...bold,
              }}
            >
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
                fontSize: T.slogan,
                ...bold,
                color: C.blueText,
                marginRight: 10,
              }}
            >
              ĐỔI SỐ TRÚNG ĐẶC BIỆT TẬN NƠI
            </div>
            <div
              style={{
                display: "flex",
                fontSize: T.phone,
                ...bold,
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
              ...bold,
              fontSize: T.giai,
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
              <div
                style={{
                  display: "flex",
                  fontSize: T.station,
                  ...bold,
                }}
              >
                {shortStationName(s.name)}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: T.ticket,
                  ...bold,
                }}
              >
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
          const size = numSize(row.digitGroup);
          const lineH = Math.round(size * 1.2);
          const minH =
            row.kind === "multi"
              ? Math.max(row.note ? 175 : 62, maxLines * lineH + 14)
              : jackpot
                ? 62
                : 48;

          return (
            <div key={row.code} style={{ display: "flex", width: "100%" }}>
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
                      fontSize: jackpot ? 22 : T.prizeCode,
                      ...bold,
                      color: jackpot ? C.white : C.black,
                    }}
                  >
                    {row.code}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: T.prizeMeta,
                      ...bold,
                      color: jackpot ? C.white : C.grayMid,
                    }}
                  >
                    {row.prize}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: T.prizeMeta,
                      ...bold,
                      color: jackpot ? C.white : C.gray,
                    }}
                  >
                    {row.digits}
                  </div>
                </div>

                {row.note ? (
                  <div
                    style={{
                      display: "flex",
                      width: 28,
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
                        fontSize: T.note,
                        fontWeight: 800,
                        fontFamily: FONT,
                        fontStyle: "italic",
                        whiteSpace: "nowrap",
                        transform: "rotate(-90deg)",
                        width: minH - 10,
                        justifyContent: "center",
                        alignItems: "center",
                        letterSpacing: 0.2,
                      }}
                    >
                      Dò lại kết quả Công ty sau 17h
                    </div>
                  </div>
                ) : null}
              </div>

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
                      background: jackpot ? C.yellow : C.white,
                      color:
                        row.kind === "red" || jackpot ? C.red : C.black,
                      fontWeight: 800,
                      fontFamily: FONT,
                      fontSize: size,
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px 2px",
                      border: `1.5px solid ${C.border}`,
                      minHeight: minH,
                      lineHeight: 1.2,
                    }}
                  >
                    {isMulti
                      ? (val as string[]).map((num, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              fontWeight: 800,
                              fontFamily: FONT,
                              fontSize: size,
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
            fontSize: T.footer,
            ...bold,
          }}
        >
          Xem Trực Tiếp và In Vé Dò tại vesophuocdanh.vn
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
