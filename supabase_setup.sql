-- SQL Script untuk Setup Database Monera di Supabase
-- Jalankan script ini di Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enums
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('CANDIDATE', 'RECRUITER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'ACCEPTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Users Table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CANDIDATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- Create Candidate Profiles Table
CREATE TABLE IF NOT EXISTS "candidate_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "phone" TEXT,
    "resumeUrl" TEXT,
    "portfolioUrl" TEXT,
    "linkedInUrl" TEXT,
    "githubUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "candidate_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "candidate_profiles_userId_key" ON "candidate_profiles"("userId");

-- Create Recruiter Profiles Table
CREATE TABLE IF NOT EXISTS "recruiter_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "recruiter_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "recruiter_profiles_userId_key" ON "recruiter_profiles"("userId");

-- Create Companies Table
CREATE TABLE IF NOT EXISTS "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "industry" TEXT,
    "size" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- Create Jobs Table
CREATE TABLE IF NOT EXISTS "jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "location" TEXT,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT DEFAULT 'USD',
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "recruiterId" TEXT NOT NULL,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- Create Skills Table
CREATE TABLE IF NOT EXISTS "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "skills_name_key" ON "skills"("name");

-- Create Applications Table
CREATE TABLE IF NOT EXISTS "applications" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "coverLetter" TEXT,
    "resumeUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "applications_jobId_candidateId_key" ON "applications"("jobId", "candidateId");

-- Create Talent Requests Table
CREATE TABLE IF NOT EXISTS "talent_requests" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "talentType" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "talent_requests_pkey" PRIMARY KEY ("id")
);

-- Create Junction Tables for Many-to-Many Relationships

-- Candidate Skills
CREATE TABLE IF NOT EXISTS "_CandidateSkills" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "_CandidateSkills_AB_unique" ON "_CandidateSkills"("A", "B");
CREATE INDEX IF NOT EXISTS "_CandidateSkills_B_index" ON "_CandidateSkills"("B");

-- Job Skills
CREATE TABLE IF NOT EXISTS "_JobSkills" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "_JobSkills_AB_unique" ON "_JobSkills"("A", "B");
CREATE INDEX IF NOT EXISTS "_JobSkills_B_index" ON "_JobSkills"("B");

-- Add Foreign Keys (with error handling)

-- Candidate Profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'candidate_profiles_userId_fkey'
    ) THEN
        ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Recruiter Profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'recruiter_profiles_userId_fkey'
    ) THEN
        ALTER TABLE "recruiter_profiles" ADD CONSTRAINT "recruiter_profiles_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'recruiter_profiles_companyId_fkey'
    ) THEN
        ALTER TABLE "recruiter_profiles" ADD CONSTRAINT "recruiter_profiles_companyId_fkey" 
            FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Jobs
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'jobs_recruiterId_fkey'
    ) THEN
        ALTER TABLE "jobs" ADD CONSTRAINT "jobs_recruiterId_fkey" 
            FOREIGN KEY ("recruiterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'jobs_companyId_fkey'
    ) THEN
        ALTER TABLE "jobs" ADD CONSTRAINT "jobs_companyId_fkey" 
            FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Applications
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'applications_jobId_fkey'
    ) THEN
        ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey" 
            FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'applications_candidateId_fkey'
    ) THEN
        ALTER TABLE "applications" ADD CONSTRAINT "applications_candidateId_fkey" 
            FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Junction Tables
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_CandidateSkills_A_fkey'
    ) THEN
        ALTER TABLE "_CandidateSkills" ADD CONSTRAINT "_CandidateSkills_A_fkey" 
            FOREIGN KEY ("A") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_CandidateSkills_B_fkey'
    ) THEN
        ALTER TABLE "_CandidateSkills" ADD CONSTRAINT "_CandidateSkills_B_fkey" 
            FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_JobSkills_A_fkey'
    ) THEN
        ALTER TABLE "_JobSkills" ADD CONSTRAINT "_JobSkills_A_fkey" 
            FOREIGN KEY ("A") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_JobSkills_B_fkey'
    ) THEN
        ALTER TABLE "_JobSkills" ADD CONSTRAINT "_JobSkills_B_fkey" 
            FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ All tables created successfully!';
END $$;
