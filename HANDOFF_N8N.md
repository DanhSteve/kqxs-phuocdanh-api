# Hướng dẫn team n8n — Đăng kết quả xổ số lên Fanpage Phước Danh

Đường dẫn lấy dữ liệu đã sẵn trên máy chủ. Team n8n **không cần lấy dữ liệu từ web**, chỉ cần gọi đường dẫn bên dưới rồi đăng Fanpage.

Bảng điều khiển (sao chép đường dẫn, xem thử): https://kqxs-phuocdanh-api.vercel.app

---

## Bước 1 — Đổi đường dẫn lấy dữ liệu (bắt buộc)

Trong n8n, tìm bước **lấy dữ liệu từ web** (ô nhập địa chỉ).

**Đường dẫn cũ (sai, bị lỗi):**
```
https://vesophuocdanh.vn/api/ket-qua-hom-nay
```

**Đường dẫn mới (đúng):**
```
https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today
```

Cách gọi: lấy dữ liệu (GET). Máy chủ trả về một gói thông tin có cấu trúc (các trường bên dưới).

---

## Bước 2 — Chỉ đăng khi đã đủ kết quả

Trong bước xử lý mã, thêm điều kiện:

```js
const data = $input.first().json;
if (!data.completed) return []; // chưa đủ giải đặc biệt → chờ lần chạy sau
```

Ý nghĩa các trường trong dữ liệu trả về:

| Tên trường | Ý nghĩa tiếng Việt |
|---|---|
| `completed` | Đã đủ giải đặc biệt hết các đài? (`true` = được đăng) |
| `caption` | Nội dung chữ kèm bài Fanpage |
| `imageUrl` | Đường dẫn ảnh bảng kết quả |
| `date` | Ngày (ví dụ `19/09/2026`) |
| `stations` | Danh sách từng đài và số trúng |

Gợi ý chống đăng trùng trong ngày: khóa `XSMN_${data.date}`

---

## Bước 3 — Đăng ảnh bảng lên Fanpage

Gọi Facebook:

`POST https://graph.facebook.com/v19.0/{{PAGE_ID}}/photos`

| Tham số | Giá trị |
|---|---|
| `url` | `={{ $json.imageUrl }}` (đường dẫn ảnh) |
| `caption` | `={{ $json.caption }}` (nội dung bài) |
| `access_token` | Mã truy cập trang Fanpage (team tự cấu hình) |

---

## Bước 4 — Thử đăng 1 lần trước khi bật lịch

1. Tạm thời đổi đường dẫn lấy dữ liệu thành:
   ```
   https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today?date=2026-09-19
   ```
2. Bấm **chạy thử** (Execute) một lần
3. Kiểm tra Fanpage đã có **ảnh bảng kết quả** chưa
4. Đổi lại đường dẫn **không** có `?date=...` (đường dẫn chính)
5. Bật lịch chạy tự động

---

## Bước 5 — Lịch chạy đề xuất

- Biểu thức lịch: `15-35/2 16 * * *` (mỗi 2 phút trong khung 16:15–16:35)
- Múi giờ: `Asia/Ho_Chi_Minh`
- Mỗi ngày chỉ đăng **một** bài (chống trùng)

---

## Đường dẫn kiểm tra nhanh

| Mục đích | Đường dẫn |
|---|---|
| Kiểm tra máy chủ sống | https://kqxs-phuocdanh-api.vercel.app/api/health |
| Kết quả hôm nay | https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today |
| Kết quả mẫu (thử đăng) | https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today?date=2026-09-19 |
| Ảnh mẫu | https://kqxs-phuocdanh-api.vercel.app/api/kqxs/image?date=2026-09-19 |
| Kho mã nguồn | https://github.com/DanhSteve/kqxs-phuocdanh-api |

Hỏi dữ liệu / đường dẫn máy chủ → **DanhSteve**  
Hỏi cấu hình n8n / mã Facebook → **team n8n**

Điện thoại thương hiệu: 091.949.4566 – 0987.494.565 · https://vesophuocdanh.vn
