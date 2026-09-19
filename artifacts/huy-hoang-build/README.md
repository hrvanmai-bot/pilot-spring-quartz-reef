# HUY HOÀNG BUILD

**Hệ thống quản lý công trình thông minh**  
HUY HOÀNG XÂY DỰNG • ĐẦU TƯ • THƯƠNG MẠI

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Supabase** (Auth + PostgreSQL + Storage + RLS)
- **Tailwind CSS**

## Tiến độ

### ✅ PHẦN 1 — Nền tảng + Auth + Phân quyền
- [x] Schema database đầy đủ (profiles, customers, projects, items, journals, images, progress_logs, audit_logs, notifications)
- [x] Row Level Security (RLS) chi tiết theo vai trò
- [x] Helper functions: is_director(), is_staff(), is_customer(), can_access_project()
- [x] Login UI đúng design Corporate Construction (Dark Navy + Gold)
- [x] 2 lựa chọn: Nhân sự công ty / Khách hàng
- [x] Middleware bảo vệ route
- [x] Dashboard skeleton theo role

### 🔄 PHẦN 2 — Công trình + Tiến độ + Nhật ký + Hình ảnh
- [ ] Danh sách công trình + search/filter/pagination
- [ ] Project detail (tabs)
- [ ] Tạo / Complete / Reopen project (Director)
- [ ] Cập nhật progress + progress_logs (Director)
- [ ] Journal (Nhật ký) — Staff tạo trên project ACTIVE
- [ ] Upload ảnh thật (resize + compress + Storage)
- [ ] Gallery + timeline journal
- [ ] Audit log cho mọi hành động quan trọng

### ⏳ PHẦN 3 — (chờ spec)

## Cài đặt

1. Tạo project trên supabase.com
2. Chạy file SQL: supabase/migrations/001_initial_schema.sql trong SQL Editor
3. Tạo 2 Storage buckets (private): journal-images, project-images
4. Copy .env.example → .env.local và điền keys
5. npm install && npm run dev

## Tạo tài khoản Director đầu tiên

1. Authentication → Users → Add user
   Email: 0901234567@huyhoang.build
2. Insert profile:

INSERT INTO public.profiles (id, full_name, phone, account_type, permission_level)
VALUES (
  '<uuid-from-auth>',
  'Nguyễn Văn Giám Đốc',
  '0901234567',
  'STAFF',
  'DIRECTOR'
);

## Bảo mật đã có

- RLS chặn Customer xem project của người khác
- Staff không thể đổi progress / status / role
- Chỉ Director tạo/sửa project, đổi progress, complete/reopen
- Journal chỉ tạo được trên project ACTIVE
- internal_cost không expose cho Customer
- Audit log chỉ Director xem được
