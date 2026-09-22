# Hướng dẫn team n8n — Đăng kết quả xổ số lên Fanpage Phước Danh

Đường dẫn lấy dữ liệu đã sẵn. Team n8n **không cần lấy dữ liệu từ web** — chỉ **dán form câu lệnh** bên dưới vào n8n rồi bật chạy tự động.

Bảng điều khiển (sao chép đường dẫn, xem thử): https://kqxs-phuocdanh-api.vercel.app

---

## Form câu lệnh — quăng lên n8n là chạy

Ghép **4 bước** theo thứ tự. Team chỉ cần điền `PAGE_ID` và mã truy cập Fanpage.

### Bước A — Lịch chạy (Schedule Trigger)

| Ô | Dán vào |
|---|---|
| Biểu thức lịch (Cron) | `15-35/2 16 * * *` |
| Múi giờ | `Asia/Ho_Chi_Minh` |

→ Chạy mỗi 2 phút trong khung **16:15–16:35** giờ Việt Nam.

---

### Bước B — Lấy kết quả (HTTP Request)

| Ô | Dán vào |
|---|---|
| Method | `GET` |
| URL (chạy thật) | `https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today` |
| URL (thử 1 lần) | `https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today?date=2026-09-19` |

**Đường dẫn cũ (sai, bỏ):** `https://vesophuocdanh.vn/api/ket-qua-hom-nay`

---

### Bước C — Lọc + chống đăng trùng (Code node)

Mode: **Run Once for All Items**. Dán nguyên khối:

```js
const data = $input.first().json;

// Chưa đủ giải đặc biệt → dừng, chờ lần chạy sau
if (!data.completed) {
  return [];
}

// Chống đăng trùng trong cùng một ngày
const store = $getWorkflowStaticData('global');
const key = `XSMN_${data.date}`;
if (store[key]) {
  return [];
}
store[key] = true;

return [
  {
    json: {
      date: data.date,
      dateIso: data.dateIso,
      completed: data.completed,
      caption: data.caption,
      imageUrl: data.imageUrl,
      station_count: data.station_count,
      stations: data.stations,
    },
  },
];
```

---

### Bước D — Đăng ảnh lên Fanpage (HTTP Request)

| Ô | Dán vào |
|---|---|
| Method | `POST` |
| URL | `https://graph.facebook.com/v19.0/{{ $env.FB_PAGE_ID }}/photos` |
| Content type | Form-Data / Body (x-www-form-urlencoded cũng được) |

**Thân gửi (Body) — từng dòng:**

| Tên tham số | Giá trị (dán nguyên) |
|---|---|
| `url` | `={{ $json.imageUrl }}` |
| `caption` | `={{ $json.caption }}` |
| `access_token` | `={{ $env.FB_PAGE_TOKEN }}` |

> Nếu team không dùng biến môi trường: thay `FB_PAGE_ID` bằng ID trang, `FB_PAGE_TOKEN` bằng mã truy cập trang Fanpage (team tự giữ bí mật).

**Công thức rút gọn (Expression):**

```
URL ảnh:     {{ $json.imageUrl }}
Nội dung bài: {{ $json.caption }}
```

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

## Thứ tự bật chạy (khuyến nghị)

1. Dán **URL thử** ở bước B → bấm **chạy thử** một lần  
2. Kiểm Fanpage đã có **ảnh bảng kết quả** chưa  
3. Đổi lại **URL chạy thật** (bỏ `?date=...`)  
4. Bật lịch (Active)

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
