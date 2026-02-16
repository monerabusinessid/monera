import { z } from 'zod'

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['TALENT', 'CLIENT']).default('TALENT'), // Only allow TALENT and CLIENT for public registration
  companyName: z.string().optional(), // Company name for CLIENT role
})

// Email verification schemas
export const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().regex(/^\d{6}$/, 'Verification code must be 6 digits'),
})

export const resendCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// Candidate profile schemas
export const candidateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  headline: z.string().max(100, 'Headline must be less than 100 characters').optional(),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  hourlyRate: z.number().positive('Hourly rate must be positive').optional(),
  availability: z.enum(['Open', 'Busy']).optional(),
  resumeUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedInUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  videoIntroUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  skillIds: z.array(z.string()).optional(),
})

// Recruiter profile schemas
export const recruiterProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  companyId: z.string().optional(),
})

// Company schemas
export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
})

// Job schemas
export const createJobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  description: z.string().min(1, 'Job description is required'),
  requirements: z.string().optional(),
  scopeOfWork: z.string().optional(),
  location: z.string().optional(),
  remote: z.boolean().default(false),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  currency: z.string().default('USD'),
  engagementType: z.enum(['Hourly', 'Fixed']).optional(),
  hoursPerWeek: z.enum(['Less than 30 hrs/week', 'More than 30 hrs/week']).optional(),
  duration: z.enum(['Less than 1 month', '1-3 months', '3-6 months', '6+ months']).optional(),
  experienceLevel: z.enum(['Entry', 'Intermediate', 'Expert']).optional(),
  projectType: z.enum(['One-time project', 'Ongoing project']).optional(),
  companyId: z.string().optional(),
  skillIds: z.array(z.string()).optional(),
})

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']).optional(),
})

// Application schemas
export const createApplicationSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  coverLetter: z.string().max(2000, 'Cover letter must be less than 2000 characters').optional(),
  expectedRate: z.number().positive('Expected rate must be positive').optional(),
  resumeUrl: z.string().url('Invalid URL').optional(),
})

export const updateApplicationSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'ACCEPTED']).optional(),
  coverLetter: z.string().max(2000, 'Cover letter must be less than 2000 characters').optional(),
  resumeUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
})

// Search and filter schemas
export const jobSearchSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().int().optional(),
  salaryMax: z.number().int().optional(),
  skillIds: z.array(z.string()).optional(),
  companyId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

export const candidateSearchSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  skillIds: z.array(z.string()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

// Skill schemas
export const createSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().optional(),
})

// Talent Request schemas
export const createTalentRequestSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  talentType: z.string().min(1, 'Talent type is required'),
  budget: z.union([
    z.string().min(1, 'Budget is required'),
    z.number().positive('Budget must be positive'),
  ]).transform((val) => typeof val === 'number' ? val.toString() : val),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
})

export const updateTalentRequestSchema = createTalentRequestSchema.partial()

export const talentRequestSearchSchema = z.object({
  query: z.string().optional(),
  talentType: z.string().optional(),
  email: z.string().email().optional(),
  company: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})
