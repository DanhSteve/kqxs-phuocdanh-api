import { ImageResponse } from "next/og";
import type { Station } from "./xsmn";
import { shortStationName } from "./xsmn";

const ROWS: { label: string; key: keyof Station; kind: "red" | "num" | "multi" | "jackpot" }[] = [
  { label: "100N", key: "g8", kind: "red" },
  { label: "200N", key: "g7", kind: "num" },
  { label: "400N", key: "g6", kind: "multi" },
  { label: "1TR", key: "g5", kind: "num" },
  { label: "3TR", key: "g4", kind: "multi" },
  { label: "10TR", key: "g3", kind: "multi" },
  { label: "15TR", key: "g2", kind: "num" },
  { label: "30TR", key: "g1", kind: "num" },
  { label: "2TỶ", key: "gdb", kind: "jackpot" },
];

function cellValue(station: Station, key: keyof Station): string | string[] {
  const v = station[key];
  if (Array.isArray(v)) return v.length ? v : ["—"];
  return v || "—";
}

export function renderKqxsImage(opts: {
  date: string;
  stations: Station[];
}): ImageResponse {
  const { date, stations } = opts;
  const n = Math.max(stations.length, 1);
  const width = Math.min(1200, 220 + n * 180);
  const height = 780;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          padding: "28px 32px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 34,
            fontWeight: 800,
            color: "#1e3a8a",
            marginBottom: 6,
          }}
        >
          {`KẾT QUẢ XSMN NGÀY ${date}`}
        </div>
        <div style={{ display: "flex", fontSize: 16, color: "#6b7280", marginBottom: 14 }}>
          Đại lý vé số PHƯỚC DANH · Hotline 0919494566 · Cập nhật từ 16:15
        </div>
        <div
          style={{
            display: "flex",
            background: "#fef3c7",
            border: "2px solid #facc15",
            borderRadius: 8,
            padding: "8px 14px",
            color: "#15803d",
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 16,
          }}
        >
          TRÚNG SỐ GỌI NGAY 0919494566
        </div>

        {/* Header */}
        <div style={{ display: "flex", width: "100%" }}>
          <div
            style={{
              display: "flex",
              width: 90,
              background: "#b91c1c",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 4px",
              border: "1px solid #374151",
            }}
          >
            GIẢI
          </div>
          {stations.map((s) => (
            <div
              key={s.code || s.name}
              style={{
                display: "flex",
                flex: 1,
                background: "#b91c1c",
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 4px",
                border: "1px solid #374151",
              }}
            >
              {shortStationName(s.name)}
            </div>
          ))}
        </div>

        {/* Codes */}
        <div style={{ display: "flex", width: "100%" }}>
          <div
            style={{
              display: "flex",
              width: 90,
              background: "#451a03",
              color: "#fff",
              fontSize: 12,
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 4px",
              border: "1px solid #374151",
            }}
          >
            {date}
          </div>
          {stations.map((s) => (
            <div
              key={`c-${s.code}`}
              style={{
                display: "flex",
                flex: 1,
                background: "#fffbeb",
                color: "#6b7280",
                fontSize: 13,
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 4px",
                border: "1px solid #374151",
              }}
            >
              {s.code || ""}
            </div>
          ))}
        </div>

        {ROWS.map((row, idx) => {
          const jackpot = row.kind === "jackpot";
          const bg = jackpot ? "#facc15" : idx % 2 === 0 ? "#fffbeb" : "#ffffff";
          return (
            <div key={row.label} style={{ display: "flex", width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  width: 90,
                  background: jackpot ? "#facc15" : "#fde68a",
                  color: "#b91c1c",
                  fontWeight: 800,
                  fontSize: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 4px",
                  border: "1px solid #374151",
                  minHeight: row.kind === "multi" ? 64 : 44,
                }}
              >
                {row.label}
              </div>
              {stations.map((s) => {
                const val = cellValue(s, row.key);
                const isMulti = Array.isArray(val);
                return (
                  <div
                    key={`${row.label}-${s.code}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      background: bg,
                      color:
                        row.kind === "red" || jackpot ? "#c81010" : "#111827",
                      fontWeight: 800,
                      fontSize: jackpot || row.kind === "red" ? 26 : isMulti ? 15 : 20,
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "6px 4px",
                      border: "1px solid #374151",
                      minHeight: row.kind === "multi" ? 64 : 44,
                      lineHeight: 1.25,
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

        <div
          style={{
            display: "flex",
            marginTop: 14,
            fontSize: 14,
            color: "#0f766e",
            fontWeight: 700,
          }}
        >
          Đối chiếu kết quả · PHƯỚC DANH · https://vesophuocdanh.vn
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
