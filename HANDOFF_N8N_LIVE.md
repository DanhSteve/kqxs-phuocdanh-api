# Plan + lệnh n8n — Live bảng chữ → Fanpage (rồi ảnh cuối)

## Chốt sản phẩm

1. **Lúc đang xổ:** chỉ bài **bảng chữ** (khung cấu trúc form Phước Danh)  
   - Ô chưa có số → `🔄` (vòng tròn quay)  
   - Có số → thay `🔄` bằng số thật  
   - G.8 / ĐB nhấn `🔴` · hàng ĐB có `🟡`
2. **Khi đủ giải đặc biệt (`completed`):** **bắt buộc** đăng bài **ảnh bảng form** + `caption` chuẩn (như ảnh mẫu đăng Fanpage).

API: `GET https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today`  
Field live: `liveCaption` · `progressKey` · `stage` · `completed` · `caption` · `imageUrl`

---

## Luồng

```
~16:13   Đăng bài chữ sườn (liveCaption — toàn 🔄)
16:15–35 Mỗi ~30s: GET today → nếu progressKey đổi → SỬA message = liveCaption mới
completed  Sửa chữ lần cuối + POST /photos (imageUrl + caption) 1 lần → dừng
```

---

## CÂU LỆNH DÁN VÀO CHAT n8n

```
Tạo giúp tôi workflow n8n tên: "Phước Danh – KQXS LIVE bảng chữ → ảnh cuối".

Mục tiêu:
A) Trước giờ xổ đăng bài CHỮ dạng bảng (liveCaption) — ô trống là emoji 🔄.
B) Đang xổ: mỗi 30 giây gọi API; có số mới thì SỬA cùng bài (thêm số vào bảng chữ).
C) Khi completed === true: đăng ẢNH bảng form Phước Danh + caption chuẩn một lần rồi dừng.
Không đăng ảnh trong lúc đang live.

API:
GET https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today
Dùng: liveCaption, progressKey, stage, completed, caption, imageUrl, date

=== WORKFLOW A — Sườn chữ (~16:13) ===
1) Schedule: Cron `13 16 * * *` · Asia/Ho_Chi_Minh
2) HTTP GET today
3) HTTP POST https://graph.facebook.com/v19.0/{{PAGE_ID}}/feed
   message = {{ $json.liveCaption }}
   access_token = {{PAGE_TOKEN}}
4) Code lưu:
   const store = $getWorkflowStaticData('global');
   store.livePostId = $input.first().json.id;
   store.lastProgressKey = '';
   store.photoPosted = false;
   return [{ json: store }];

=== WORKFLOW B — Cập nhật chữ + ảnh cuối ===
1) Schedule mỗi 30 giây
2) Code chỉ chạy 16:15–16:35 giờ VN:
   const now = new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Ho_Chi_Minh'}));
   const m = now.getHours()*60+now.getMinutes();
   if (m < 16*60+15 || m > 16*60+35) return [];
   return $input.all();
3) HTTP GET today
4) Code:
   const data = $input.first().json;
   const store = $getWorkflowStaticData('global');
   if (!store.livePostId) return [];
   const changed = store.lastProgressKey !== data.progressKey;
   store.lastProgressKey = data.progressKey;
   const needPhoto = data.completed && !store.photoPosted;
   if (!changed && !needPhoto) return [];
   return [{ json: { ...data, livePostId: store.livePostId, needPhoto } }];
5) HTTP POST https://graph.facebook.com/v19.0/{{ $json.livePostId }}
   message = {{ $json.liveCaption }}
   access_token = {{PAGE_TOKEN}}
6) IF needPhoto:
   HTTP POST https://graph.facebook.com/v19.0/{{PAGE_ID}}/photos
   url = {{ $json.imageUrl }}
   caption = {{ $json.caption }}
   access_token = {{PAGE_TOKEN}}
   rồi Code: $getWorkflowStaticData('global').photoPosted = true;

Quyền: pages_manage_posts, pages_read_engagement · Page token · cùng app tạo/sửa bài.
Để chỗ PAGE_ID và PAGE_TOKEN.
```

---

## Kiểm tra nhanh

| URL | Mục đích |
|---|---|
| https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today | Live hôm nay (`liveCaption` có 🔄) |
| https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today?date=2026-09-19 | Mẫu đủ số |
| https://kqxs-phuocdanh-api.vercel.app/api/kqxs/image?date=2026-09-19 | Ảnh bảng cuối |

Console: https://kqxs-phuocdanh-api.vercel.app

Hỏi API → DanhSteve · Hỏi Fanpage token → team n8n  
☎️ 091.949.4566 – 0987.494.565 · https://vesophuocdanh.vn
