import { pgTable, text, timestamp, boolean, integer, decimal, pgEnum } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('Role', ['CANDIDATE', 'RECRUITER', 'ADMIN', 'TALENT', 'CLIENT', 'SUPER_ADMIN', 'ANALYST'])
export const statusEnum = pgEnum('Status', ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ACTIVE'])
export const jobStatusEnum = pgEnum('JobStatus', ['DRAFT', 'PUBLISHED', 'CLOSED'])
export const applicationStatusEnum = pgEnum('ApplicationStatus', ['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'])

export const users = pgTable('User', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password'),
  role: roleEnum('role').notNull().default('CANDIDATE'),
  isVerified: boolean('isVerified').notNull().default(false),
  verificationCode: text('verificationCode'),
  verificationCodeExpiresAt: timestamp('verificationCodeExpiresAt'),
  resetToken: text('resetToken'),
  resetTokenExpiresAt: timestamp('resetTokenExpiresAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const companies = pgTable('Company', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  website: text('website'),
  logoUrl: text('logoUrl'),
  industry: text('industry'),
  size: text('size'),
  location: text('location'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const jobs = pgTable('Job', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  requirements: text('requirements'),
  location: text('location'),
  remote: boolean('remote').notNull().default(false),
  salaryMin: integer('salaryMin'),
  salaryMax: integer('salaryMax'),
  currency: text('currency').default('USD'),
  status: jobStatusEnum('status').notNull().default('DRAFT'),
  companyId: text('companyId').notNull().references(() => companies.id),
  recruiterId: text('recruiterId').notNull().references(() => users.id),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const skills = pgTable('Skill', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  category: text('category'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const candidateProfiles = pgTable('CandidateProfile', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique().references(() => users.id),
  firstName: text('firstName'),
  lastName: text('lastName'),
  headline: text('headline'),
  bio: text('bio'),
  location: text('location'),
  hourlyRate: decimal('hourlyRate'),
  portfolioUrl: text('portfolioUrl'),
  githubUrl: text('githubUrl'),
  linkedinUrl: text('linkedinUrl'),
  resumeUrl: text('resumeUrl'),
  onboardingCompleted: boolean('onboardingCompleted').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const recruiterProfiles = pgTable('RecruiterProfile', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique().references(() => users.id),
  companyId: text('companyId').references(() => companies.id),
  firstName: text('firstName'),
  lastName: text('lastName'),
  position: text('position'),
  phoneNumber: text('phoneNumber'),
  documentsSubmitted: boolean('documentsSubmitted').notNull().default(false),
  documentsStatus: statusEnum('documentsStatus').default('PENDING'),
  adminNotes: text('adminNotes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const applications = pgTable('Application', {
  id: text('id').primaryKey(),
  jobId: text('jobId').notNull().references(() => jobs.id),
  candidateId: text('candidateId').notNull().references(() => users.id),
  coverLetter: text('coverLetter'),
  status: applicationStatusEnum('status').notNull().default('PENDING'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
