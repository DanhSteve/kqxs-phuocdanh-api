# Hướng dẫn team GitHub Actions — tự động có nhạc khi Live Fanpage

## Hiểu nhanh (30 giây)

- Trang `/live` trên Vercel **đã có nhạc** (`musicUrl`).
- Fanpage **không tự nghe** nhạc đó — cần **máy encoder (GHA)** nhét nhạc vào luồng video RTMPS gửi lên Facebook.
- Team GHA hiện **chưa setup nhạc** → Live FB sẽ **câm** (chỉ hình), dù mở `/live` trên máy vẫn có thể có tiếng sau khi bấm nút.

**Mục tiêu:** mỗi lần Live FB, nhạc nền **tự loop**, không cần người bấm tay.

---

## Thông tin sẵn có (không phải tìm thêm)

| Thứ | Giá trị |
|-----|---------|
| API MN | `https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today` |
| API MT | `https://kqxs-phuocdanh-api.vercel.app/api/kqxs-mt/today` |
| Field nhạc | `musicUrl` trong JSON (ví dụ `.../audio/xo-so-live-bed.mp3`) |
| Trang hình Live MN | `https://kqxs-phuocdanh-api.vercel.app/live` |
| Trang hình Live MT | `https://kqxs-phuocdanh-api.vercel.app/live-mt` |

Kiểm tra nhanh:

```bash
curl -s https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today | jq -r .musicUrl
```

Phải ra URL `.mp3` mở được (HTTP 200).

---

## Cách khuyến nghị: ffmpeg mix nhạc + video (ổn định nhất)

**Ý tưởng:** quay màn hình trang `/live` làm **hình**, lấy file MP3 từ `musicUrl` làm **tiếng**, ghép rồi đẩy RTMPS lên FB.

### Bước 1 — Trong workflow GHA, trước khi stream

Cài / đảm bảo có: `ffmpeg`, `curl`, `jq` (hầu hết image encoder đã có ffmpeg).

### Bước 2 — Lấy URL nhạc từ API

Miền Nam:

```bash
MUSIC_URL=$(curl -s https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today | jq -r .musicUrl)
```

Miền Trung (đổi API cho đúng buổi):

```bash
MUSIC_URL=$(curl -s https://kqxs-phuocdanh-api.vercel.app/api/kqxs-mt/today | jq -r .musicUrl)
```

Kiểm tra:

```bash
echo "$MUSIC_URL"
# phải là https://kqxs-phuocdanh-api.vercel.app/audio/xo-so-live-bed.mp3
```

### Bước 3 — Mở trang `/live` để có hình (như team đang làm)

Giữ nguyên phần hiện tại: Xvfb / Chrome / Puppeteer mở `liveBoardUrl` hoặc `/live`.

**Không cần** bấm nút “Bật nhạc nền” trên trang nếu dùng cách ffmpeg mix file (Bước 4).

### Bước 4 — Sửa lệnh ffmpeg: thêm input nhạc loop

Giả sử team đang bắt màn hình display `:99.0` và đã có `RTMPS_URL` (hoặc `secure_stream_url` từ Facebook Live API):

```bash
ffmpeg -re \
  -f x11grab -video_size 1280x720 -framerate 30 -i :99.0 \
  -stream_loop -1 -i "$MUSIC_URL" \
  -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -preset veryfast -b:v 2500k -pix_fmt yuv420p \
  -c:a aac -b:a 128k -ar 44100 \
  -shortest \
  -f flv "$RTMPS_URL"
```

Giải thích ngắn:

- Input 0 = hình từ màn hình `/live`
- Input 1 = nhạc MP3, `-stream_loop -1` = lặp vô hạn
- `-map 0:v:0 -map 1:a:0` = lấy **video** từ màn hình, **audio** từ file nhạc (không lấy audio trình duyệt)

### Bước 5 — Đẩy lên Facebook

`RTMPS_URL` vẫn lấy như cũ từ Graph API `live_videos` → `secure_stream_url`.  
Chỉ đổi phần audio của ffmpeg như Bước 4.

### Bước 6 — Test trước khi giờ xổ

1. Tạo 1 Live thử (hoặc RTMPS test).
2. Chạy workflow.
3. Vào Fanpage / xem preview Live → **phải nghe nhạc nền loop**.
4. Tắt nhạc trên máy local không ảnh hưởng — tiếng đi trong stream.

Checklist đạt:

- [ ] `musicUrl` lấy được từ API
- [ ] ffmpeg có `-stream_loop -1 -i "$MUSIC_URL"`
- [ ] `-map` đúng: video = màn hình, audio = MP3
- [ ] Fanpage Live nghe được nhạc, không bị câm

---

## Cách dự phòng: bắt tiếng từ trình duyệt

Chỉ dùng nếu **chưa** mix được `musicUrl` bằng ffmpeg.

1. Chrome/Puppeteer thêm flag: `--autoplay-policy=no-user-gesture-required`
2. OBS/ffmpeg bắt audio của browser (pulse/alsa), không tắt “Control audio” / Monitor and Output
3. Có thể cần click nút “Bấm để bật nhạc nền” bằng Puppeteer nếu Chrome vẫn chặn

**Không ổn định bằng Cách khuyến nghị** — nên ưu tiên mix `musicUrl`.

---

## Việc team GHA cần làm (tóm tắt giao việc)

1. Mở workflow / script ffmpeg hiện tại (đang stream `/live` → RTMPS).
2. Thêm đoạn lấy `MUSIC_URL` từ API (Bước 2).
3. Thêm `-stream_loop -1 -i "$MUSIC_URL"` + `-map` video/audio (Bước 4).
4. Chạy thử 1 lần Live → xác nhận Fanpage có tiếng.
5. Báo lại khi xong.

**Không cần** sửa code Vercel thêm cho nhạc — API + file MP3 đã sẵn.

---

## Lưu ý

- Đổi bài nhạc sau này: đổi file trên Vercel → `musicUrl` đổi → GHA **tự lấy URL mới** (không hard-code đường dẫn cũ nếu dùng `jq .musicUrl`).
- Không rip YouTube; chỉ dùng `musicUrl` đã host.
- Vercel chỉ host trang + file nhạc; **tiếng trên FB = 100% do GHA/ffmpeg**.
