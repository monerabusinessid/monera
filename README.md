# Monera - Talent Hunting Platform

A modern talent hunting platform built with Next.js App Router, focusing on scalable backend architecture.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication
- **Validation**: Zod
- **Styling**: Tailwind CSS + Shadcn UI
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

**Untuk Supabase (Recommended):**
```
# Supabase Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
ADMIN_EMAIL="admin@monera.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

**Untuk PostgreSQL Lokal:**
```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/monera?schema=public"
```

📖 **Lihat `SETUP_SUPABASE.md` untuk panduan lengkap setup Supabase**

4. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Or push schema directly (for development)
npm run db:push

# Open Prisma Studio (optional)
npm run db:studio
```

5. Run the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database (dev)
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Shadcn UI

This project uses [Shadcn UI](https://ui.shadcn.com/) for components. To add new components:

```bash
npx shadcn-ui@latest add [component-name]
```

Example:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current authenticated user

### Profiles
- `GET /api/profile/candidate` - Get candidate profile
- `POST /api/profile/candidate` - Create candidate profile
- `PUT /api/profile/candidate` - Update candidate profile
- `GET /api/profile/recruiter` - Get recruiter profile
- `POST /api/profile/recruiter` - Create recruiter profile
- `PUT /api/profile/recruiter` - Update recruiter profile

### Companies
- `GET /api/companies` - List all companies (with pagination)
- `POST /api/companies` - Create a new company
- `GET /api/companies/[id]` - Get company details
- `PUT /api/companies/[id]` - Update company
- `DELETE /api/companies/[id]` - Delete company (admin only)

### Jobs
- `GET /api/jobs` - List jobs with search/filter (query, location, remote, salary, skills, company)
- `POST /api/jobs` - Create a new job posting
- `GET /api/jobs/[id]` - Get job details
- `PUT /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job
- `POST /api/jobs/[id]/publish` - Publish a job

### Applications
- `GET /api/applications` - List applications (with filters: jobId, candidateId, status)
- `POST /api/applications` - Submit an application
- `GET /api/applications/[id]` - Get application details
- `PUT /api/applications/[id]` - Update application (status/notes for recruiters, cover letter for candidates)

### Skills
- `GET /api/skills` - List skills (with search and category filter)
- `POST /api/skills` - Create a new skill

### Search
- `GET /api/search/candidates` - Search candidates (query, location, skills)

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Email Configuration

The platform uses Nodemailer for sending emails. Configure your SMTP settings in `.env`:

- **Gmail**: Use an App Password (not your regular password)
- **Development**: If no SMTP is configured, it will use a test account (emails won't actually be sent)

Email templates are available in `lib/email.ts`:
- Welcome emails
- Application received notifications
- Application status updates
- Password reset emails

## Database Schema

The platform supports:
- **Users**: Candidates, Recruiters, and Admins
- **Profiles**: Separate profiles for candidates and recruiters
- **Companies**: Company information and associations
- **Jobs**: Job postings with skills, salary, location, etc.
- **Applications**: Job applications with status tracking
- **Skills**: Reusable skills that can be associated with candidates and jobs

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── profile/      # Profile management
│   │   ├── companies/    # Company CRUD
│   │   ├── jobs/         # Job CRUD and search
│   │   ├── applications/ # Application management
│   │   ├── skills/       # Skills management
│   │   └── search/       # Search endpoints
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/
│   └── ui/               # Shadcn UI components
├── lib/
│   ├── db.ts             # Prisma client
│   ├── auth.ts           # Authentication utilities
│   ├── validations.ts    # Zod schemas
│   ├── api-utils.ts      # API helper functions
│   ├── email.ts          # Email utilities
│   └── utils.ts          # Utility functions (cn)
├── prisma/
│   └── schema.prisma     # Database schema
└── package.json
```

## Development

The backend is fully functional and ready for frontend integration. The API follows RESTful principles with consistent error handling and response formats.

All API responses follow this format:
```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "errors": { "field": ["validation errors"] }
}
```

## Next Steps

- Frontend UI implementation with Shadcn UI components
- File upload handling for resumes and company logos
- Email notifications integration
- Advanced search and filtering
- Analytics and reporting
