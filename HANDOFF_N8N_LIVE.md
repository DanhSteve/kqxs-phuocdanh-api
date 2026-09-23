# Plan + lệnh n8n — Live đang xổ lên Fanpage Phước Danh

Ý tưởng team (Khoa + Danh): **không chờ đủ giải mới đăng**, mà trước giờ xổ đăng **sườn bài**, lúc đang sổ Vercel cào live → n8n **cập nhật dần** lên Fanpage.

---

## 1. Phân tích thực tế (Facebook + n8n)

### Việc Fanpage **làm được** (Graph API)

| Việc | Cách | Ghi chú |
|---|---|---|
| Đăng bài chữ (sườn) | `POST /{PAGE_ID}/feed` + `message` | Tạo “khung live” trước giờ xổ |
| **Sửa bài đã đăng** | `POST /{PAGE_POST_ID}` + `message` mới | Chỉ sửa được bài do **cùng app** tạo ([docs Page Post](https://developers.facebook.com/docs/graph-api/reference/page-post/)) |
| Đăng ảnh bảng cuối | `POST /{PAGE_ID}/photos` + `url` + `caption` | Giữ như luồng cũ khi `completed === true` |

### Việc Fanpage **không làm tốt**

- **Không** thay ảnh trong cùng 1 bài photo như “quay tròn GIF” thật sự qua API.
- Facebook Live Video = livestream video (nặng, cần encoder) — **không** phải hướng MVP.
- Đăng ảnh mới mỗi 20 giây = spam tường → không nên.

### Kết luận kiến trúc MVP (chốt)

**Live = bảng chữ, thêm số dần — không đăng ảnh lúc đang sổ.**

```
~16:13  n8n đăng BÀI CHỮ sườn (⏳ chuẩn bị xổ / khung đài)
16:15–35  mỗi 20–30s: gọi Vercel → nếu progressKey đổi → SỬA message = liveCaption (thêm số)
completed  (tuỳ chọn) ĐĂNG ẢNH bảng form 1 lần — hoặc chỉ sửa chữ lần cuối rồi dừng
```

Người xem Fanpage thấy bài **cập nhật số dần bằng chữ**. Ảnh bảng đẹp chỉ (nếu muốn) sau khi đủ ĐB.

Vercel **vẫn chỉ cào khi được gọi** (on-demand từ n8n). Nguồn: `vesophuocdanh.vn/api/xsmn/live`.

---

## 2. Plan code phía Vercel (đã / sẽ)

### Đã bổ sung trong API `/api/kqxs/today`

| Field | Ý nghĩa |
|---|---|
| `stage` | `waiting` · `live` · `completed` |
| `progressKey` | Đổi khi có số mới → n8n biết cần update |
| `liveCaption` | Nội dung chữ cập nhật dần |
| `completed` | Như cũ — đủ ĐB mới đăng ảnh |
| `caption` / `imageUrl` | Như cũ — bài ảnh cuối |

### Việc code tiếp (nếu cần phase 2)

1. Cache ảnh ngắn hơn khi `stage=live` (cache-bust `imageUrl?t=`).
2. Console: hiện `stage` + nút “xem liveCaption”.
3. (Tuỳ chọn) Comment ảnh từng bước lên bài sườn — nặng hơn, chưa cần MVP.

Luồng đăng ảnh cuối **giữ nguyên** HANDOFF cũ.

---

## 3. Lịch n8n đề xuất

| Thời điểm | Cron (Asia/Ho_Chi_Minh) | Việc |
|---|---|---|
| 16:13 | `13 16 * * *` (1 lần) | Tạo bài sườn `feed` → lưu `post_id` |
| 16:15–16:35 | `*/30 15-35 16 * * *` hoặc Schedule mỗi 30s trong khung | Poll Vercel → update `message` nếu `progressKey` đổi |
| Khi `completed` | trong vòng poll | Update cuối + POST `/photos` 1 lần → dừng |

> n8n Cloud: dùng **Schedule** mỗi 30 giây + Code lọc khung giờ 16:15–16:35, hoặc 2 workflow (A: tạo sườn, B: poll update).

---

## 4. CÂU LỆNH DÁN VÀO CHAT n8n (LIVE — chạy thử)

> Copy nguyên khối → chat n8n. Gắn `PAGE_ID` + Page Access Token.  
> Quyền cần: `pages_manage_posts`, `pages_read_engagement` · dùng **Page token**.

```
Tạo giúp tôi workflow n8n tên: "Phước Danh – KQXS LIVE → Fanpage".

Mục tiêu: trước giờ xổ đăng bài CHỮ sườn; trong lúc đang sổ gọi API Vercel mỗi 30 giây; mỗi khi có số mới thì SỬA cùng bài đó (message = liveCaption); khi completed === true thì đăng ẢNH bảng một lần rồi dừng.

API (không scrape web):
GET https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today
Fields dùng: stage, progressKey, liveCaption, completed, caption, imageUrl, date

=== WORKFLOW A — Tạo sườn (chạy 1 lần ~16:13) ===
1) Schedule Trigger: Cron `13 16 * * *` · Timezone Asia/Ho_Chi_Minh
2) HTTP GET today (URL trên)
3) HTTP POST tạo bài chữ:
   URL: https://graph.facebook.com/v19.0/{{PAGE_ID}}/feed
   Body:
     message = {{ $json.liveCaption }}
     access_token = {{PAGE_TOKEN}}
4) Code lưu post_id vào static data:
   const store = $getWorkflowStaticData('global');
   const res = $input.first().json;
   store.livePostId = res.id; // dạng PAGEID_POSTID
   store.liveDate = $json.date; // hoặc từ node GET
   store.lastProgressKey = '';
   store.photoPosted = false;
   return [{ json: { livePostId: store.livePostId } }];

=== WORKFLOW B — Poll live + update + ảnh cuối ===
1) Schedule Trigger: mỗi 30 giây (hoặc Cron dày trong 16:15–16:35)
2) Code chỉ chạy trong khung giờ:
   const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
   const hm = now.getHours() * 60 + now.getMinutes();
   if (hm < 16*60+15 || hm > 16*60+35) return [];
   return $input.all();
3) HTTP GET https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today
4) Code quyết định:
   const data = $input.first().json;
   const store = $getWorkflowStaticData('global');
   if (!store.livePostId) return []; // chưa có sườn
   if (store.lastProgressKey === data.progressKey && !data.completed) return [];
   store.lastProgressKey = data.progressKey;
   return [{ json: { ...data, livePostId: store.livePostId, photoPosted: !!store.photoPosted } }];
5) HTTP POST cập nhật bài chữ:
   URL: https://graph.facebook.com/v19.0/{{ $json.livePostId }}
   Body:
     message = {{ $json.liveCaption }}
     access_token = {{PAGE_TOKEN}}
6) (TUỲ CHỌN) IF data.completed === true AND muốn đăng ảnh bảng:
   HTTP POST ảnh một lần rồi store.photoPosted = true.
   Nếu chỉ live bằng chữ: bỏ bước này — chỉ cập nhật liveCaption lần cuối rồi dừng.

Quy tắc:
- Không đăng ảnh khi chưa completed
- Mỗi ngày 1 sườn + 1 ảnh cuối (dedup bằng store.liveDate / photoPosted)
- App Facebook tạo sườn phải là app sửa bài (cùng app)

Hãy tạo đủ node, nối dây, để chỗ PAGE_ID và PAGE_TOKEN.
```

---

## 5. Cách chạy thử (gửi anh Khoa)

1. Vào [Bảng điều khiển](https://kqxs-phuocdanh-api.vercel.app) → **Mẫu 19/09/2026** → xem JSON có `stage`, `progressKey`, `liveCaption`.
2. Import / chat n8n dựng 2 workflow ở mục 4.
3. **Test tay:** chạy Workflow A một lần → Fanpage có bài sườn.
4. Đổi tạm URL GET thành ngày đang live hoặc mock: mỗi lần sửa `progressKey` (hoặc đợi giờ xổ thật) → Workflow B sửa message.
5. Khi `completed` → kiểm Fanpage có **ảnh bảng**.

API kiểm tra nhanh:

```
https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today
https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today?date=2026-09-19
```

---

## 6. Phân công

| Việc | Ai |
|---|---|
| API `stage` / `progressKey` / `liveCaption` | DanhSteve (Vercel) |
| Workflow A+B n8n + Page token | Team n8n |
| Giờ xổ / nội dung sườn thương hiệu | Khoa + Danh thống nhất |

Hỏi API → **DanhSteve** · Hỏi Fanpage token → **team n8n**

Điện thoại: 091.949.4566 – 0987.494.565 · https://vesophuocdanh.vn
