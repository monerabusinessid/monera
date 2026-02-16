# Authentication, Verification & Onboarding - Implementation Tasks

## Phase 1: Database Schema Updates

### 1.1 Update Users Table
- [ ] Add verification_code VARCHAR(6)
- [ ] Add verification_code_expires_at TIMESTAMP
- [ ] Add is_verified BOOLEAN DEFAULT FALSE
- [ ] Add google_id VARCHAR(255) UNIQUE
- [ ] Update Prisma schema
- [ ] Generate and run migration

### 1.2 Update Candidate Profiles Table
- [ ] Add onboarding_completed BOOLEAN DEFAULT FALSE
- [ ] Update Prisma schema
- [ ] Generate and run migration

### 1.3 Update Recruiter Profiles Table
- [ ] Add documents_submitted BOOLEAN DEFAULT FALSE
- [ ] Add documents_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
- [ ] Add admin_notes TEXT
- [ ] Update Prisma schema
- [ ] Generate and run migration

### 1.4 Create Company Documents Table
- [ ] Create company_documents table with all fields
- [ ] Add foreign key relationships
- [ ] Update Prisma schema
- [ ] Generate and run migration

## Phase 2: Authentication System

### 2.1 Google OAuth Setup
- [ ] Install next-auth or google oauth libraries
- [ ] Configure Google OAuth credentials
- [ ] Create Google OAuth provider configuration
- [ ] Add environment variables for Google OAuth

### 2.2 Email Verification System
- [ ] Create verification code generation utility
- [ ] Implement email sending for verification codes
- [ ] Add code expiration logic (15 minutes)
- [ ] Create rate limiting for code requests

### 2.3 Update Registration Flow
- [ ] Modify /api/auth/register to support Google OAuth
- [ ] Add verification code generation on registration
- [ ] Send verification email after registration
- [ ] Update validation schemas

### 2.4 Create Verification Endpoints
- [ ] POST /api/auth/verify - verify code
- [ ] POST /api/auth/resend-code - resend verification
- [ ] Add proper error handling and responses

## Phase 3: User State Management

### 3.1 User State API
- [ ] GET /api/user/state - return user routing state
- [ ] Include verification status, onboarding status, document status
- [ ] Add proper authentication middleware

### 3.2 State Update Endpoints
- [ ] PUT /api/user/onboarding-complete
- [ ] PUT /api/company/documents/submit
- [ ] Add validation and authorization

### 3.3 Routing Middleware
- [ ] Create middleware to check user state
- [ ] Implement automatic redirects based on state
- [ ] Handle edge cases and error states

## Phase 4: Frontend Pages

### 4.1 Verification Pages
- [ ] Create /auth/verify page
- [ ] Add 6-digit code input component
- [ ] Implement resend functionality
- [ ] Add loading states and error handling

### 4.2 Onboarding Pages (Talent)
- [ ] Create /onboarding page structure
- [ ] Add multi-step onboarding form
- [ ] Implement progress tracking
- [ ] Add completion handler

### 4.3 Company Documents Pages
- [ ] Create /company/documents page
- [ ] Add file upload components
- [ ] Implement document type selection
- [ ] Add submission confirmation

### 4.4 Dashboard Updates
- [ ] Update /talent dashboard
- [ ] Update /client dashboard
- [ ] Add document status display for companies
- [ ] Implement proper navigation guards

## Phase 5: Admin Panel

### 5.1 Company Review Dashboard
- [ ] Create /admin/companies page
- [ ] List pending companies with documents
- [ ] Add filtering and search functionality
- [ ] Implement pagination

### 5.2 Document Review Interface
- [ ] Create document preview/download functionality
- [ ] Add approve/reject buttons
- [ ] Implement notes/feedback system
- [ ] Add bulk actions

### 5.3 Admin API Endpoints
- [ ] GET /api/admin/companies/pending
- [ ] PUT /api/admin/companies/[id]/approve
- [ ] PUT /api/admin/companies/[id]/reject
- [ ] Add proper admin authorization

### 5.4 Notification System
- [ ] Send email notifications on status changes
- [ ] Create notification templates
- [ ] Add in-app notifications (optional)

## Phase 6: File Upload System

### 6.1 File Upload Infrastructure
- [ ] Choose storage solution (AWS S3, Cloudinary, etc.)
- [ ] Configure upload endpoints
- [ ] Add file validation (type, size limits)
- [ ] Implement secure file access

### 6.2 Document Management
- [ ] Create document upload API
- [ ] Add document deletion functionality
- [ ] Implement file organization by company
- [ ] Add document versioning (optional)

## Phase 7: Security & Validation

### 7.1 Rate Limiting
- [ ] Implement rate limiting for verification codes
- [ ] Add rate limiting for file uploads
- [ ] Configure API rate limits

### 7.2 Input Validation
- [ ] Add Zod schemas for all new endpoints
- [ ] Validate file uploads
- [ ] Sanitize user inputs

### 7.3 Authorization
- [ ] Implement role-based access control
- [ ] Add admin-only route protection
- [ ] Secure file access permissions

## Phase 8: Testing & Quality Assurance

### 8.1 Unit Tests
- [ ] Test verification code generation
- [ ] Test email sending functionality
- [ ] Test user state logic
- [ ] Test file upload validation

### 8.2 Integration Tests
- [ ] Test complete registration flow
- [ ] Test onboarding completion flow
- [ ] Test document submission flow
- [ ] Test admin approval flow

### 8.3 E2E Tests
- [ ] Test talent journey end-to-end
- [ ] Test company journey end-to-end
- [ ] Test admin workflow end-to-end

## Phase 9: Performance & Optimization

### 9.1 Performance Optimization
- [ ] Optimize file upload performance
- [ ] Add image compression for documents
- [ ] Implement lazy loading where appropriate

### 9.2 Monitoring & Analytics
- [ ] Add conversion tracking for onboarding
- [ ] Monitor verification success rates
- [ ] Track document approval times

## Acceptance Criteria

### Talent Flow
- [ ] Talent can register with email or Google
- [ ] Talent receives and can verify email code
- [ ] Talent is redirected to onboarding after verification
- [ ] Talent is redirected to /talent after onboarding completion
- [ ] Page reloads maintain proper routing state

### Company Flow
- [ ] Company can register with email or Google
- [ ] Company receives and can verify email code
- [ ] Company is redirected to document upload after verification
- [ ] Company is redirected to /client after document submission
- [ ] Page reloads maintain proper routing state

### Admin Flow
- [ ] Admin can view pending company documents
- [ ] Admin can approve/reject companies with notes
- [ ] Companies receive notification of status changes
- [ ] Document review process is tracked and auditable