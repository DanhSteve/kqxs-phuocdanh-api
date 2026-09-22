# Handoff team n8n — Phước Danh KQXS → Fanpage

API đã deploy. Team n8n **không scrape**, chỉ gọi URL Vercel.

## 1. Đổi URL node Fetch (bắt buộc)

**Sai (404):**
```
https://vesophuocdanh.vn/api/ket-qua-hom-nay
```

**Đúng:**
```
https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today
```

- Method: `GET`
- Response format: **JSON**

## 2. Logic Format / Code node

```js
const data = $input.first().json;
if (!data.completed) return []; // chưa đủ Giải ĐB → đợi lần quét sau
```

Field sẵn có:

| Field | Dùng cho |
|---|---|
| `data.caption` | Caption Fanpage |
| `data.imageUrl` | URL ảnh bảng PNG |
| `data.date` | Ngày (vd `19/09/2026`) |
| `data.completed` | `true` mới được đăng |
| `data.stations` | Chi tiết từng đài |

Gợi ý chống trùng: `postKey = XSMN_${data.date}`

## 3. Đăng Fanpage = ảnh bảng

`POST https://graph.facebook.com/v19.0/{{PAGE_ID}}/photos`

| Param | Value |
|---|---|
| `url` | `={{ $json.imageUrl }}` |
| `caption` | `={{ $json.caption }}` |
| `access_token` | Page Access Token |

## 4. Test demo trước khi Active

1. Tạm Fetch:
   ```
   https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today?date=2026-09-19
   ```
2. Execute Workflow
3. Kiểm Fanpage có **ảnh bảng KQXS**
4. Đổi lại URL không có `?date=`
5. Active schedule

## 5. Lịch đề xuất

- Cron: `15-35/2 16 * * *`
- Timezone: `Asia/Ho_Chi_Minh`
- Idempotency: 1 bài / ngày

## Link kiểm tra

| Mục | URL |
|---|---|
| Health | https://kqxs-phuocdanh-api.vercel.app/api/health |
| JSON hôm nay | https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today |
| JSON demo | https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today?date=2026-09-19 |
| Ảnh demo | https://kqxs-phuocdanh-api.vercel.app/api/kqxs/image?date=2026-09-19 |
| GitHub | https://github.com/DanhSteve/kqxs-phuocdanh-api |

Data/API: **DanhSteve** · n8n + Facebook token: **team n8n**

Hotline thương hiệu: 091.949.4566 – 0987.494.565 · https://vesophuocdanh.vn
