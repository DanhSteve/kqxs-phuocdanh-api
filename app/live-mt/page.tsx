import type { Metadata } from "next";
import LiveBoardClient from "../live/live-board-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Phước Danh · Xổ số miền Trung LIVE",
  description:
    "Bảng kết quả miền Trung đang xổ trực tiếp — từng chữ số hiện dần, vòng quay thật",
};

export default function LiveMtPage() {
  return (
    <LiveBoardClient
      apiPath="/api/kqxs-mt/today"
      regionLabel="XỔ SỐ MIỀN TRUNG"
    />
  );
}
