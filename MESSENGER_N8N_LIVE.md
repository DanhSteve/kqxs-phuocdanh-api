# Tin nhắn gửi team — Live đang xổ (sao chép)

---

Anh Khoa ơi, chốt hướng **live đang xổ** như anh bảo:

**Cách làm (Facebook cho phép):**  
Trước giờ xổ ~1–2 phút, n8n đăng **bảng chữ sườn** (bài `feed`). Trong lúc sổ, gọi Vercel mỗi ~30 giây → có số mới thì **sửa cùng bài**, ghi thêm số vào bảng chữ (`liveCaption`).  
**Lúc đang live: không đăng ảnh** — chỉ chữ. (Tuỳ chọn: đủ ĐB mới đăng thêm 1 ảnh bảng đẹp.)

**Không làm:** thay ảnh / quay tròn liên tục trên Fanpage (API không hỗ trợ tốt).

**Lệnh dán chat n8n + plan đủ:**  
https://github.com/DanhSteve/kqxs-phuocdanh-api/blob/master/HANDOFF_N8N_LIVE.md

**API thử:**  
https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today  
(có thêm `stage`, `progressKey`, `liveCaption`)

Console: https://kqxs-phuocdanh-api.vercel.app

---
