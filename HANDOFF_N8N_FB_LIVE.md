# Chuẩn vàng — LIVE ngay trên tường Fanpage (Facebook Live Video)

## Ý bạn muốn

Bảng chữ **đang xổ realtime ngay trên Fanpage** (vòng quay thật, hiện từng chữ số) — **không** bắt khách bấm `/live`.  
**Số nào vừa có trên API → Live trên tường FB hiện đúng số đó** (trễ ~1–3 giây vì `/live` poll 1.5s + encode).

**Sau khi sổ hết số:**

1. **Để theo bài đăng** trên Fanpage (Live kết thúc → thành bài video trên tường).
2. **Giữ nguyên video đã quay** (VOD) — không xóa, không cắt lại.
3. **Nội dung chữ kèm bài:** giữ thương hiệu / hotline / địa chỉ — **không** ghi dòng giải ĐB, **không** dán bảng live đang sổ (số đã nằm trong video).

→ Field API: `captionAfterLive` (không dòng ĐB, không bảng live).  
→ Field `caption` (có dòng ĐB) chỉ dùng nếu team **đăng thêm** bài ảnh form riêng (tuỳ chọn).

Luồng realtime từng số (không qua n8n từng lần):

```
API today có số mới  →  /live tự poll 1.5s hiện số + quay
                     →  OBS/ffmpeg đang stream RTMPS
                     →  Fanpage Live Video hiện đúng số đó
```

n8n **không** sửa bài mỗi số — chỉ tạo Live lúc đầu + tắt Live (giữ VOD) + cập nhật mô tả bài bằng `captionAfterLive`.

## Thực tế kỹ thuật

| Cách | Quay thật trên tường FB? | Ghi chú |
|---|---|---|
| Sửa bài chữ mỗi 2s | Không quay CSS | Chỉ đổi chữ; khách thường phải F5 |
| Link `/live` | Quay thật **ngoài** FB | Đã có sẵn — khách phải bấm link |
| **Facebook Live Video (RTMPS)** | **Có** — đúng ý bạn | Bài “Đang phát trực tiếp” trên tường → sau đó giữ VOD |

→ Muốn **live trực tiếp trên Fanpage** = dùng **[Live Video API](https://developers.facebook.com/docs/live-video-api/)**: tạo `LiveVideo` → đẩy video RTMPS lên FB.

Điều kiện Meta (từ 2024): Page ≥ **100 followers**, tài khoản đủ tuổi, App Review quyền Live Video khi lên production.

Vercel **không** giữ luồng video dài giờ → cần **máy encoder** (OBS / VPS / Docker) chiếu trang `/live` rồi stream RTMPS.

---

## Kiến trúc chuẩn vàng

```
16:13  n8n: POST /{PAGE_ID}/live_videos?status=LIVE_NOW
         description ngắn (không bảng live, không ĐB)
         → nhận secure_stream_url + live_video_id
       Encoder: mở https://kqxs-phuocdanh-api.vercel.app/live
         (Browser Source) → stream RTMPS lên Fanpage
         → khách thấy bảng quay + từng số NGAY trên tường FB

16:15–35  /live tự poll API 1.5s (đã có) → số mới hiện dần
          Encoder tiếp tục phát

completed  n8n:
           1) end_live_video = true  → GIỮ video trên tường (VOD)
           2) cập nhật description = captionAfterLive
              (không dòng ĐB, không bảng live sổ)
           3) (tuỳ chọn) POST /photos nếu team vẫn muốn ảnh form riêng
```

Đã có sẵn nguồn hình: **`/live`** (CSS spin + từng chữ số).  
Phần còn thiếu: **n8n tạo Live + encoder đẩy RTMPS**.

---

## CÂU LỆNH DÁN VÀO CHAT n8n (Facebook Live trên tường)

```
Tạo giúp tôi bộ workflow n8n chuẩn vàng tên:
"Phước Danh – LIVE Video trên Fanpage (giữ VOD sau xổ)"

===== Ý TƯỞNG (ĐÚNG ĐỦ Ý) =====
1. LIVE VIDEO ngay trên tường Fanpage — khách thấy "Đang phát trực tiếp", KHÔNG bấm /live.
2. REALTIME TỪNG SỐ: số nào API /today vừa có → /live hiện đúng số → encoder stream → Fanpage Live hiện đúng số (~1–3s).
3. n8n KHÔNG đẩy từng số lên FB. /live tự poll 1.5s; OBS giữ RTMPS liên tục.
4. SAU KHI SỔ HẾT (completed=true):
   a) Tắt Live nhưng GIỮ NGUYÊN video đã quay trên tường (thành bài đăng VOD) — KHÔNG xóa video.
   b) Cập nhật nội dung chữ kèm bài = captionAfterLive:
      giữ thương hiệu / hotline / địa chỉ
      KHÔNG dòng giải ĐB
      KHÔNG bảng live đang sổ / liveCaption
      (số đã nằm trong video giữ nguyên)
   c) Đăng ảnh form riêng = TUỲ CHỌN (không bắt buộc nếu đã giữ VOD).

Nguồn hình: https://kqxs-phuocdanh-api.vercel.app/live
Encoder (OBS/ffmpeg): Browser Source = /live → đẩy RTMPS theo secure_stream_url.
n8n: tạo LiveVideo → (tuỳ chọn báo encoder) → chờ completed → end live (giữ VOD) → PATCH description = captionAfterLive.

===== API VERCEL (dữ liệu số) =====
GET https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today
Fields quan trọng:
  completed, stage, progressKey, date, liveBoardUrl, imageUrl
  captionAfterLive  ← dùng sau khi tắt Live (không ĐB, không bảng live)
  caption           ← chỉ nếu đăng thêm ảnh form (có dòng ĐB)
  liveCaption       ← KHÔNG dùng cho bài Live Video sau xong
Trang hình live: https://kqxs-phuocdanh-api.vercel.app/live

===== FACEBOOK LIVE VIDEO API =====
Docs: https://developers.facebook.com/docs/live-video-api/getting-started/
Tạo live trên Page:
POST https://graph.facebook.com/v19.0/{{PAGE_ID}}/live_videos
Body:
  status = LIVE_NOW
  title = KQXS Miền Nam LIVE – Phước Danh
  description = Đang xổ trực tiếp · Đại lý vé số Phước Danh · 0919.494.566
    (NGẮN — không dán bảng live, không dòng ĐB)
  access_token = {{PAGE_TOKEN}}

Response cần lấy:
  id              → live_video_id
  secure_stream_url → đưa vào OBS/ffmpeg (Server + Stream Key)

Kết thúc live (GIỮ video trên tường):
POST https://graph.facebook.com/v19.0/{{live_video_id}}
Body:
  end_live_video = true
  access_token = {{PAGE_TOKEN}}
→ Sau khi end, video vẫn còn trên Fanpage như bài đăng (VOD). Không gọi API xóa video.

Cập nhật chữ kèm bài video (sau khi end):
POST https://graph.facebook.com/v19.0/{{live_video_id}}
Body:
  description = {{ captionAfterLive }}
  access_token = {{PAGE_TOKEN}}

Quyền Page token: pages_manage_posts, pages_read_engagement
(+ App Review Live Video API khi chạy production)
Page cần ≥ 100 followers theo quy định Meta 2024.

===== WORKFLOW A — Bắt đầu LIVE (~16:13 giờ VN) =====

NODE A1 — Schedule Trigger
- Cron: 13 16 * * *
- Timezone: Asia/Ho_Chi_Minh

NODE A2 — HTTP GET
- URL: https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today

NODE A3 — HTTP POST tạo Live Video trên Fanpage
- Method: POST
- URL: https://graph.facebook.com/v19.0/{{PAGE_ID}}/live_videos
- Send body:
  status = LIVE_NOW
  title = 🔴 KQXS Miền Nam đang xổ – Phước Danh {{ $json.date }}
  description = Đang xổ trực tiếp · Đại lý vé số Phước Danh · Hotline 0919.494.566 · vesophuocdanh.vn
  access_token = {{PAGE_TOKEN}}

NODE A4 — Code lưu stream (Run Once for All Items)
```js
const store = $getWorkflowStaticData('global');
const live = $input.first().json;
const data = $('NODE A2').first().json; // đổi tên node cho khớp
store.liveVideoId = live.id;
store.secureStreamUrl = live.secure_stream_url;
store.vodFinalized = false;
store.liveDate = data.date || data.dateIso || '';
const url = live.secure_stream_url || '';
const marker = '/rtmp/';
const idx = url.indexOf(marker);
store.rtmpServer = idx >= 0 ? url.slice(0, idx + marker.length) : '';
store.streamKey = idx >= 0 ? url.slice(idx + marker.length) : url;
return [{
  json: {
    liveVideoId: store.liveVideoId,
    secureStreamUrl: store.secureStreamUrl,
    rtmpServer: store.rtmpServer,
    streamKey: store.streamKey,
    liveBoardUrl: data.liveBoardUrl || 'https://kqxs-phuocdanh-api.vercel.app/live',
    instruction: 'OBS: Browser Source = liveBoardUrl; Stream = rtmpServer + streamKey'
  }
}];
```

NODE A5 — (Tuỳ chọn) Telegram / Email / Sticky output
Gửi cho kỹ thuật: liveBoardUrl + rtmpServer + streamKey để bật OBS/ffmpeg ngay.

Sticky A:
"Sau A4 phải có encoder đang đẩy RTMPS trong < vài phút. Nguồn hình = /live. Description lúc tạo = ngắn, không bảng live."

===== ENCODER (không nằm trong n8n — bắt buộc) =====

Cách nhanh (chuẩn vàng vận hành tay 1 lần / ngày):
1. OBS Studio
2. Sources → Browser → URL = https://kqxs-phuocdanh-api.vercel.app/live
   Width 1280 Height 720 (hoặc 1920x1080), FPS 30
3. Settings → Stream:
   Service = Custom
   Server = rtmpServer (từ A4)
   Stream Key = streamKey (từ A4)
4. Start Streaming → Fanpage hiện LIVE trên tường

Cách tự động 100% (phase 2 — cần VPS, không chạy trên Vercel serverless):
- Container ffmpeg/puppeteer mở /live → pipe RTMPS theo secure_stream_url
- n8n A4 gọi webhook VPS { secureStreamUrl, liveBoardUrl } để tự Start

===== WORKFLOW B — Đủ ĐB → tắt LIVE (giữ VOD) + chữ captionAfterLive =====

NODE B1 — Schedule mỗi 10–15 giây (16:15–16:40 giờ VN)
(/live tự poll; B chỉ chờ đủ ĐB)

NODE B2 — Code khung giờ 16:15–16:40 Asia/Ho_Chi_Minh
```js
const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
const m = now.getHours() * 60 + now.getMinutes();
if (m < 16 * 60 + 15 || m > 16 * 60 + 40) return [];
return [{ json: { ok: true } }];
```

NODE B3 — HTTP GET https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today

NODE B4 — Code chỉ tiếp khi completed && chưa finalize VOD
```js
const data = $input.first().json;
const store = $getWorkflowStaticData('global');
if (!data.completed || store.vodFinalized) return [];
if (!store.liveVideoId) return [];
return [{
  json: {
    ...data,
    liveVideoId: store.liveVideoId,
    captionAfterLive: data.captionAfterLive
  }
}];
```

NODE B5 — HTTP POST kết thúc Live Video (GIỮ video trên tường)
- URL: https://graph.facebook.com/v19.0/{{ $json.liveVideoId }}
- Body:
  end_live_video = true
  access_token = {{PAGE_TOKEN}}
→ Video vẫn còn trên Fanpage như bài đăng. KHÔNG xóa.

NODE B6 — HTTP POST cập nhật mô tả bài video
- URL: https://graph.facebook.com/v19.0/{{ $json.liveVideoId }}
- Body:
  description = {{ $json.captionAfterLive }}
  access_token = {{PAGE_TOKEN}}
→ captionAfterLive = nội dung giữ thương hiệu, KHÔNG dòng ĐB, KHÔNG bảng live sổ.

NODE B7 — (TUỲ CHỌN) HTTP POST đăng ảnh bảng form — chỉ nếu team vẫn muốn bài ảnh riêng
- URL: https://graph.facebook.com/v19.0/{{PAGE_ID}}/photos
- Body:
  url = {{ $json.imageUrl }}
  caption = {{ $json.caption }}
  access_token = {{PAGE_TOKEN}}
Mặc định: BỎ NODE B7 — chỉ giữ VOD + captionAfterLive.

NODE B8 — Code
```js
const store = $getWorkflowStaticData('global');
store.vodFinalized = true;
return [{ json: { done: true, keptVod: true } }];
```

Sticky B:
"Đủ ĐB → tắt LIVE → GIỮ video đã quay → description = captionAfterLive (không ĐB, không bảng live). Ảnh form = tuỳ chọn."

===== QUY TẮC =====
1. Live trên tường Fanpage = Live Video RTMPS.
2. Hình live = /live. Số API có → /live → stream → FB hiện đúng số đó.
3. Encoder bắt buộc suốt giờ xổ.
4. Sau xong: GIỮ nguyên video đã quay (VOD trên tường) — không xóa.
5. Chữ kèm bài sau xong = captionAfterLive (không dòng ĐB, không live sổ).
6. Không dùng liveCaption làm description sau khi xong.
7. Ảnh form riêng = tuỳ chọn.
8. Để {{PAGE_ID}} {{PAGE_TOKEN}}.
9. Page ≥ 100 followers + quyền Live Video.

===== CHẠY THỬ =====
1. Execute A → lấy secure_stream_url
2. OBS Browser /live → Start Streaming → Fanpage thấy LIVE
3. Đợi/giả lập completed
4. B: end live → video vẫn trên tường → description = captionAfterLive (không ĐB)

Hãy tạo đủ node 2 workflow, sticky, để chỗ PAGE_ID/PAGE_TOKEN, ghi chú OBS tách Server/Key từ secure_stream_url.
```

---

## Việc cần làm tiếp (code / hạ tầng)

| Việc | Ai |
|---|---|
| `/live` quay + từng chữ số | **Đã có** |
| API today + `captionAfterLive` | **Đã có** |
| Workflow n8n tạo/end Live + giữ VOD + captionAfterLive | Team n8n (lệnh trên) |
| OBS hoặc VPS ffmpeg stream | Team kỹ thuật |
| (Phase 2) Worker tự stream không cần OBS | DanhSteve — cần máy luôn bật, không phải Vercel |

Hỏi API → DanhSteve · Hỏi token FB / Live → team n8n  

☎️ 091.949.4566 – 0987.494.565 · https://vesophuocdanh.vn
