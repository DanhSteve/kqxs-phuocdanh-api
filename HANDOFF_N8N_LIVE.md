# Hướng dẫn + câu lệnh chuẩn vàng — LIVE gần realtime → Fanpage Phước Danh

Bảng điều khiển: https://kqxs-phuocdanh-api.vercel.app  
**LIVE quay thật (vòng CSS + hiện từng chữ số):** https://kqxs-phuocdanh-api.vercel.app/live  
API: https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today

---

## Ý tưởng đã chốt (đọc trước khi dán lệnh)

1. **~1–2 phút trước giờ xổ:** n8n đăng **bài chữ sườn** (`liveCaption`) — có khung bảng + link `/live`.
2. **Đang xổ:** mỗi **2 giây** gọi Vercel; có số mới (`progressKey` đổi) → **SỬA cùng bài** (thêm số vào bảng chữ).  
   Khách xem **vòng tròn quay thật + từng chữ số (vd 7→77→778)** tại trang `/live` (Fanpage không chạy CSS trong chữ bài viết).
3. **Đủ giải đặc biệt (`completed === true`):** đăng **1 bài ẢNH bảng form Phước Danh** + `caption` chuẩn → dừng.  
   **Không** đăng ảnh trong lúc đang live.

Vercel chỉ cào khi n8n gọi. Nguồn: `vesophuocdanh.vn/api/xsmn/live`.

### Field API dùng

| Field | Ý nghĩa |
|---|---|
| `liveCaption` | Bảng chữ + link `/live` |
| `liveBoardUrl` | https://…/live |
| `progressKey` | Đổi khi có số mới |
| `stage` | `waiting` · `live` · `completed` |
| `completed` | Đủ ĐB → được đăng ảnh |
| `caption` | Nội dung bài ảnh cuối |
| `imageUrl` | Ảnh bảng form |
| `date` / `dateIso` | Ngày |

---

## CÂU LỆNH DÁN VÀO CHAT n8n (copy nguyên khối)

> Mở **chat n8n** → dán **toàn bộ** đoạn trong khung dưới → Enter.  
> Sau đó gắn `PAGE_ID` + **Page Access Token** → Active.  
> Quyền: `pages_manage_posts`, `pages_read_engagement`. Đúng **Page token**. App tạo bài phải là app sửa bài.

```
Tạo giúp tôi ĐỦ 2 workflow n8n (hoặc 1 workflow 2 nhánh Schedule) cho Đại lý vé số Phước Danh.

Tên gợi ý:
- "Phước Danh – LIVE A · Đăng sườn chữ"
- "Phước Danh – LIVE B · Cập nhật 2s + ảnh cuối"

===== MỤC TIÊU =====
A) ~16:13 giờ VN: đăng bài CHỮ sườn lên Fanpage.
   - message = field liveCaption từ API (đã có khung bảng + link trang LIVE quay thật).
   - Ô chưa có số trên trang /live sẽ QUAY vòng tròn CSS thật; có số thì hiện TỪNG CHỮ SỐ (vd G.7 = 778 → 7 rồi 77 rồi 778).
B) 16:15–16:35: mỗi 2 GIÂY (không phải 30 giây) gọi API;
   nếu progressKey đổi thì SỬA cùng bài chữ (message = liveCaption mới).
C) Khi completed === true và chưa đăng ảnh: đăng ẢNH bảng form 1 lần (url=imageUrl, caption=caption) rồi dừng.
D) Không scrape web — chỉ GET API Vercel. Không đăng ảnh lúc đang live.

===== API =====
Method: GET
URL chạy thật:
  https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today
URL thử (ngày đã đủ số):
  https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today?date=2026-09-19

Response quan trọng:
  liveCaption, liveBoardUrl, progressKey, stage, completed, caption, imageUrl, date, dateIso, stations

Trang LIVE quay thật (gắn trong liveCaption, khách bấm vào):
  https://kqxs-phuocdanh-api.vercel.app/live

===== WORKFLOW A — Đăng sườn chữ (~16:13) =====

NODE A1 — Schedule Trigger
- Cron: 13 16 * * *
- Timezone: Asia/Ho_Chi_Minh
(Mỗi ngày 16:13 chạy 1 lần)

NODE A2 — HTTP Request · Lấy kết quả
- Method: GET
- URL: https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today
- Response format: JSON

NODE A3 — HTTP Request · Đăng bài chữ Fanpage
- Method: POST
- URL: https://graph.facebook.com/v19.0/{{PAGE_ID}}/feed
- Body (form / x-www-form-urlencoded hoặc JSON):
  message = {{ $json.liveCaption }}
  access_token = {{PAGE_TOKEN}}
- Link LIVE nằm sẵn trong liveCaption; có thể thêm ở đầu message nếu muốn:
  "▶️ Xem bảng quay THẬT: " + $json.liveBoardUrl + "\n\n" + $json.liveCaption

NODE A4 — Code · Lưu post id (Run Once for All Items)
```js
const store = $getWorkflowStaticData('global');
const fb = $input.first().json;
const data = $('NODE A2').first().json; // đổi tên cho khớp node GET thật
store.livePostId = fb.id; // dạng PAGEID_POSTID
store.liveDate = data.date || data.dateIso || '';
store.lastProgressKey = '';
store.photoPosted = false;
return [{ json: { livePostId: store.livePostId, liveBoardUrl: data.liveBoardUrl } }];
```

Sticky note Workflow A:
"Sườn chữ + link /live. Chưa đăng ảnh."

===== WORKFLOW B — Poll 2 giây + sửa chữ + ảnh cuối =====

NODE B1 — Schedule Trigger
- Interval: every 2 seconds
  (hoặc Cron dày tương đương; n8n Cloud: Schedule → Seconds interval = 2)
- Timezone: Asia/Ho_Chi_Minh

NODE B2 — Code · Chỉ chạy khung 16:15–16:35 giờ Việt Nam
Mode: Run Once for All Items
```js
const now = new Date(
  new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
);
const minutes = now.getHours() * 60 + now.getMinutes();
const start = 16 * 60 + 15; // 16:15
const end = 16 * 60 + 35;   // 16:35
if (minutes < start || minutes > end) {
  return []; // ngoài khung → không gọi API / không spam FB
}
return [{ json: { ok: true, at: now.toISOString() } }];
```

NODE B3 — HTTP Request · Lấy kết quả
- Method: GET
- URL: https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today

NODE B4 — Code · So progressKey + quyết định update / đăng ảnh
Mode: Run Once for All Items
```js
const data = $input.first().json;
const store = $getWorkflowStaticData('global');

if (!store.livePostId) {
  // Chưa có sườn (A chưa chạy) → bỏ qua
  return [];
}

const changed = store.lastProgressKey !== data.progressKey;
store.lastProgressKey = data.progressKey;

const needPhoto = data.completed === true && !store.photoPosted;

// Không đổi số và chưa cần ảnh → im lặng
if (!changed && !needPhoto) {
  return [];
}

return [
  {
    json: {
      ...data,
      livePostId: store.livePostId,
      needUpdateText: changed || needPhoto,
      needPhoto,
    },
  },
];
```

NODE B5 — HTTP Request · Sửa bài chữ (cùng post)
- Chỉ chạy khi needUpdateText (dùng IF node hoặc luôn gọi khi B4 có output)
- Method: POST
- URL: https://graph.facebook.com/v19.0/{{ $json.livePostId }}
- Body:
  message = {{ $json.liveCaption }}
  access_token = {{PAGE_TOKEN}}

NODE B6 — IF · needPhoto === true

NODE B7 — HTTP Request · Đăng ảnh bảng form (1 lần / ngày)
- Method: POST
- URL: https://graph.facebook.com/v19.0/{{PAGE_ID}}/photos
- Body:
  url = {{ $json.imageUrl }}
  caption = {{ $json.caption }}
  access_token = {{PAGE_TOKEN}}

NODE B8 — Code · Đánh dấu đã đăng ảnh
```js
const store = $getWorkflowStaticData('global');
store.photoPosted = true;
return [{ json: { photoPosted: true, at: new Date().toISOString() } }];
```

Sticky note Workflow B:
"Poll 2 giây. Live chữ + link /live. Đủ ĐB mới đăng ảnh. Cùng app với workflow A."

===== QUY TẮC BẮT BUỘC =====
1. Interval cập nhật live: 2 giây (không 30 giây).
2. Ngoài 16:15–16:35: không poll / không gọi Facebook.
3. Chỉ đăng ảnh khi completed === true; mỗi ngày tối đa 1 ảnh (photoPosted).
4. Không scrape vesophuocdanh.vn từ n8n — chỉ gọi Vercel.
5. PAGE_ID và PAGE_TOKEN để chỗ điền; dùng Page Access Token dài hạn.
6. Quyền: pages_manage_posts + pages_read_engagement.
7. Bài chữ phải do cùng Facebook App tạo thì mới sửa được (POST /{post-id}).

===== CÁCH CHẠY THỬ =====
1. Tạm tắt Schedule A/B; Execute Workflow A thủ công 1 lần → kiểm Fanpage có bài chữ + link /live.
2. Mở https://kqxs-phuocdanh-api.vercel.app/live → thấy vòng quay CSS; khi có số thì hiện từng chữ.
3. Execute B vài lần (hoặc bật Schedule 2s trong khung giờ) → sửa bài khi API đổi số.
4. Thử URL ?date=2026-09-19 để completed=true → kiểm có bài ẢNH bảng + caption.
5. Đổi lại URL không ?date → Active cả 2 workflow trước ngày xổ thật.

Hãy tạo đầy đủ node, nối dây đúng thứ tự, đặt tên node rõ, thêm sticky note, để chỗ {{PAGE_ID}} và {{PAGE_TOKEN}}.
```

---

## Kiểm tra nhanh

| Mục đích | URL |
|---|---|
| API hôm nay | https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today |
| API mẫu đủ số | https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today?date=2026-09-19 |
| LIVE quay thật | https://kqxs-phuocdanh-api.vercel.app/live |
| Ảnh bảng mẫu | https://kqxs-phuocdanh-api.vercel.app/api/kqxs/image?date=2026-09-19 |
| Console | https://kqxs-phuocdanh-api.vercel.app |

Hỏi API / Vercel → **DanhSteve**  
Hỏi Fanpage token / n8n → **team n8n**

☎️ 091.949.4566 – 0987.494.565 · https://vesophuocdanh.vn
