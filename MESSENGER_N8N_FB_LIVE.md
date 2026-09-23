# Tin nhắn — Live ngay trên tường Fanpage

---

Anh muốn **bảng đang xổ ngay trên Fanpage** (không bấm link) → **Facebook Live Video** (RTMPS).

Realtime từng số: số nào API có → `/live` hiện → OBS stream → **Fanpage Live hiện đúng số đó** (~1–3s). n8n không sửa từng số.

Cách chuẩn:
1. n8n tạo Live trên Page → lấy `secure_stream_url`
2. OBS (Browser Source = https://kqxs-phuocdanh-api.vercel.app/live) → stream → tường **Đang phát trực tiếp**
3. Đủ ĐB → tắt Live + đăng **ảnh + caption**

Câu lệnh chat n8n đầy đủ:  
https://github.com/DanhSteve/kqxs-phuocdanh-api/blob/master/HANDOFF_N8N_FB_LIVE.md

Lưu ý: Vercel không giữ luồng video; cần OBS hoặc VPS encoder.

---
