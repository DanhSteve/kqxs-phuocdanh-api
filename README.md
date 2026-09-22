# kqxs-phuocdanh-api

API ổn định KQXS miền Nam cho **n8n → Fanpage Phước Danh**.

- Nguồn: `https://vesophuocdanh.vn/api/xsmn/live`
- Host: Vercel
- Owner data/API: DanhSteve
- Consumer: team n8n (chỉ gọi URL này, không scrape)

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
  "stations": [...],
  "caption": "...",
  "imageUrl": "https://YOUR.vercel.app/api/kqxs/image?date=2026-09-19"
}
```

- Chỉ đăng Fanpage khi `completed === true` (đủ Giải Đặc Biệt mọi đài).
- Đăng **ảnh**: Facebook Graph `POST /{page-id}/photos` với `url = imageUrl` + `caption`.

## Đổi URL cho team n8n

Thay:

```text
https://vesophuocdanh.vn/api/ket-qua-hom-nay   ❌ 404
```

Bằng:

```text
https://YOUR.vercel.app/api/kqxs/today         ✅
```

Test demo:

```text
https://YOUR.vercel.app/api/kqxs/today?date=2026-09-19
https://YOUR.vercel.app/api/kqxs/image?date=2026-09-19
```

## Local

```bash
npm install
npm run dev
```

## Deploy

```bash
npx vercel --prod
```

Hotline: 091.949.4566 – 0987.494.565 · https://vesophuocdanh.vn
