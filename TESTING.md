# Panduan Testing - Request Talent Form

## 🚀 Langkah-langkah Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables

Buat file `.env` di root project:

```env
# Database (wajib)
DATABASE_URL="postgresql://user:password@localhost:5432/monera?schema=public"

# JWT (wajib)
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Email SMTP (opsional untuk testing)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
ADMIN_EMAIL="admin@yourcompany.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

**Catatan:** Jika tidak setup SMTP, email akan menggunakan test account (tidak akan terkirim, hanya log di console).

### 3. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema ke database (untuk development)
npm run db:push

# ATAU jalankan migration
npm run db:migrate
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di: **http://localhost:3000**

### 5. Test Form di Browser

1. Buka browser dan kunjungi: **http://localhost:3000/request-talent**

2. Isi form dengan data test:
   - **Client Name:** `John Doe`
   - **Email:** `john@example.com`
   - **Company:** `Acme Corporation` (opsional)
   - **Talent Type:** `Developer`
   - **Budget:** `50000`
   - **Notes:** `Looking for senior React developer with 5+ years experience` (opsional)

3. Klik tombol **"Submit Request"**

4. Anda akan melihat:
   - ✅ **Success message** jika berhasil
   - ❌ **Error message** jika ada masalah
   - Form akan reset otomatis setelah sukses

### 6. Test API Langsung (Optional)

#### Menggunakan cURL:
```bash
curl -X POST http://localhost:3000/api/request-talent \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Jane Smith",
    "email": "jane@example.com",
    "company": "Tech Corp",
    "talentType": "Designer",
    "budget": "75000",
    "notes": "Need UI/UX designer for mobile app"
  }'
```

#### Menggunakan Postman:
1. Method: `POST`
2. URL: `http://localhost:3000/api/request-talent`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "clientName": "Jane Smith",
  "email": "jane@example.com",
  "company": "Tech Corp",
  "talentType": "Designer",
  "budget": "75000",
  "notes": "Need UI/UX designer for mobile app"
}
```

### 7. Verifikasi Data di Database

#### Menggunakan Prisma Studio:
```bash
npm run db:studio
```
Buka browser di: **http://localhost:3000** (Prisma Studio akan otomatis terbuka)

Cari table `talent_requests` dan lihat data yang sudah tersimpan.

#### Menggunakan SQL:
```sql
SELECT * FROM talent_requests ORDER BY "createdAt" DESC;
```

### 8. Test Error Cases

#### Test Validasi (Field Required):
1. Kosongkan field **Client Name** → Submit
2. Kosongkan field **Email** → Submit
3. Kosongkan field **Talent Type** → Submit
4. Kosongkan field **Budget** → Submit

Seharusnya muncul error message.

#### Test Email Invalid:
1. Isi **Email** dengan format salah: `invalid-email`
2. Submit → Seharusnya muncul error validation

### 9. Test Email Notification

Jika sudah setup SMTP:
- Cek inbox email di `ADMIN_EMAIL`
- Seharusnya ada email dengan subject: **"New Talent Request Received"**
- Email berisi semua detail request

Jika belum setup SMTP:
- Cek console log di terminal
- Akan ada warning: `⚠️ SMTP credentials not configured`
- Request tetap berhasil, hanya email tidak terkirim

## 📋 Checklist Testing

- [ ] Form bisa diakses di `/request-talent`
- [ ] Semua field bisa diisi
- [ ] Validasi required fields bekerja
- [ ] Submit berhasil dan data tersimpan
- [ ] Success message muncul setelah submit
- [ ] Form reset setelah sukses
- [ ] Error message muncul jika ada masalah
- [ ] Data tersimpan di database
- [ ] Email terkirim ke admin (jika SMTP configured)

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
npm install
```

### Error: Database connection
- Pastikan PostgreSQL running
- Cek `DATABASE_URL` di `.env`
- Pastikan database sudah dibuat

### Error: Prisma Client not generated
```bash
npm run db:generate
```

### Form tidak muncul
- Pastikan server running: `npm run dev`
- Cek console browser untuk error
- Pastikan semua dependencies terinstall

### Email tidak terkirim
- Cek SMTP configuration di `.env`
- Untuk Gmail, gunakan App Password (bukan password biasa)
- Cek console log untuk error details

## 💡 Tips Testing

1. **Gunakan Browser DevTools:**
   - Buka Network tab untuk lihat request/response
   - Buka Console untuk lihat error messages

2. **Test dengan berbagai data:**
   - Test dengan company kosong
   - Test dengan notes kosong
   - Test dengan budget dalam format berbeda (50000, $50,000, etc)

3. **Monitor Server Logs:**
   - Lihat terminal dimana `npm run dev` running
   - Semua error dan log akan muncul disana
