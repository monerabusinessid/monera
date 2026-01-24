# Setup Guide - Monera Platform

## ✅ Installed & Configured

### 1. Tailwind CSS ✅
- **Status**: Fully configured
- **Config**: `tailwind.config.ts` with Shadcn UI compatibility
- **Styles**: `app/globals.css` with CSS variables for theming
- **Features**: 
  - Dark mode support
  - Custom color system
  - Responsive utilities
  - Animation support via `tailwindcss-animate`

### 2. Shadcn UI ✅
- **Status**: Fully configured
- **Config**: `components.json` with proper aliases
- **Utilities**: `lib/utils.ts` with `cn()` function for class merging
- **Components**: 
  - Button component (`components/ui/button.tsx`)
  - Ready to add more components via CLI
- **Dependencies Installed**:
  - `class-variance-authority` - For component variants
  - `clsx` - For conditional classes
  - `tailwind-merge` - For merging Tailwind classes
  - `@radix-ui/react-slot` - For composable components
  - `tailwindcss-animate` - For animations

**To add more Shadcn components:**
```bash
npx shadcn-ui@latest add [component-name]
```

### 3. Prisma ✅
- **Status**: Fully configured
- **Schema**: `prisma/schema.prisma` with complete data models
- **Client**: `lib/db.ts` with singleton pattern
- **Scripts Added**:
  - `npm run db:generate` - Generate Prisma Client
  - `npm run db:push` - Push schema to database (dev)
  - `npm run db:migrate` - Run migrations
  - `npm run db:studio` - Open Prisma Studio

**Next Steps:**
1. Set `DATABASE_URL` in `.env`
2. Run `npm run db:generate`
3. Run `npm run db:migrate` or `npm run db:push`

### 4. Nodemailer ✅
- **Status**: Fully configured
- **Module**: `lib/email.ts` with email utilities
- **Features**:
  - SMTP configuration support
  - Development fallback (Ethereal Email)
  - Email templates:
    - Welcome emails
    - Application received
    - Application status updates
    - New application notifications
    - Password reset

**Configuration Required:**
Add to `.env`:
```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@monera.com"
```

**Usage Example:**
```typescript
import { sendEmail, emailTemplates } from '@/lib/email'

// Send welcome email
await sendEmail({
  to: user.email,
  ...emailTemplates.welcome(user.name)
})
```

## 📦 All Dependencies

### Production Dependencies
- `next` - Next.js framework
- `react` & `react-dom` - React library
- `@prisma/client` - Prisma ORM client
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `zod` - Schema validation
- `date-fns` - Date utilities
- `nodemailer` - Email sending
- `class-variance-authority` - Component variants
- `clsx` - Conditional classes
- `tailwind-merge` - Tailwind class merging
- `@radix-ui/react-slot` - Composable components

### Development Dependencies
- TypeScript & type definitions
- Prisma CLI
- Tailwind CSS & plugins
- ESLint & Next.js config
- `@types/nodemailer` - TypeScript types

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

## 📝 Notes

- All configurations are production-ready
- Email will use test account if SMTP not configured (development only)
- Prisma schema is complete and ready for migrations
- Shadcn UI is ready for component additions
- Tailwind is configured with full theming support
