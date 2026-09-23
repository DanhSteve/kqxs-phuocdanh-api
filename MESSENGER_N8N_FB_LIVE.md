# Tin nhắn — Live ngay trên tường Fanpage

---

Anh muốn **bảng đang xổ ngay trên Fanpage** (không bấm link) → phải dùng **Facebook Live Video** (RTMPS), không phải sửa bài chữ.

Cách chuẩn:
1. n8n tạo Live trên Page → lấy `secure_stream_url`
2. OBS (Browser Source = https://kqxs-phuocdanh-api.vercel.app/live) → stream lên FB → tường hiện **Đang phát trực tiếp** (quay thật + từng số)
3. Đủ ĐB → tắt Live + đăng **ảnh + caption**

Câu lệnh chat n8n đầy đủ:  
https://github.com/DanhSteve/kqxs-phuocdanh-api/blob/master/HANDOFF_N8N_FB_LIVE.md

Lưu ý: Vercel không giữ luồng video; cần OBS hoặc VPS encoder.

---
