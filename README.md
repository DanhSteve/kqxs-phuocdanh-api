# Máy chủ kết quả xổ số — Phước Danh

Cung cấp dữ liệu ổn định để **n8n đăng bài lên Fanpage Phước Danh**.

| | |
|---|---|
| Nguồn dữ liệu | `https://vesophuocdanh.vn/api/xsmn/live` |
| Máy chủ chính | https://kqxs-phuocdanh-api.vercel.app |
| Kho mã | https://github.com/DanhSteve/kqxs-phuocdanh-api |
| Phụ trách dữ liệu | DanhSteve |
| Phụ trách đăng bài | team n8n |

## Đường dẫn

| Đường dẫn | Mô tả |
|---|---|
| `/api/health` | Kiểm tra máy chủ còn sống |
| `/api/kqxs/today` | Kết quả hôm nay + nội dung bài + đường dẫn ảnh |
| `/api/kqxs/today?date=YYYY-MM-DD` | Kết quả theo ngày (dùng khi thử) |
| `/api/kqxs/image` | Ảnh bảng kết quả |
| `/api/kqxs/image?date=YYYY-MM-DD` | Ảnh bảng theo ngày |

### Trường quan trọng cho n8n

```json
{
  "date": "19/09/2026",
  "dateIso": "2026-09-19",
  "completed": true,
  "stations": [],
  "caption": "...",
  "captionAfterLive": "...",
  "liveCaption": "...",
  "imageUrl": "https://kqxs-phuocdanh-api.vercel.app/api/kqxs/image?date=2026-09-19"
}
```

- Chỉ đăng khi `completed` = đúng (đã đủ giải đặc biệt).
- Đăng ảnh Fanpage: dùng `imageUrl` (đường dẫn ảnh) + `caption` (nội dung bài).

## Tài liệu bàn giao

- [HANDOFF_N8N.md](./HANDOFF_N8N.md) — hướng dẫn team n8n (dễ hiểu)
- [MESSENGER_N8N.md](./MESSENGER_N8N.md) — tin nhắn ngắn gửi team

## Chạy máy local

```bash
npm install
npm run dev
```

## Đưa lên máy chủ

```bash
npx vercel --prod --yes
```

Điện thoại: 091.949.4566 – 0987.494.565 · https://vesophuocdanh.vn
