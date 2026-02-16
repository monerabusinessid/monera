# Demo Accounts

Setelah menjalankan seed script, akun demo berikut akan tersedia:

## Cara Menjalankan Seed

### Prerequisites

Sebelum menjalankan seed script, pastikan file `.env` sudah dibuat dengan variabel Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**Cara mendapatkan variabel:**
1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Buka **Settings** → **API**
4. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### Untuk Supabase (Recommended):

```bash
npm run seed:demo
```

### Untuk Prisma (Legacy):

```bash
npm run db:seed
```

## Demo Accounts

### 👤 Admin
- **Email:** admin@monera.com
- **Password:** demo123
- **Role:** SUPER_ADMIN
- **Akses:** 
  - Admin Dashboard (`/admin/dashboard`)
  - Manage Users
  - Manage Jobs
  - System Settings
  - Talent Review
  - Full system access

### 💼 Recruiter/Client
- **Email:** recruiter@monera.com
- **Password:** demo123
- **Role:** CLIENT
- **Profile:** John Recruiter
- **Akses:**
  - Client Dashboard (/client)
  - Post Jobs
  - Talent Search
  - Manage Applications
  - View Applicants

### 🎨 Candidate/Talent
- **Email:** candidate@monera.com
- **Password:** demo123
- **Role:** TALENT
- **Profile:** Jane Freelancer
- **Akses:**
  - Talent Dashboard
  - Browse Jobs
  - Apply to Jobs
  - Manage Applications
  - Profile Management

## Data yang Dibuat

- ✅ 3 Demo Users (Admin, Recruiter, Candidate)
- ✅ 1 Company (TechCorp Inc.)
- ✅ 1 Sample Job (Senior Full-Stack Developer)
- ✅ 6 Skills (JavaScript, TypeScript, React, Node.js, Python, UI/UX Design)
- ✅ Candidate Profile dengan skills
- ✅ Recruiter Profile dengan company

## Catatan

- Semua akun menggunakan password yang sama: **demo123**
- Data akan di-upsert (update jika sudah ada, create jika belum)
- Seed script aman untuk dijalankan berkali-kali
- Untuk Supabase, pastikan environment variables sudah di-set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Quick Test

1. **Seed demo accounts:**
   ```bash
   npm run seed:demo
   ```

2. **Start server:**
   ```bash
   npm run dev
   ```

3. **Login:**
   - Buka: http://localhost:3001/login
   - Gunakan salah satu email di atas dengan password: `demo123`

## 📋 Quick Reference

| Role | Email | Password | Dashboard URL |
|------|-------|----------|---------------|
| Admin | admin@monera.com | demo123 | `/admin` |
| Recruiter/Client | recruiter@monera.com | demo123 | `/client` |
| Candidate/Talent | candidate@monera.com | demo123 | `/talent` |
