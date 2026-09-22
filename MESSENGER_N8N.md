# Tin nhắn gửi team n8n (sao chép nguyên)

---

Đường dẫn lấy kết quả xổ số Phước Danh đã sẵn. Team không cần lấy dữ liệu từ web — chỉ đổi địa chỉ trong n8n rồi đăng Fanpage.

**Đổi đường dẫn lấy dữ liệu:**

Sai (lỗi): `https://vesophuocdanh.vn/api/ket-qua-hom-nay`  
Đúng: `https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today`

**Quy tắc:** chỉ đăng khi `completed` = đúng (đã đủ giải đặc biệt).  
Dùng `caption` = nội dung bài, `imageUrl` = đường dẫn ảnh bảng.  
Đăng **ảnh** lên Fanpage (không chỉ chữ).

**Thử trước:**  
`https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today?date=2026-09-19`  
→ chạy thử → kiểm Fanpage có ảnh bảng → bỏ `?date=` → bật lịch.

**Lịch:** mỗi 2 phút từ 16:15–16:35 · múi giờ Việt Nam.

**Bảng điều khiển:** https://kqxs-phuocdanh-api.vercel.app  
**Hướng dẫn đủ:** file `HANDOFF_N8N.md` trong repo  
https://github.com/DanhSteve/kqxs-phuocdanh-api

Hỏi đường dẫn / dữ liệu → DanhSteve.

---
