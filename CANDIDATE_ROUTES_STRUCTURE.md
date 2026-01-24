# Candidate Routes Structure

## 📁 Folder Structure

```
app/
├── candidate/
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard with profile completion
│   ├── profile/
│   │   ├── page.tsx          # Editable profile form
│   │   └── check/
│   │       └── page.tsx      # Profile readiness check page
│   ├── jobs/
│   │   ├── best-match/
│   │   │   └── page.tsx      # Best match jobs (LOCKED until profile ready)
│   │   └── all/
│   │       └── page.tsx      # All jobs (read-only)
│   └── applications/
│       └── page.tsx          # Application tracking
```

## 🔐 Access Rules

### Middleware Protection
- All `/candidate/*` routes are protected by middleware
- Requires authentication token
- Redirects to `/login` if not authenticated

### Profile Readiness Gating
- **Best Match Jobs** (`/candidate/jobs/best-match`):
  - Only accessible if `isProfileReady === true`
  - Auto-redirects to `/candidate/profile` if not ready
  - Apply buttons disabled if `availability === 'Busy'`

- **All Jobs** (`/candidate/jobs/all`):
  - Always accessible (read-only)
  - Apply functionality requires profile ready

## 📊 Profile Readiness Scoring

### Validation Rules
1. **Full Name** (10%): `firstName` AND `lastName` must exist
2. **Headline** (15%): Min 5 words
3. **Skills** (20%): Min 3 skills
4. **Experience/Bio** (20%): Min 100 characters
5. **Hourly Rate** (15%): Must be > 0
6. **Portfolio URL** (10%): Must exist
7. **Availability** (10%): Must be set (Open or Busy)

### Readiness Threshold
- **Profile is READY** if `completion >= 80%`
- Stored in database: `profileCompletion` and `isProfileReady`
- Auto-recalculated after profile save

## 🎯 Best Match Scoring Algorithm

Jobs are scored based on:
1. **Skill Match** (60%): Percentage of job skills that match candidate skills
2. **Rate Match** (20%): How close candidate rate is to job rate range
3. **Availability** (10%): +10% if candidate is "Open"
4. **Profile Completion** (10%): Based on completion percentage

Jobs are sorted by total match score (descending).

## 🚫 Apply Restrictions

1. **Duplicate Prevention**: Cannot apply to same job twice
2. **Availability Check**: Cannot apply if `availability === 'Busy'`
3. **Profile Ready**: Best match requires profile ready (all jobs can be viewed)
4. **Status Default**: All applications start as `PENDING`

## 📡 API Routes

### Profile
- `GET /api/candidate/profile/check` - Check profile readiness
- `GET /api/profile/candidate` - Get profile
- `PUT /api/profile/candidate` - Update profile (auto-recalculates readiness)

### Jobs
- `GET /api/candidate/jobs/best-match` - Get best match jobs (requires profile ready)
- `GET /api/jobs` - Get all jobs (public)

### Applications
- `GET /api/applications?candidateId=me` - Get user applications
- `POST /api/applications` - Submit application (validates availability)

## 🗄️ Database Schema Updates

### CandidateProfile
```prisma
model CandidateProfile {
  // ... existing fields ...
  profileCompletion Float?    @default(0)  // 0-100
  isProfileReady    Boolean   @default(false)
  lastValidatedAt   DateTime?
}
```

## 🔄 Flow Diagram

```
User Login (CANDIDATE)
  ↓
/candidate/dashboard
  ↓
Check Profile Readiness
  ├─ Ready (≥80%) → Show "View Best Match" CTA
  └─ Not Ready (<80%) → Show "Complete Profile" CTA + Missing Fields
  ↓
/candidate/profile
  ↓
Save Profile → Auto-recalculate Readiness
  ├─ Ready → Unlock Best Match
  └─ Not Ready → Show progress
  ↓
/candidate/jobs/best-match (if ready)
  ↓
Apply to Job
  ├─ Check: availability !== 'Busy'
  ├─ Check: Not already applied
  └─ Create Application (status: PENDING)
```

## ✅ Implementation Checklist

- [x] Database schema updated with `profileCompletion`, `isProfileReady`, `lastValidatedAt`
- [x] Middleware for `/candidate/*` routes
- [x] Profile readiness calculation utility
- [x] Best match jobs scoring algorithm
- [x] Dashboard with completion progress
- [x] Profile page with validation indicators
- [x] Profile check page
- [x] Best match jobs page (with lock/unlock)
- [x] All jobs page (read-only)
- [x] Applications page
- [x] Apply flow with availability check
- [x] API routes for profile check and best match
- [x] Navbar updated with new routes

## 🧪 Testing

1. **Login as candidate**: `candidate@monera.com` / `demo123`
2. **Check dashboard**: Should show profile completion < 80%
3. **Complete profile**: Fill all required fields
4. **Check readiness**: Should show ≥ 80% and unlock best match
5. **View best match**: Should show scored jobs
6. **Try to apply**: Should work if availability = Open
7. **Set availability to Busy**: Should prevent applying
