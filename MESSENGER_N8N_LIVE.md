# Tin nhắn gửi team — Live đang xổ (sao chép)

---

Anh Khoa ơi, chốt hướng **live đang xổ** như anh bảo:

**Cách làm (Facebook cho phép):**  
Trước giờ xổ ~1–2 phút, n8n đăng **bài chữ sườn**. Trong lúc sổ, n8n gọi Vercel mỗi ~30 giây; Vercel cào `vesophuocdanh.vn` → có số mới thì **sửa cùng bài** (`liveCaption`). Đủ giải ĐB mới **đăng 1 ảnh bảng** form Phước Danh.

**Không làm:** quay tròn video/GIF thay ảnh liên tục trên cùng 1 bài (API Fanpage không hỗ trợ tốt).

**Lệnh dán chat n8n + plan đủ:**  
https://github.com/DanhSteve/kqxs-phuocdanh-api/blob/master/HANDOFF_N8N_LIVE.md

**API thử:**  
https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today  
(có thêm `stage`, `progressKey`, `liveCaption`)

Console: https://kqxs-phuocdanh-api.vercel.app

---
