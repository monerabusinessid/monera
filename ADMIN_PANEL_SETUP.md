# Admin Panel Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

Add to your `.env` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin
ADMIN_EMAIL=admin@monera.com
ADMIN_PASSWORD=YourStrongPassword123!
ADMIN_NAME=Super Admin
```

### 3. Run Database Schema

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste contents of `supabase/admin-schema.sql`
3. Run the SQL script
4. Verify tables are created in Table Editor

### 4. Seed SUPER_ADMIN User

```bash
npm run seed:admin
```

Or manually:
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter email and password
4. Copy the user ID
5. Run SQL:
   ```sql
   INSERT INTO public.profiles (id, full_name, role, status)
   VALUES ('USER_ID', 'Super Admin', 'SUPER_ADMIN', 'ACTIVE');
   ```

### 5. Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3001/admin/dashboard`

## 📋 Admin Roles

### SUPER_ADMIN
- Full access to all features
- Manage admin roles
- Change system rules
- Access audit logs

### QUALITY_ADMIN
- Review talent profiles
- Approve/reject/suspend talent
- Review job postings
- Flag low-quality content

### SUPPORT_ADMIN
- Read-only user access
- Reset account access
- Handle complaints & reports

### ANALYST
- Read-only analytics
- Export data

## 🔐 Route Protection

All `/admin/*` routes are protected by:
- Supabase Auth (must be logged in)
- Role-based access control (must be admin)
- Route-specific permissions

## 📁 File Structure

```
app/admin/
  ├── layout.tsx          # Admin layout with navigation
  ├── dashboard/          # Dashboard page
  ├── talent-review/      # Talent review page
  ├── jobs/               # Job moderation page
  ├── settings/            # System settings (SUPER_ADMIN only)
  └── ...

lib/
  ├── supabase/           # Supabase client utilities
  ├── admin/              # RBAC utilities
  └── actions/
      └── admin.ts        # Server actions for admin operations

components/admin/
  ├── admin-nav.tsx       # Admin navigation
  ├── talent-review-table.tsx
  ├── jobs-table.tsx
  └── system-settings-form.tsx
```

## 🔒 Security Features

1. **Row Level Security (RLS)**: All tables have RLS policies
2. **Server Actions**: All mutations use server actions (no direct client DB access)
3. **Audit Logging**: All sensitive actions are logged
4. **Role-Based Access**: Middleware and RLS enforce role permissions

## 📝 Next Steps

1. Customize admin dashboard metrics
2. Add more admin pages (users, analytics, etc.)
3. Configure email notifications
4. Set up audit log viewing
5. Add export functionality

## 🐛 Troubleshooting

### "Unauthorized" error
- Check if user is logged in
- Verify user has admin role in `profiles` table
- Check RLS policies

### "Insufficient permissions" error
- Verify user role matches route requirements
- Check `ADMIN_ROUTE_PERMISSIONS` in `lib/admin/rbac.ts`

### Database connection issues
- Verify Supabase credentials in `.env`
- Check Supabase project status
- Verify RLS policies are enabled
