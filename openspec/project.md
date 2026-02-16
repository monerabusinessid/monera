# Project Context

## Purpose
Monera is a quality-first talent marketplace platform connecting businesses with pre-screened remote professionals. The platform focuses on vetted talent, AI-powered matching, and quality over quantity approach.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Supabase
- **Authentication**: JWT + Supabase Auth
- **Styling**: Tailwind CSS + Shadcn UI
- **Email**: Nodemailer
- **Validation**: Zod

## Project Conventions

### Code Style
- Use TypeScript for all new code
- Follow Next.js App Router conventions
- Use 'use client' directive only when necessary (client components)
- Prefer server components for data fetching
- Use async/await for asynchronous operations
- Keep components small and focused (single responsibility)
- Use meaningful variable and function names
- Add comments only for complex logic

### Architecture Patterns
- **Server Components**: Default for pages and layouts
- **Client Components**: Only for interactivity (forms, modals, etc.)
- **API Routes**: RESTful design in `/app/api`
- **Database**: Supabase with Row Level Security (RLS)
- **Authentication**: JWT tokens in httpOnly cookies
- **State Management**: React hooks (useState, useContext)
- **File Structure**: Feature-based organization

### Testing Strategy
- Manual testing in development environment
- Test authentication flows thoroughly
- Verify RLS policies in Supabase
- Test responsive design on multiple devices
- Check performance with Chrome DevTools

### Git Workflow
- Work directly on main branch for rapid development
- Commit frequently with descriptive messages
- Use conventional commit format: `feat:`, `fix:`, `docs:`, etc.
- Keep commits atomic and focused

## Domain Context

### User Roles
1. **TALENT**: Freelancers/professionals looking for work
2. **CLIENT**: Companies/recruiters hiring talent
3. **ADMIN**: Platform administrators (SUPER_ADMIN, QUALITY_ADMIN, SUPPORT_ADMIN, ANALYST)

### Key Features
- **Profile Vetting**: All talent profiles reviewed before activation
- **Smart Matching**: AI-powered job recommendations
- **Quality First**: Only ready profiles can apply to jobs
- **Admin Panel**: Comprehensive management dashboard
- **Landing Page**: Dynamic content managed via admin

### Database Schema
- `profiles`: User profiles with role-based data
- `talent_profiles`: Extended data for talent users
- `recruiter_profiles`: Extended data for client users
- `jobs`: Job postings with skills and requirements
- `applications`: Job applications with status tracking
- `skills`: Reusable skills taxonomy
- `companies`: Company information
- `audit_logs`: Admin action tracking

## Important Constraints

### Security
- All sensitive data in httpOnly cookies
- JWT tokens for authentication
- Supabase RLS for data access control
- No PII in logs or error messages
- CSRF protection on forms

### Performance
- Optimize images (lazy loading, proper sizing)
- Minimize client-side JavaScript
- Use server components when possible
- Parallel data fetching with Promise.all
- Cache static assets

### Business Rules
- Talent must complete profile before applying
- Only admins can approve/reject profiles
- Jobs must be published before visible
- Applications track status changes
- Email verification required for new users

## External Dependencies

### Services
- **Supabase**: Database, Auth, Storage
- **Vercel**: Hosting and deployment
- **Google OAuth**: Social authentication
- **SMTP**: Email delivery (Gmail/custom)

### APIs
- Supabase REST API
- Supabase Auth API
- Google OAuth 2.0
- Internal REST APIs in `/app/api`

### Libraries
- `@supabase/supabase-js`: Supabase client
- `jsonwebtoken`: JWT handling
- `bcryptjs`: Password hashing
- `zod`: Schema validation
- `nodemailer`: Email sending
- `tailwindcss`: Styling
- `@radix-ui/*`: UI primitives (via Shadcn)

## Development Notes

### Common Patterns
```typescript
// API Route Pattern
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return errorResponse('Unauthorized', 401)
  // ... logic
  return successResponse(data)
}

// Server Component Pattern
export default async function Page() {
  const supabase = await createAdminClient()
  const { data } = await supabase.from('table').select('*')
  return <Component data={data} />
}

// Client Component Pattern
'use client'
export function Component() {
  const [state, setState] = useState()
  // ... logic
  return <div>...</div>
}
```

## Recent Updates

### Latest Changes (2024)

#### Authentication & Security
- Fixed auto-refresh issue on admin login
- Simplified admin layout authentication (JWT only)
- Removed middleware conflict for `/admin` routes
- Optimized auth context loading (3s timeout)
- Fixed React hooks error in landing page
- Implemented conditional rendering after all hooks

#### Admin Dashboard
- Redesigned admin dashboard with modern UI
- Added stats cards with real-time data
- Implemented platform growth chart visualization
- Added action required panel for pending tasks
- Created recent activity feed
- Integrated Tailwind custom colors (accent-yellow, background-light)

#### Performance Optimizations
- Parallel data fetching for landing page (Promise.all)
- Reduced landing page load time significantly
- Optimized auth check flow
- Prevented unnecessary landing page renders for logged-in users

#### Bug Fixes
- Fixed slow redirect after login (landing page flash)
- Fixed hooks rendering error
- Fixed admin authentication conflicts
- Improved logout flow with proper session cleanup

### Environment Variables
- `DATABASE_URL`: Supabase connection string
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service key
- `JWT_SECRET`: JWT signing secret
- `SMTP_*`: Email configuration
- `NEXT_PUBLIC_APP_URL`: Application URL

### Troubleshooting
- Check browser console for client errors
- Check terminal for server errors
- Verify Supabase RLS policies
- Check auth token in cookies
- Review audit logs for admin actions

### Known Issues & Solutions

#### React Hooks Error
**Problem**: "Rendered more hooks than during the previous render"
**Solution**: Always call all hooks before any conditional returns. Place conditional rendering AFTER all hooks.

```typescript
// ❌ WRONG
function Component() {
  const [state1] = useState()
  if (condition) return <Loading /> // Error!
  const [state2] = useState()
}

// ✅ CORRECT
function Component() {
  const [state1] = useState()
  const [state2] = useState()
  if (condition) return <Loading /> // OK!
}
```

#### Slow Redirect After Login
**Problem**: Landing page shows briefly before redirect
**Solution**: Add conditional rendering to show loading state for authenticated users

```typescript
if (loading || user) {
  return <LoadingSpinner />
}
```

#### Admin Auto-Refresh
**Problem**: Admin page keeps refreshing after login
**Solution**: 
- Remove `/admin` from middleware matcher
- Use only JWT authentication in admin layout
- Avoid double authentication (JWT + Supabase)

### Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Database Changes**
   ```bash
   npm run db:push      # Push schema changes
   npm run db:studio    # Open Prisma Studio
   ```

3. **Add UI Components**
   ```bash
   npx shadcn-ui@latest add [component-name]
   ```

4. **Common Tasks**
   - Create new API route: `app/api/[route]/route.ts`
   - Create new page: `app/[route]/page.tsx`
   - Add server component: Default export async function
   - Add client component: Add `'use client'` directive

### Best Practices

#### Authentication
- Always use `getAuthUser()` in API routes
- Store tokens in httpOnly cookies only
- Never expose JWT_SECRET
- Verify user role before sensitive operations

#### Database
- Use `createAdminClient()` for admin operations
- Use regular client for user-scoped queries
- Always handle RLS policy errors
- Use transactions for multi-step operations

#### Performance
- Fetch data in parallel when possible
- Use server components for data fetching
- Minimize client-side JavaScript
- Optimize images and assets
- Cache static content

#### Code Quality
- Keep components under 200 lines
- Extract reusable logic to utilities
- Use TypeScript types consistently
- Handle errors gracefully
- Add loading states for async operations
