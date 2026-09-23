import type { Metadata } from "next";
import LiveBoardClient from "./live-board-client";

export const metadata: Metadata = {
  title: "Phước Danh · Xổ số miền Nam LIVE",
  description: "Bảng kết quả đang xổ trực tiếp — từng chữ số hiện dần, vòng quay thật",
};

export default function LivePage() {
  return <LiveBoardClient />;
}
