# Tin nhắn gửi team n8n (copy nguyên)

---

API KQXS Phước Danh đã sẵn trên Vercel. Không cần scrape — chỉ đổi URL Fetch.

**Đổi URL node Fetch:**

❌ Cũ (404): `https://vesophuocdanh.vn/api/ket-qua-hom-nay`  
✅ Mới: `https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today`

**Logic:** chỉ đăng khi `completed === true`.  
Dùng `caption` + `imageUrl` từ JSON.  
Facebook đăng **ảnh**: `POST /{page-id}/photos` với `url=imageUrl`, `caption=caption`.

**Test demo:**  
`https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today?date=2026-09-19`  
→ Execute → kiểm Fanpage có ảnh bảng → bỏ `?date=` → Active.

**Cron:** `15-35/2 16 * * *` · TZ `Asia/Ho_Chi_Minh`

**Link:**  
- JSON: https://kqxs-phuocdanh-api.vercel.app/api/kqxs/today  
- Ảnh: https://kqxs-phuocdanh-api.vercel.app/api/kqxs/image  
- Repo: https://github.com/DanhSteve/kqxs-phuocdanh-api  
- Chi tiết: file `HANDOFF_N8N.md` trong repo

Hỏi API → DanhSteve.

---
