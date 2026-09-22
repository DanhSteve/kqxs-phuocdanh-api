# Tin nhắn gửi team n8n (sao chép nguyên)

---

Anh ơi, form câu lệnh n8n đã sẵn — **quăng lên n8n rồi bật tự chạy** là được. Chi tiết đầy đủ trong file `HANDOFF_N8N.md`.

**1) Lịch:** `15-35/2 16 * * *` · múi giờ `Asia/Ho_Chi_Minh`

**2) Lấy dữ liệu (GET):**
```
https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today
```
(Thử 1 lần: thêm `?date=2026-09-19`)

**3) Code node (dán nguyên):**
```js
const data = $input.first().json;
if (!data.completed) return [];
const store = $getWorkflowStaticData('global');
const key = `XSMN_${data.date}`;
if (store[key]) return [];
store[key] = true;
return [{ json: { caption: data.caption, imageUrl: data.imageUrl, date: data.date } }];
```

**4) Đăng ảnh Fanpage (POST):**
`https://graph.facebook.com/v19.0/{{PAGE_ID}}/photos`
- `url` = `={{ $json.imageUrl }}`
- `caption` = `={{ $json.caption }}`
- `access_token` = mã trang Fanpage (anh tự gắn)

**Bảng điều khiển:** https://kqxs-phuocdanh-api.vercel.app  
**Hướng dẫn đủ:** https://github.com/DanhSteve/kqxs-phuocdanh-api/blob/master/HANDOFF_N8N.md

Hỏi đường dẫn / dữ liệu → DanhSteve.

---
