# Live gần realtime — vòng quay thật + hiện từng chữ số

## Giới hạn Facebook (quan trọng)

Bài chữ Fanpage **không chạy CSS** → emoji `🔄` đứng im.  
Muốn **vòng tròn quay thật** + hiện `7 → 77 → 778`: dùng trang LIVE HTML.

| Thành phần | URL / cách |
|---|---|
| **LIVE quay thật** | https://kqxs-phuocdanh-api.vercel.app/live |
| API JSON | https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today |
| Poll n8n | **mỗi 2 giây** (không 30s) trong 16:15–16:35 |
| Khi đủ ĐB | Đăng **ảnh bảng** + `caption` chuẩn |

`liveCaption` có link `/live` + bảng chữ (spinner `⠋⠙⠹…` đổi mỗi lần poll).

---

## Luồng

```
~16:13  Đăng bài chữ (liveCaption) có link /live
16:15–35  Mỗi 2 giây: GET today → progressKey đổi → SỬA message
          Khách mở /live xem vòng quay CSS + từng chữ số hiện dần
completed  POST /photos (imageUrl + caption) 1 lần
```

Trang `/live`: poll API 1.5s, ô trống = vòng CSS quay liên tục, có số = hiện từng chữ ~350ms/chữ.

---

## CÂU LỆNH DÁN CHAT n8n

```
Tạo workflow "Phước Danh – LIVE gần realtime".

1) ~16:13: GET https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today
   POST /{PAGE_ID}/feed · message = liveCaption (đã có link /live)
   Lưu post id vào staticData.

2) Schedule mỗi 2 GIÂY (không 30 giây). Chỉ chạy 16:15–16:35 giờ VN.
   GET today → nếu progressKey đổi → POST /{postId} message=liveCaption mới.

3) Khi completed && chưa đăng ảnh:
   POST /{PAGE_ID}/photos · url=imageUrl · caption=caption
   Đánh dấu photoPosted=true.

Nhắc trong sticky: khách xem vòng quay THẬT tại liveBoardUrl (/live).
Để PAGE_ID + PAGE_TOKEN.
```

Chi tiết node giống bản trước trong git history; đổi interval **30s → 2s**.

---

☎️ 091.949.4566 · https://vesophuocdanh.vn
