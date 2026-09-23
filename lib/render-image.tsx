import { readFileSync } from "fs";
import { join } from "path";
import { ImageResponse } from "next/og";
import type { Station } from "./xsmn";
import { shortStationName } from "./xsmn";

/** Form ảnh Fanpage — mọi chữ/số Black 900, cỡ đồng bộ theo nhóm */
const C = {
  red: "#c8102e",
  redDeep: "#b71c1c",
  navy: "#0d3b7a",
  navyDeep: "#0a2f5c",
  beige: "#f5ecd8",
  orange: "#f5a623",
  yellow: "#ffe082",
  black: "#0a0a0a",
  gray: "#333333",
  grayMid: "#444444",
  blueText: "#0d47a1",
  white: "#ffffff",
  border: "#1a1a1a",
  dotted: "#777777",
};

const FONT = "Be Vietnam Pro";

/** Nhóm cỡ chữ — mọi dòng đều fontWeight 900 */
const T = {
  title: 38,
  address: 17,
  region: 15,
  dateBig: 32,
  dateYear: 17,
  slogan: 18,
  phone: 26,
  giai: 19,
  station: 20,
  ticket: 14,
  prizeCode: 22,
  prizeMeta: 15,
  note: 14,
  footer: 17,
} as const;

/** Nhóm cỡ số theo số chữ số */
const N = {
  d2: 34,
  d3: 28,
  d4: 24,
  d5: 21,
  d6: 34,
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
  // Chỉ tải bộ cần thiết — đủ glyph Việt + Latin, tránh OOM
  const files: Array<[string, 800 | 900, "normal" | "italic"]> = [
    ["latin-900.ttf", 900, "normal"],
    ["viet-900.ttf", 900, "normal"],
    ["latin-800-italic.ttf", 800, "italic"],
    ["viet-800-italic.ttf", 800, "italic"],
  ];

  return files.map(([file, weight, style]) => ({
    name: FONT,
    data: readFileSync(join(dir, file)),
    weight,
    style,
  }));
}

/** Style chữ đậm — luôn ghi rõ weight + family (tránh Satori fallback mỏng) */
function tx(
  size: number,
  color: string,
  extra: Record<string, string | number> = {}
) {
  return {
    display: "flex" as const,
    fontFamily: FONT,
    fontWeight: 900 as const,
    fontSize: size,
    color,
    ...extra,
  };
}

export async function renderKqxsImage(opts: {
  date: string;
  stations: Station[];
}): Promise<ImageResponse> {
  const { date, stations } = opts;
  const n = Math.max(stations.length, 1);
  const labelW = 140;
  const colW = Math.max(165, Math.min(220, Math.floor((960 - labelW) / n)));
  const width = labelW + colW * n + 40;
  const height = 1200;
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
          fontWeight: 900,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div style={tx(T.title, C.red, { letterSpacing: 0.5 })}>
            ĐẠI LÝ VÉ SỐ PHƯỚC DANH
          </div>
          <div style={tx(T.address, C.black, { marginTop: 4 })}>
            137 LÊ LỢI, P. TRÀ VINH — VĨNH LONG
          </div>
          <div
            style={tx(T.region, C.gray, {
              marginTop: 2,
              fontStyle: "italic",
              fontWeight: 800,
            })}
          >
            XỔ SỐ MIỀN NAM
          </div>
        </div>

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
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 4px",
            }}
          >
            <div style={tx(T.dateBig, C.white)}>{dayMonth}</div>
            <div style={tx(T.dateYear, C.white)}>{year}</div>
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              background: C.white,
              padding: "8px",
            }}
          >
            <div style={tx(T.slogan, C.blueText, { marginRight: 10 })}>
              ĐỔI SỐ TRÚNG ĐẶC BIỆT TẬN NƠI
            </div>
            <div style={tx(T.phone, C.red)}>0919.494.566</div>
          </div>
        </div>

        <div style={{ display: "flex", width: "100%" }}>
          <div
            style={{
              ...tx(T.giai, C.black),
              width: labelW,
              background: C.beige,
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
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 4px",
                border: `1.5px solid ${C.border}`,
              }}
            >
              <div style={tx(T.station, C.white)}>
                {shortStationName(s.name)}
              </div>
              <div style={tx(T.ticket, C.white)}>{s.code || ""}</div>
            </div>
          ))}
        </div>

        {ROWS.map((row) => {
          const jackpot = row.kind === "jackpot";
          const vals = stations.map((s) => cellValue(s, row.key));
          const maxLines = Math.max(
            1,
            ...vals.map((v) => (Array.isArray(v) ? v.length : 1))
          );
          const size = numSize(row.digitGroup);
          const lineH = Math.round(size * 1.22);
          const minH =
            row.kind === "multi"
              ? Math.max(row.note ? 190 : 68, maxLines * lineH + 16)
              : jackpot
                ? 66
                : 50;
          const labelColor = jackpot ? C.white : C.black;
          const metaColor = jackpot ? C.white : C.grayMid;

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
                  <div style={tx(jackpot ? 24 : T.prizeCode, labelColor)}>
                    {row.code}
                  </div>
                  <div style={tx(T.prizeMeta, metaColor)}>
                    {`${row.prize} ${row.digits}`}
                  </div>
                </div>

                {row.note ? (
                  <div
                    style={{
                      display: "flex",
                      width: 32,
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
                        fontFamily: FONT,
                        fontWeight: 800,
                        fontStyle: "italic",
                        fontSize: T.note,
                        color: C.red,
                        whiteSpace: "nowrap",
                        transform: "rotate(-90deg)",
                        width: Math.max(minH - 8, 200),
                        justifyContent: "center",
                        alignItems: "center",
                        letterSpacing: 0.15,
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
                const numColor =
                  row.kind === "red" || jackpot ? C.red : C.black;
                return (
                  <div
                    key={`${row.code}-${s.code}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      background: jackpot ? C.yellow : C.white,
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
                          <div key={i} style={tx(size, numColor)}>
                            {num}
                          </div>
                        ))
                      : (
                          <div style={tx(size, numColor)}>{val as string}</div>
                        )}
                  </div>
                );
              })}
            </div>
          );
        })}

        <div
          style={{
            ...tx(T.footer, C.white),
            marginTop: 8,
            width: "100%",
            background: C.navyDeep,
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 10px",
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
