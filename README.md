# kqxs-phuocdanh-api

API ổn định KQXS miền Nam cho **n8n → Fanpage Phước Danh**.

| | |
|---|---|
| Nguồn | `https://vesophuocdanh.vn/api/xsmn/live` |
| Production | https://kqxs-phuocdanh-api.vercel.app |
| GitHub | https://github.com/DanhSteve/kqxs-phuocdanh-api |
| Owner data/API | DanhSteve |
| Consumer | team n8n |

## Endpoints

| URL | Mô tả |
|---|---|
| `GET /api/health` | Health check |
| `GET /api/kqxs/today` | JSON hôm nay + `caption` + `imageUrl` |
| `GET /api/kqxs/today?date=YYYY-MM-DD` | JSON theo ngày (demo) |
| `GET /api/kqxs/image` | PNG bảng KQXS |
| `GET /api/kqxs/image?date=YYYY-MM-DD` | PNG theo ngày |

### Field quan trọng cho n8n

```json
{
  "date": "19/09/2026",
  "dateIso": "2026-09-19",
  "completed": true,
  "stations": [],
  "caption": "...",
  "imageUrl": "https://kqxs-phuocdanh-api.vercel.app/api/kqxs/image?date=2026-09-19"
}
```

- Chỉ đăng khi `completed === true`.
- Đăng ảnh: Facebook `POST /{page-id}/photos` với `url = imageUrl` + `caption`.

## Tài liệu bàn giao

- [HANDOFF_N8N.md](./HANDOFF_N8N.md) — hướng dẫn team n8n đầy đủ
- [MESSENGER_N8N.md](./MESSENGER_N8N.md) — đoạn chat copy gửi team

## Local

```bash
npm install
npm run dev
```

## Deploy

```bash
npx vercel --prod --yes
```

Hotline: 091.949.4566 – 0987.494.565 · https://vesophuocdanh.vn
