# API Specification - Authentication, Verification & Onboarding

## Authentication Endpoints

### POST /api/auth/register
Register new user with email/password or Google OAuth

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123", // optional for Google OAuth
  "name": "John Doe",
  "role": "candidate" | "recruiter",
  "googleId": "google_user_id", // optional, for Google OAuth
  "googleAccessToken": "token" // optional, for Google OAuth
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "candidate",
      "isVerified": false
    },
    "message": "Verification code sent to your email"
  }
}
```

### POST /api/auth/verify
Verify email with 6-digit code

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "candidate",
      "isVerified": true
    },
    "token": "jwt_token",
    "redirectTo": "/onboarding" | "/company/documents"
  }
}
```

### POST /api/auth/resend-code
Resend verification code

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Verification code sent",
    "expiresIn": 900 // 15 minutes in seconds
  }
}
```

### GET /api/auth/google
Initiate Google OAuth flow

**Response:** Redirect to Google OAuth consent screen

### GET /api/auth/google/callback
Handle Google OAuth callback

**Query Parameters:**
- `code`: Authorization code from Google
- `state`: CSRF protection state

**Response:** Redirect to appropriate page based on user state

## User State Endpoints

### GET /api/user/state
Get current user state for routing decisions

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "candidate",
      "isVerified": true
    },
    "state": {
      "onboardingCompleted": false, // for candidates
      "documentsSubmitted": true, // for recruiters
      "documentsStatus": "pending" // for recruiters
    },
    "redirectTo": "/onboarding" | "/talent" | "/company/documents" | "/client"
  }
}
```

### PUT /api/user/onboarding-complete
Mark onboarding as completed for talent

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Onboarding completed",
    "redirectTo": "/talent"
  }
}
```

## Company Documents Endpoints

### POST /api/company/documents
Upload company documents

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
documentType: "business_license" | "tax_certificate" | "company_profile"
file: File
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": "uuid",
      "documentType": "business_license",
      "fileName": "license.pdf",
      "fileUrl": "https://storage.example.com/documents/uuid.pdf",
      "uploadedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### GET /api/company/documents
Get company documents

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "uuid",
        "documentType": "business_license",
        "fileName": "license.pdf",
        "fileUrl": "https://storage.example.com/documents/uuid.pdf",
        "uploadedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "status": "pending" | "approved" | "rejected",
    "adminNotes": "Additional information required"
  }
}
```

### PUT /api/company/documents/submit
Submit documents for admin review

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Documents submitted for review",
    "status": "pending",
    "redirectTo": "/client"
  }
}
```

## Admin Endpoints

### GET /api/admin/companies/pending
Get companies pending document review

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (pending, approved, rejected)

**Response:**
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "id": "uuid",
        "name": "Company Name",
        "email": "company@example.com",
        "documentsStatus": "pending",
        "documentsSubmittedAt": "2024-01-01T00:00:00Z",
        "documents": [
          {
            "id": "uuid",
            "documentType": "business_license",
            "fileName": "license.pdf",
            "fileUrl": "https://storage.example.com/documents/uuid.pdf"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### PUT /api/admin/companies/[id]/approve
Approve company documents

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "notes": "All documents verified successfully"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Company approved successfully",
    "company": {
      "id": "uuid",
      "documentsStatus": "approved",
      "adminNotes": "All documents verified successfully"
    }
  }
}
```

### PUT /api/admin/companies/[id]/reject
Reject company documents

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "notes": "Business license is expired. Please upload a valid license.",
  "reason": "invalid_documents"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Company documents rejected",
    "company": {
      "id": "uuid",
      "documentsStatus": "rejected",
      "adminNotes": "Business license is expired. Please upload a valid license."
    }
  }
}
```

## Error Responses

### Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "email": ["Invalid email format"],
    "code": ["Code must be 6 digits"]
  }
}
```

### Authentication Error
```json
{
  "success": false,
  "error": "Invalid or expired verification code"
}
```

### Authorization Error
```json
{
  "success": false,
  "error": "Access denied. Admin role required."
}
```

### Rate Limit Error
```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "retryAfter": 300
}
```

### File Upload Error
```json
{
  "success": false,
  "error": "File upload failed",
  "details": "File size exceeds 10MB limit"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (email already exists)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limits

- Verification code requests: 5 per hour per email
- File uploads: 10 per hour per user
- General API requests: 100 per minute per user
- Admin actions: 50 per minute per admin