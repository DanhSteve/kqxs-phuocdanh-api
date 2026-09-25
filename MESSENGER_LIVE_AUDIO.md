# Live audio + encoder

## Vercel “API nhạc” (URL tĩnh)
- File: `https://kqxs-phuocdanh-api.vercel.app/audio/xo-so-live-bed.mp3`
- Field: `musicUrl` trên `/api/kqxs/today` và `/api/kqxs-mt/today`
- Trang `/live` và `/live-mt` phát HTML5 Audio loop (có nút Bật/Tắt; Chrome có thể cần bấm “Bấm để bật nhạc nền”)
- Nguồn hiện tại: Kevin MacLeod — *Lobby Time* (Incompetech, cần attribution — xem `public/audio/SOURCE.txt`)

## Cách 1 — Bắt audio từ Browser (OBS / Puppeteer)
- OBS: Browser Source → Control audio via OBS / Monitor and Output
- Puppeteer: `--autoplay-policy=no-user-gesture-required`
- ffmpeg bắt pulse/alsa kèm video

## Cách 2 — ffmpeg lấy thẳng musicUrl (ổn định hơn, khuyến nghị GHA)
Mix nhạc loop với video trang live (không phụ thuộc autoplay Chrome):

```bash
# Ví dụ: nhạc loop + video từ x11grab / pipe
MUSIC_URL="https://kqxs-phuocdanh-api.vercel.app/audio/xo-so-live-bed.mp3"

ffmpeg -re \
  -f x11grab -video_size 1280x720 -framerate 30 -i :99.0 \
  -stream_loop -1 -i "$MUSIC_URL" \
  -c:v libx264 -preset veryfast -b:v 2500k \
  -c:a aac -b:a 128k -ar 44100 \
  -shortest \
  -f flv "$RTMPS_URL"
```

Hoặc đọc `musicUrl` từ JSON:

```bash
MUSIC_URL=$(curl -s https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today | jq -r .musicUrl)
```

## Lưu ý
Vercel chỉ host + phát trong trang. Fanpage có tiếng khi encoder (OBS/ffmpeg) đưa audio vào RTMPS.
