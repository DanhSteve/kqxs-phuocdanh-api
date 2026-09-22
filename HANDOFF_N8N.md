# Hướng dẫn team n8n — Đăng kết quả xổ số lên Fanpage Phước Danh

Đường dẫn lấy dữ liệu đã sẵn. Team **không cần lấy dữ liệu từ web**.

Cách nhanh nhất: **copy khối câu lệnh bên dưới → dán vào chat n8n** → để n8n tự dựng workflow → gắn mã Fanpage → bật chạy.

Bảng điều khiển: https://kqxs-phuocdanh-api.vercel.app

---

## CÂU LỆNH DÁN VÀO CHAT n8n (copy nguyên khối)

> Mở chat trong n8n → dán **toàn bộ** đoạn dưới → Enter. Sau đó team chỉ gắn `PAGE_ID` + mã truy cập Fanpage rồi Active.

```
Tạo giúp tôi một workflow n8n tên: "Phước Danh – KQXS MN → Fanpage".

Mục tiêu: mỗi chiều tự lấy kết quả xổ số miền Nam rồi đăng ẢNH bảng kết quả lên Fanpage Facebook Phước Danh (kèm caption). Không scrape web — chỉ gọi API có sẵn.

=== NODE 1: Schedule Trigger ===
- Cron: 15-35/2 16 * * *
- Timezone: Asia/Ho_Chi_Minh
(Chạy mỗi 2 phút trong khung 16:15–16:35 giờ Việt Nam)

=== NODE 2: HTTP Request – Lấy kết quả ===
- Method: GET
- URL chạy thật:
  https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today
- URL thử 1 lần (dùng trước khi Active):
  https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today?date=2026-09-19
- Response là JSON có các field:
  completed (boolean), caption (string), imageUrl (string), date (string), stations (array)

=== NODE 3: Code – Chỉ đăng khi đủ giải + chống trùng ===
Mode: Run Once for All Items. Code:

const data = $input.first().json;
if (!data.completed) return [];
const store = $getWorkflowStaticData('global');
const key = `XSMN_${data.date}`;
if (store[key]) return [];
store[key] = true;
return [{
  json: {
    date: data.date,
    dateIso: data.dateIso,
    completed: data.completed,
    caption: data.caption,
    imageUrl: data.imageUrl,
    station_count: data.station_count,
    stations: data.stations
  }
}];

=== NODE 4: HTTP Request – Đăng ảnh Fanpage ===
- Method: POST
- URL: https://graph.facebook.com/v19.0/{{PAGE_ID}}/photos
  (để chỗ PAGE_ID cho tôi điền ID Fanpage)
- Body (form / x-www-form-urlencoded):
  url = {{ $json.imageUrl }}
  caption = {{ $json.caption }}
  access_token = {{PAGE_TOKEN}}
  (để chỗ PAGE_TOKEN cho tôi điền Page Access Token)

=== Quy tắc ===
1. Chỉ đăng khi completed === true
2. Mỗi ngày chỉ đăng 1 lần (dedup bằng khóa XSMN_${date})
3. Đăng ẢNH qua /photos (không đăng text-only /feed)
4. Sau khi tạo xong: nối 4 node theo thứ tự Schedule → GET today → Code → POST photos
5. Tôi sẽ test bằng URL có ?date=2026-09-19 trước, rồi đổi lại URL không có ?date rồi Active

Hãy tạo đầy đủ 4 node, nối dây, điền sẵn URL và code như trên.
```

---

## Sau khi chat n8n dựng xong — team làm 3 việc

1. Điền **ID Fanpage** và **mã truy cập trang** vào node đăng ảnh  
2. Chạy thử với URL có `?date=2026-09-19` → kiểm Fanpage có ảnh bảng chưa  
3. Đổi lại URL **không** có `?date=` → bật **Active**

---

## Ý nghĩa các trường máy chủ trả về

| Tên trường | Ý nghĩa tiếng Việt |
|---|---|
| `completed` | Đã đủ giải đặc biệt hết các đài? (`true` = được đăng) |
| `caption` | Nội dung chữ kèm bài Fanpage |
| `imageUrl` | Đường dẫn ảnh bảng kết quả |
| `date` | Ngày (ví dụ `19/09/2026`) |
| `stations` | Danh sách từng đài và số trúng |

---

## Phụ lục — nếu gắn tay từng ô (không dùng chat)

### A. Lịch
`15-35/2 16 * * *` · `Asia/Ho_Chi_Minh`

### B. Lấy kết quả
`GET https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today`

### C. Code
Dùng đúng khối Code trong câu lệnh chat ở trên.

### D. Đăng Fanpage
`POST https://graph.facebook.com/v19.0/{{PAGE_ID}}/photos`  
`url` = `={{ $json.imageUrl }}` · `caption` = `={{ $json.caption }}` · `access_token` = mã trang

**Đường dẫn cũ (sai, bỏ):** `https://vesophuocdanh.vn/api/ket-qua-hom-nay`

---

## Đường dẫn kiểm tra nhanh

| Mục đích | Đường dẫn |
|---|---|
| Máy chủ sống | https://kqxs-phuocdanh-api.vercel.app/api/health |
| Kết quả hôm nay | https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today |
| Thử đăng | https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today?date=2026-09-19 |
| Ảnh mẫu | https://kqxs-phuocdanh-api.vercel.app/api/kqxs/image?date=2026-09-19 |
| Kho mã | https://github.com/DanhSteve/kqxs-phuocdanh-api |

Hỏi dữ liệu / đường dẫn → **DanhSteve** · Hỏi mã Facebook → **team n8n**

Điện thoại: 091.949.4566 – 0987.494.565 · https://vesophuocdanh.vn
