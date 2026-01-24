# 🔐 Security Implementation Guide

## ✅ Implemented Security Features

### 1. **Rate Limiting** ✅

#### Implementation
- **Location**: `lib/security/rate-limit.ts`
- **Middleware**: `middleware.ts`

#### Rate Limits:
- **Login**: 5 attempts per 15 minutes per IP
- **API Routes**: 100 requests per minute per IP
- **Registration**: 3 attempts per hour per IP

#### Usage:
Rate limiting is automatically applied via middleware. When rate limit is exceeded:
- Status code: `429 Too Many Requests`
- Headers include: `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

#### Example Response:
```json
{
  "success": false,
  "error": "Too many login attempts. Please try again later.",
  "retryAfter": 900
}
```

---

### 2. **CSRF Protection** ✅

#### Implementation
- **Server**: `lib/security/csrf.ts`
- **Client**: `lib/security/csrf-client.ts`
- **API Endpoint**: `/api/csrf-token`

#### How It Works:
1. Server generates CSRF token and stores it in httpOnly cookie
2. Client fetches token from `/api/csrf-token`
3. Client includes token in `X-CSRF-Token` header for POST/PUT/DELETE requests
4. Server validates token matches cookie

#### Usage in Forms:

**Server Actions (Recommended - Automatic CSRF protection):**
```typescript
'use server'

export async function createJob(formData: FormData) {
  // Next.js automatically handles CSRF for server actions
  // No manual token needed
}
```

**API Routes (Manual CSRF check):**
```typescript
import { validateCSRFTokenFromRequest } from '@/lib/security/csrf'

export async function POST(request: NextRequest) {
  // CSRF protection (skip for development, enable for production)
  if (process.env.NODE_ENV === 'production') {
    const csrfValid = validateCSRFTokenFromRequest(request)
    if (!csrfValid) {
      return errorResponse('Invalid CSRF token', 403)
    }
  }
  // ... rest of handler
}
```

**Client-side (for API routes):**
```typescript
import { getCSRFToken } from '@/lib/security/csrf-client'

async function submitForm(data: any) {
  const csrfToken = await getCSRFToken()
  
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    credentials: 'include', // Important for cookies
    body: JSON.stringify(data),
  })
}
```

**Note**: CSRF protection is currently **disabled in development** and **enabled in production**. To enable in development, remove the `process.env.NODE_ENV === 'production'` check.

---

### 3. **Security Headers** ✅

#### Implementation
- **Location**: `middleware.ts`

#### Headers Applied:
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` - Restricts browser features
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` - HSTS (production only)
- `Content-Security-Policy` - CSP policy (see below)

#### Content Security Policy (CSP):
```
default-src 'self'
script-src 'self' 'unsafe-eval' 'unsafe-inline'
style-src 'self' 'unsafe-inline'
img-src 'self' data: https:
font-src 'self' data:
connect-src 'self' https://*.supabase.co
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
```

**Note**: `unsafe-inline` is required for Next.js and Tailwind CSS. This is acceptable for most applications.

---

### 4. **Token Storage (httpOnly Cookies)** ✅

#### Implementation
- **Login**: `app/api/auth/login/route.ts`
- **Register**: `app/api/auth/register/route.ts`
- **Auth Context**: `lib/auth-context.tsx`
- **API Utils**: `lib/api-utils.ts`

#### Changes:
1. **Token no longer returned in response body** - More secure
2. **Token stored in httpOnly cookie** - Not accessible via JavaScript (XSS protection)
3. **Cookie settings**:
   - `httpOnly: true` - Not accessible via JavaScript
   - `secure: true` (production) - HTTPS only
   - `sameSite: 'strict'` - CSRF protection
   - `maxAge: 7 days` - Matches JWT expiration

#### Backward Compatibility:
- `getAuthUser()` now checks both:
  1. `Authorization: Bearer <token>` header (for backward compatibility)
  2. `auth-token` cookie (new method)

#### Client-side Changes:
- **Removed**: `localStorage.setItem('token', ...)`
- **Added**: `credentials: 'include'` to all fetch requests
- **Token**: Automatically sent with requests via cookie

#### Example:
```typescript
// Old way (removed):
const token = localStorage.getItem('token')
fetch('/api/endpoint', {
  headers: { Authorization: `Bearer ${token}` }
})

// New way (automatic):
fetch('/api/endpoint', {
  credentials: 'include' // Cookie automatically sent
})
```

---

## 🔧 Configuration

### Environment Variables
No additional environment variables needed. All security features work with existing setup.

### Development vs Production

#### Development:
- CSRF protection: **Disabled** (for easier testing)
- Security headers: **Enabled**
- Rate limiting: **Enabled**
- Token storage: **httpOnly cookies** (enabled)

#### Production:
- CSRF protection: **Enabled**
- Security headers: **Enabled** (including HSTS)
- Rate limiting: **Enabled**
- Token storage: **httpOnly cookies** (secure flag enabled)

---

## 📝 Migration Notes

### For Existing Code Using localStorage Token:

**Before:**
```typescript
const token = localStorage.getItem('token')
fetch('/api/endpoint', {
  headers: { Authorization: `Bearer ${token}` }
})
```

**After:**
```typescript
fetch('/api/endpoint', {
  credentials: 'include' // Cookie automatically sent
})
```

### For Forms Using API Routes:

**Add CSRF token (production only):**
```typescript
import { getCSRFToken } from '@/lib/security/csrf-client'

const csrfToken = await getCSRFToken()
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken, // Add this
  },
  credentials: 'include',
  body: JSON.stringify(data),
})
```

**Or use Server Actions (recommended - no CSRF token needed):**
```typescript
'use server'

export async function submitForm(formData: FormData) {
  // CSRF automatically handled by Next.js
}
```

---

## 🧪 Testing

### Test Rate Limiting:
```bash
# Try to login 6 times quickly
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
# 6th request should return 429
```

### Test CSRF Protection:
```bash
# Without CSRF token (should fail in production)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# With CSRF token
TOKEN=$(curl -s http://localhost:3001/api/csrf-token | jq -r '.data.token')
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $TOKEN" \
  -H "Cookie: csrf-token=$TOKEN" \
  -d '{"email":"test@example.com","password":"test"}'
```

### Test Security Headers:
```bash
curl -I http://localhost:3001/
# Check for security headers in response
```

---

## 🚀 Production Checklist

- [x] Rate limiting implemented
- [x] CSRF protection implemented
- [x] Security headers configured
- [x] Token storage using httpOnly cookies
- [ ] Enable CSRF protection (remove `NODE_ENV === 'production'` check or set to always enabled)
- [ ] Test rate limiting with production traffic
- [ ] Review CSP policy for your specific needs
- [ ] Consider adding Redis for distributed rate limiting (if using multiple servers)
- [ ] Monitor rate limit violations in production
- [ ] Set up alerts for security events

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSRF Protection](https://owasp.org/www-community/attacks/csrf)
