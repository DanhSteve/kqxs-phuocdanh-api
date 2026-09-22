# Hướng dẫn team n8n — gắn API Vercel

## 1. Đổi node Fetch Lottery Data

**URL cũ (sai – 404):**
```
https://vesophuocdanh.vn/api/ket-qua-hom-nay
```

**URL mới (đúng):**
```
{{VERCEL_BASE}}/api/kqxs/today
```

Thay `{{VERCEL_BASE}}` bằng domain Vercel production (xem README / bàn giao).

Response Format: **JSON**.

## 2. Format / Code node

Chỉ tiếp tục khi:

```js
const data = $input.first().json;
if (!data.completed) return []; // chưa đủ GĐB → đợi lần sau
```

Dùng sẵn:
- `data.caption` — caption Fanpage
- `data.imageUrl` — URL ảnh bảng PNG
- `data.date` / `data.postKey` gợi ý: `XSMN_${data.date}`

## 3. Đăng Fanpage (ưu tiên ảnh bảng)

`POST https://graph.facebook.com/v19.0/{{PAGE_ID}}/photos`

Query/body:
- `url` = `{{ $json.imageUrl }}`
- `caption` = `{{ $json.caption }}`
- `access_token` = Page Token

## 4. Test demo

1. Tạm Fetch: `{{VERCEL_BASE}}/api/kqxs/today?date=2026-09-19`
2. Execute workflow
3. Kiểm Fanpage có ảnh bảng
4. Đổi lại URL không có `?date=` rồi Active schedule

## 5. Lịch đề xuất

Cron: `15-35/2 16 * * *` · Timezone `Asia/Ho_Chi_Minh`
