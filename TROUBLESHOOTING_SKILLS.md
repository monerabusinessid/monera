# Troubleshooting: Skills Tidak Muncul di Form Post Job

## Status RLS ✅
RLS untuk table `skills` sudah **disabled** (`rowsecurity = false`), jadi bukan masalah RLS.

## Langkah Troubleshooting

### 1. Test API Endpoint Langsung
Buka browser console dan jalankan:
```javascript
fetch('/api/skills', { credentials: 'include' })
  .then(res => res.json())
  .then(data => {
    console.log('API Response:', data);
    console.log('Skills count:', data.data?.length || 0);
    console.log('First skill:', data.data?.[0]);
  })
  .catch(err => console.error('Error:', err));
```

### 2. Check Browser Console
Saat membuka halaman `/client/post-job`, check console untuk:
- `Skills response:` - Apakah response berhasil?
- `Skills count:` - Berapa jumlah skills?
- `Valid skills count:` - Berapa yang valid setelah filtering?

### 3. Check Network Tab
1. Buka Developer Tools → Network
2. Refresh halaman `/client/post-job`
3. Cari request ke `/api/skills`
4. Check:
   - Status code (harus 200)
   - Response body (harus ada `success: true` dan `data: [...]`)
   - Request headers (harus ada cookies)

### 4. Verify Database
Jalankan query ini di Supabase SQL Editor:
```sql
SELECT id, name, category, created_at 
FROM public.skills 
ORDER BY name;
```

Pastikan ada data (minimal 3 skills: Canva, Notion, PHP 5).

### 5. Check API Response Format
Response harus dalam format:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Canva",
      "category": "Design"
    },
    ...
  ]
}
```

### 6. Common Issues & Solutions

#### Issue: Skills tidak muncul tapi API return success
**Solution**: Check apakah skills memiliki `id` dan `name`. Lihat console log untuk "Valid skills count".

#### Issue: API return error
**Solution**: 
- Check server logs untuk error details
- Pastikan Supabase connection string benar
- Check apakah table `skills` benar-benar ada

#### Issue: CORS atau Authentication Error
**Solution**: 
- Pastikan `credentials: 'include'` ada di fetch request
- Check apakah user sudah login
- Check cookies di browser

### 7. Debug Steps
1. ✅ RLS disabled (sudah verified)
2. ⏳ Test API endpoint langsung
3. ⏳ Check browser console logs
4. ⏳ Check network tab
5. ⏳ Verify database data
6. ⏳ Check response format

## Expected Behavior
Setelah semua fix:
- Skills dari database (Canva, Notion, PHP 5) harus muncul di form
- Skills ditampilkan sebagai checkbox list
- User bisa memilih multiple skills
- Skills ter-save saat job di-post
