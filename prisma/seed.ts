import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash password untuk semua demo accounts
  const password = 'demo123'
  const passwordHash = await bcrypt.hash(password, 10)

  // Create Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@monera.com' },
    update: {},
    create: {
      email: 'admin@monera.com',
      passwordHash,
      role: 'SUPER_ADMIN' as UserRole,
    },
  })
  console.log('✅ Super Admin user created:', superAdmin.email)

  // Create Quality Admin User
  const qualityAdmin = await prisma.user.upsert({
    where: { email: 'quality@monera.com' },
    update: {},
    create: {
      email: 'quality@monera.com',
      passwordHash,
      role: 'QUALITY_ADMIN' as UserRole,
    },
  })
  console.log('✅ Quality Admin user created:', qualityAdmin.email)

  // Create Support Admin User
  const supportAdmin = await prisma.user.upsert({
    where: { email: 'support@monera.com' },
    update: {},
    create: {
      email: 'support@monera.com',
      passwordHash,
      role: 'SUPPORT_ADMIN' as UserRole,
    },
  })
  console.log('✅ Support Admin user created:', supportAdmin.email)

  // Create Analyst User
  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@monera.com' },
    update: {},
    create: {
      email: 'analyst@monera.com',
      passwordHash,
      role: 'ANALYST' as UserRole,
    },
  })
  console.log('✅ Analyst user created:', analyst.email)

  // Create Recruiter User
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@monera.com' },
    update: {},
    create: {
      email: 'recruiter@monera.com',
      passwordHash,
      role: 'RECRUITER' as UserRole,
    },
  })
  console.log('✅ Recruiter user created:', recruiter.email)

  // Create Recruiter Profile
  await prisma.recruiterProfile.upsert({
    where: { userId: recruiter.id },
    update: {},
    create: {
      userId: recruiter.id,
      firstName: 'John',
      lastName: 'Recruiter',
      phone: '+1234567890',
    },
  })
  console.log('✅ Recruiter profile created')

  // Create Company
  let company = await prisma.company.findFirst({
    where: { name: 'TechCorp Inc.' },
  })
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'TechCorp Inc.',
        description: 'A leading technology company',
        website: 'https://techcorp.com',
        location: 'San Francisco, CA',
      },
    })
    console.log('✅ Company created:', company.name)
  } else {
    console.log('✅ Company already exists:', company.name)
  }

  // Update recruiter profile with company
  await prisma.recruiterProfile.update({
    where: { userId: recruiter.id },
    data: { companyId: company.id },
  })

  // Create Candidate User
  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@monera.com' },
    update: {},
    create: {
      email: 'candidate@monera.com',
      passwordHash,
      role: 'CANDIDATE' as UserRole,
    },
  })
  console.log('✅ Candidate user created:', candidate.email)

  // Create Candidate Profile
  await prisma.candidateProfile.upsert({
    where: { userId: candidate.id },
    update: {},
    create: {
      userId: candidate.id,
      firstName: 'Jane',
      lastName: 'Freelancer',
      bio: 'Experienced full-stack developer with 5+ years of experience in web development.',
      location: 'Remote',
      phone: '+1234567891',
      portfolioUrl: 'https://janefreelancer.com',
      linkedInUrl: 'https://linkedin.com/in/janefreelancer',
      githubUrl: 'https://github.com/janefreelancer',
    },
  })
  console.log('✅ Candidate profile created')

  // Create some skills
  const skills = await Promise.all([
    prisma.skill.upsert({
      where: { name: 'JavaScript' },
      update: {},
      create: { name: 'JavaScript' },
    }),
    prisma.skill.upsert({
      where: { name: 'TypeScript' },
      update: {},
      create: { name: 'TypeScript' },
    }),
    prisma.skill.upsert({
      where: { name: 'React' },
      update: {},
      create: { name: 'React' },
    }),
    prisma.skill.upsert({
      where: { name: 'Node.js' },
      update: {},
      create: { name: 'Node.js' },
    }),
    prisma.skill.upsert({
      where: { name: 'Python' },
      update: {},
      create: { name: 'Python' },
    }),
    prisma.skill.upsert({
      where: { name: 'UI/UX Design' },
      update: {},
      create: { name: 'UI/UX Design' },
    }),
  ])
  console.log('✅ Skills created')

  // Connect skills to candidate
  const candidateProfile = await prisma.candidateProfile.findUnique({
    where: { userId: candidate.id },
  })
  if (candidateProfile) {
    await prisma.candidateProfile.update({
      where: { id: candidateProfile.id },
      data: {
        skills: {
          connect: skills.slice(0, 4).map((skill) => ({ id: skill.id })),
        },
      },
    })
    console.log('✅ Skills connected to candidate')
  }

  // Create a sample job
  const job = await prisma.job.create({
    data: {
      title: 'Senior Full-Stack Developer',
      description: 'We are looking for an experienced full-stack developer to join our team. You will work on building scalable web applications using modern technologies.',
      location: 'San Francisco, CA',
      remote: true,
      salaryMin: 80000,
      salaryMax: 120000,
      currency: 'USD',
      status: 'PUBLISHED',
      recruiterId: recruiter.id,
      companyId: company.id,
      skills: {
        connect: skills.slice(0, 4).map((skill) => ({ id: skill.id })),
      },
    },
  })
  console.log('✅ Sample job created:', job.title)

  console.log('\n🎉 Seeding completed!')
  console.log('\n📋 Demo Accounts:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👤 Admin:')
  console.log('   Email: admin@monera.com')
  console.log('   Password: demo123')
  console.log('\n💼 Recruiter/Client:')
  console.log('   Email: recruiter@monera.com')
  console.log('   Password: demo123')
  console.log('\n🎨 Candidate/Talent:')
  console.log('   Email: candidate@monera.com')
  console.log('   Password: demo123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
