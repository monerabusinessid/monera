## 1. Implementation

### 1.1 Authentication Specs
- [x] 1.1.1 Create `openspec/specs/auth/spec.md` with signup requirements
- [x] 1.1.2 Define scenarios for email/password signup
- [x] 1.1.3 Define scenarios for Google OAuth signup
- [x] 1.1.4 Define role selection requirements (CLIENT vs TALENT)

### 1.2 Backend API Updates
- [x] 1.2.1 Enhance `/api/auth/register` to handle both CLIENT and TALENT roles properly
- [x] 1.2.2 Ensure proper profile creation for CLIENT role (recruiter_profiles)
- [x] 1.2.3 Ensure proper profile creation for TALENT role (talent_profiles)
- [x] 1.2.4 Update Google OAuth flow to handle role selection during signup
- [x] 1.2.5 Add validation for role selection in registration schema
- [x] 1.2.6 Improve error messages for duplicate email scenarios

### 1.3 Frontend Updates
- [x] 1.3.1 Update signup form to clearly show role selection (CLIENT/TALENT)
- [x] 1.3.2 Add Google OAuth button with role context
- [x] 1.3.3 Improve form validation and error display
- [x] 1.3.4 Add loading states during signup process
- [x] 1.3.5 Handle OAuth callback with role information

### 1.4 Database & Profile Initialization
- [x] 1.4.1 Ensure `profiles` table is created with correct role
- [x] 1.4.2 Create `talent_profiles` entry for TALENT signups
- [x] 1.4.3 Create `recruiter_profiles` entry for CLIENT signups (if needed)
- [x] 1.4.4 Set default status and profile completion values

### 1.5 Testing & Validation
- [x] 1.5.1 Create testing documentation (TESTING.md)
- [x] 1.5.2 Add redirect logic for DRAFT status to onboarding
- [x] 1.5.3 Validate profile creation for both roles
- [ ] 1.5.4 Manual testing: email/password signup for CLIENT role
- [ ] 1.5.5 Manual testing: email/password signup for TALENT role
- [ ] 1.5.6 Manual testing: Google OAuth signup for CLIENT role
- [ ] 1.5.7 Manual testing: Google OAuth signup for TALENT role
- [ ] 1.5.8 Manual testing: duplicate email handling
- [ ] 1.5.9 Manual testing: invalid role handling
