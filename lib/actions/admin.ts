'use server'

// Dynamic imports to prevent bundling server-only code with client
import { requireAdmin } from '@/lib/admin/rbac-server'
import { isAdmin, isSuperAdmin } from '@/lib/admin/rbac'
import type { AdminRole } from '@/lib/admin/rbac'
import { getUserFromToken } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ============================================
// TALENT REVIEW ACTIONS
// ============================================

const approveTalentSchema = z.object({
  talentId: z.string().uuid(),
  notes: z.string().nullable().optional(),
})

async function requireAdminFromToken(allowedRoles?: AdminRole[]) {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    throw new Error('Unauthorized')
  }

  const user = await getUserFromToken(token)
  if (!user) {
    throw new Error('Unauthorized')
  }

  if (!isAdmin(user.role)) {
    throw new Error('Admin access required')
  }

  if (allowedRoles && !allowedRoles.includes(user.role as AdminRole)) {
    throw new Error('Insufficient permissions')
  }

  return { user, role: user.role as AdminRole }
}

export async function approveTalent(formData: FormData) {
  try {
    const { user } = await requireAdminFromToken(['SUPER_ADMIN', 'QUALITY_ADMIN'])

    const notesValue = formData.get('notes')
    const data = approveTalentSchema.parse({
      talentId: formData.get('talentId'),
      notes: notesValue === null ? undefined : notesValue,
    })

    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    // Update talent profile using admin client to bypass RLS
    const { error: updateError } = await adminSupabase
      .from('talent_profiles')
      .update({
        is_profile_ready: true,
        status: 'APPROVED',
        last_validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.talentId)

    if (updateError) throw updateError

    // Log audit
    await logAudit({
      adminId: user.id,
      action: 'TALENT_APPROVED',
      targetType: 'talent',
      targetId: data.talentId,
      details: { notes: data.notes },
    })

    revalidatePath('/admin/talent-review')
    return { success: true }
  } catch (error) {
    console.error('Error approving talent:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

const rejectTalentSchema = z.object({
  talentId: z.string().uuid(),
  reason: z.string().min(1),
})

export async function rejectTalent(formData: FormData) {
  try {
    const { user } = await requireAdminFromToken(['SUPER_ADMIN', 'QUALITY_ADMIN'])

    const data = rejectTalentSchema.parse({
      talentId: formData.get('talentId'),
      reason: formData.get('reason'),
    })

    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    // Update talent profile using admin client to bypass RLS
    const { error: updateError } = await adminSupabase
      .from('talent_profiles')
      .update({
        is_profile_ready: false,
        status: 'REJECTED',
        last_validated_at: new Date().toISOString(),
      })
      .eq('id', data.talentId)

    if (updateError) throw updateError

    // Log audit
    await logAudit({
      adminId: user.id,
      action: 'TALENT_REJECTED',
      targetType: 'talent',
      targetId: data.talentId,
      details: { reason: data.reason },
    })

    revalidatePath('/admin/talent-review')
    return { success: true }
  } catch (error) {
    console.error('Error rejecting talent:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

const suspendUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(1),
})

export async function suspendUser(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN', 'QUALITY_ADMIN'])

    const data = suspendUserSchema.parse({
      userId: formData.get('userId'),
      reason: formData.get('reason'),
    })

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Update user status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ status: 'SUSPENDED' })
      .eq('id', data.userId)

    if (updateError) throw updateError

    // Log audit
    await logAudit({
      adminId: user.id,
      action: 'TALENT_SUSPENDED',
      targetType: 'user',
      targetId: data.userId,
      details: { reason: data.reason },
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error suspending user:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function unsuspendUser(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN', 'QUALITY_ADMIN'])

    const userId = formData.get('userId')
    if (typeof userId !== 'string') throw new Error('Invalid user ID')

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Update user status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ status: 'ACTIVE' })
      .eq('id', userId)

    if (updateError) throw updateError

    // Log audit
    await logAudit({
      adminId: user.id,
      action: 'TALENT_UNSUSPENDED',
      targetType: 'user',
      targetId: userId,
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error unsuspending user:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ============================================
// JOB MODERATION ACTIONS
// ============================================

const updateJobStatusSchema = z.object({
  jobId: z.string().uuid(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']),
})

export async function updateJobStatus(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN', 'QUALITY_ADMIN'])

    const data = updateJobStatusSchema.parse({
      jobId: formData.get('jobId'),
      status: formData.get('status'),
    })

    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    const updateData: any = { status: data.status }
    if (data.status === 'PUBLISHED') {
      updateData.published_at = new Date().toISOString()
    }

    const { error: updateError } = await adminSupabase
      .from('jobs')
      .update(updateData)
      .eq('id', data.jobId)

    if (updateError) throw updateError

    // Log audit
    await logAudit({
      adminId: user.id,
      action: data.status === 'PUBLISHED' ? 'JOB_APPROVED' : 'JOB_REJECTED',
      targetType: 'job',
      targetId: data.jobId,
      details: { status: data.status },
    })

    revalidatePath('/admin/jobs')
    return { success: true }
  } catch (error) {
    console.error('Error updating job status:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ============================================
// SYSTEM SETTINGS ACTIONS (SUPER_ADMIN ONLY)
// ============================================

const updateSystemSettingsSchema = z.object({
  key: z.string(),
  value: z.any(),
})

export async function updateSystemSettings(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN'])

    const data = updateSystemSettingsSchema.parse({
      key: formData.get('key'),
      value: JSON.parse(formData.get('value') as string),
    })

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from('system_settings')
      .upsert({
        key: data.key,
        value: data.value,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })

    if (updateError) throw updateError

    // Log audit
    await logAudit({
      adminId: user.id,
      action: 'SETTINGS_UPDATED',
      targetType: 'settings',
      targetId: null,
      details: { key: data.key, value: data.value },
    })

    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('Error updating system settings:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ============================================
// AUDIT LOGGING
// ============================================

interface LogAuditParams {
  adminId: string
  action: string
  targetType: string
  targetId: string | null
  details?: Record<string, any>
}

async function logAudit(params: LogAuditParams) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { error } = await supabase.from('audit_logs').insert({
      admin_id: params.adminId,
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId,
      details: params.details || {},
    })

    if (error) {
      console.error('Error logging audit:', error)
      // Don't throw - audit logging failure shouldn't break the main operation
    }
  } catch (error) {
    console.error('Error in logAudit:', error)
  }
}

// ============================================
// ROLE MANAGEMENT (SUPER_ADMIN ONLY)
// ============================================

const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST', 'CLIENT', 'TALENT']),
})

export async function updateUserRole(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN'])

    const data = updateUserRoleSchema.parse({
      userId: formData.get('userId'),
      role: formData.get('role'),
    })

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: data.role })
      .eq('id', data.userId)

    if (updateError) throw updateError

    // Log audit
    await logAudit({
      adminId: user.id,
      action: 'ROLE_CHANGED',
      targetType: 'user',
      targetId: data.userId,
      details: { newRole: data.role },
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error updating user role:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ============================================
// USER CRUD OPERATIONS
// ============================================

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST', 'CLIENT', 'TALENT']),
  status: z.enum(['ACTIVE', 'SUSPENDED']).default('ACTIVE'),
})

export async function createUser(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN', 'QUALITY_ADMIN'])

    const data = createUserSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      fullName: formData.get('fullName'),
      role: formData.get('role'),
      status: formData.get('status') || 'ACTIVE',
    })

    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    console.log('Creating user with data:', { email: data.email, role: data.role, status: data.status || 'ACTIVE' })

    // Check if user already exists in Auth
    let authUser: any = null
    let existingAuthUser: any = null
    
    // Try to create user in Supabase Auth
    const { data: newAuthUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    })

    if (authError) {
      // If user already exists, try to fetch existing user
      if (authError.message.includes('already registered') || authError.message.includes('already been registered') || authError.code === 'email_exists') {
        console.log('User already exists in Auth, fetching existing user...')
        
        // List all users and find by email
        const { data: usersData, error: listError } = await adminSupabase.auth.admin.listUsers()
        if (listError) {
          throw new Error(`Failed to list users: ${listError.message}`)
        }
        
        existingAuthUser = usersData?.users?.find((u: any) => u.email === data.email)
        if (!existingAuthUser) {
          throw new Error('User exists but could not be found in Auth')
        }
        
        console.log('Found existing auth user:', existingAuthUser.id)
        
        // Check if profile already exists
        const { data: existingProfile } = await adminSupabase
          .from('profiles')
          .select('*')
          .eq('id', existingAuthUser.id)
          .single()
        
        if (existingProfile) {
          throw new Error(`User with email ${data.email} already exists in the system`)
        }
        
        // Use existing auth user
        authUser = { user: existingAuthUser }
      } else {
        console.error('Auth error:', authError)
        throw new Error(`Failed to create auth user: ${authError.message}`)
      }
    } else {
      if (!newAuthUser.user) {
        throw new Error('Failed to create auth user: No user returned')
      }
      authUser = newAuthUser
      console.log('Auth user created successfully:', authUser.user.id)
    }

    // Create profile using admin client to bypass RLS
    // Note: profiles table does NOT have email column - email is stored in auth.users
    console.log('Inserting profile with data:', {
      id: authUser.user.id,
      full_name: data.fullName || null,
      role: data.role,
      status: data.status || 'ACTIVE',
    })

    const { data: profileData, error: profileError } = await adminSupabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        full_name: data.fullName || null,
        role: data.role,
        status: data.status || 'ACTIVE',
      })
      .select()

    if (profileError) {
      console.error('Profile error:', profileError)
      console.error('Profile error details:', JSON.stringify(profileError, null, 2))
      console.error('Service role key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
      console.error('Service role key starts with eyJ:', process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ'))
      
      // Rollback: delete auth user if profile creation fails
      try {
        await adminSupabase.auth.admin.deleteUser(authUser.user.id)
        console.log('Rolled back: deleted auth user')
      } catch (deleteError) {
        console.error('Error deleting auth user during rollback:', deleteError)
      }
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }

    console.log('Profile created successfully:', profileData)

    // Create entry in role-specific tables if needed
    if (data.role === 'TALENT') {
      try {
        const { error: talentProfileError } = await adminSupabase
          .from('talent_profiles')
          .insert({
            user_id: authUser.user.id,
            status: 'PENDING',
            is_profile_ready: false,
            profile_completion: 0,
          })
        
        if (talentProfileError) {
          console.warn('Warning: Could not create talent_profile:', talentProfileError.message)
          // Don't throw, as profile is already created
        } else {
          console.log('Talent profile created successfully')
        }
      } catch (talentError: any) {
        console.warn('Warning: Could not create talent_profile:', talentError?.message || talentError)
      }
    } else if (data.role === 'CLIENT') {
      try {
        const { error: recruiterProfileError } = await adminSupabase
          .from('recruiter_profiles')
          .insert({
            user_id: authUser.user.id,
          })
        
        if (recruiterProfileError) {
          console.warn('Warning: Could not create recruiter_profile:', recruiterProfileError.message)
          // Don't throw, as profile is already created
        } else {
          console.log('Recruiter profile created successfully')
        }
      } catch (recruiterError: any) {
        console.warn('Warning: Could not create recruiter_profile:', recruiterError?.message || recruiterError)
      }
    }

    // Also try to create in users table if it exists (for compatibility)
    try {
      const { error: usersTableError } = await adminSupabase
        .from('users')
        .insert({
          id: authUser.user.id,
          email: data.email,
          role: data.role,
        })
      
      if (usersTableError) {
        // Only log warning if it's not a duplicate/unique constraint error
        if (!usersTableError.message?.includes('duplicate') && !usersTableError.message?.includes('unique')) {
          console.warn('Warning: Could not insert into users table:', usersTableError.message)
        }
        // Don't throw, as profiles table is the primary one
      } else {
        console.log('User also created in users table')
      }
    } catch (usersError: any) {
      console.warn('Warning: users table might not exist or has different structure:', usersError?.message || usersError)
      // Don't throw, as profiles table is the primary one
    }

    await logAudit({
      adminId: user.id,
      action: 'USER_CREATED',
      targetType: 'user',
      targetId: authUser.user.id,
      details: { email: data.email, role: data.role },
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error creating user:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', JSON.stringify(error, null, 2))
    return { success: false, error: errorMessage }
  }
}

const updateUserSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST', 'RECRUITER', 'TALENT', 'CANDIDATE']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
})

export async function updateUser(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN', 'QUALITY_ADMIN'])

    const data = updateUserSchema.parse({
      userId: formData.get('userId'),
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      role: formData.get('role'),
      status: formData.get('status'),
    })

    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    const updateData: any = {}
    if (data.fullName !== undefined) updateData.full_name = data.fullName
    if (data.role !== undefined && isSuperAdmin(role)) updateData.role = data.role
    if (data.status !== undefined) updateData.status = data.status

    console.log('Updating user:', data.userId, updateData)

    // Update profile using admin client to bypass RLS
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update(updateData)
      .eq('id', data.userId)

    if (updateError) {
      console.error('Profile update error:', updateError)
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }

    // Update email in auth if provided
    if (data.email) {
      try {
        await adminSupabase.auth.admin.updateUserById(data.userId, {
          email: data.email,
        })
        console.log('Auth email updated successfully')
      } catch (authError) {
        console.warn('Could not update auth email:', authError)
        // Continue even if auth update fails
      }
    }

    await logAudit({
      adminId: user.id,
      action: 'USER_UPDATED',
      targetType: 'user',
      targetId: data.userId,
      details: updateData,
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error updating user:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', JSON.stringify(error, null, 2))
    return { success: false, error: errorMessage }
  }
}

export async function deleteUser(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN'])

    const userId = formData.get('userId')
    if (typeof userId !== 'string') throw new Error('Invalid user ID')

    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    console.log('Attempting to delete user:', userId)

    // Check if user exists in profiles table
    const { data: userData, error: fetchError } = await adminSupabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', userId)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching user:', fetchError)
      throw new Error(`Failed to check user: ${fetchError.message}`)
    }

    if (!userData) {
      // User might not exist in profiles, but might exist in auth
      // Try to check auth first before throwing error
      try {
        const { data: authUser } = await adminSupabase.auth.admin.getUserById(userId)
        if (authUser?.user) {
          console.log('User exists in auth but not in profiles, proceeding with deletion')
          // Continue with deletion - will delete from auth and try to delete from profiles
        } else {
          throw new Error('User not found in profiles or auth')
        }
      } catch (authError: any) {
        console.error('User not found in auth either:', authError)
        throw new Error('User not found')
      }
    } else {
      console.log('User found in profiles:', userData)
    }

    // Delete from profiles using admin client to bypass RLS
    // Only delete if user exists in profiles
    if (userData) {
      const { error: deleteError } = await adminSupabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (deleteError) {
        console.error('Error deleting from profiles:', deleteError)
        throw new Error(`Failed to delete profile: ${deleteError.message}`)
      }
      console.log('Profile deleted successfully')
    } else {
      console.log('User not in profiles table, skipping profile deletion')
    }

    // Delete from auth (always try, even if profile doesn't exist)
    try {
      const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(userId)
      if (authDeleteError) {
        console.warn('Could not delete auth user:', authDeleteError)
        // Don't throw - profile might be deleted even if auth fails
      } else {
        console.log('Auth user deleted successfully')
      }
    } catch (authError: any) {
      console.warn('Error deleting auth user:', authError?.message || authError)
      // Continue even if auth deletion fails - profile might already be deleted
    }

    await logAudit({
      adminId: user.id,
      action: 'USER_DELETED',
      targetType: 'user',
      targetId: userId,
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', JSON.stringify(error, null, 2))
    return { success: false, error: errorMessage }
  }
}

// ============================================
// JOB CRUD OPERATIONS
// ============================================

const createJobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().optional().nullable(),
  remote: z.boolean().optional(),
  salaryMin: z.number().optional().nullable(),
  salaryMax: z.number().optional().nullable(),
  currency: z.string().optional(),
  recruiterId: z.string().uuid(),
  companyId: z.string().uuid().nullable().optional(),
  skillIds: z.array(z.string()).optional(),
})

export async function createJob(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN', 'QUALITY_ADMIN'])

    const recruiterIdInput = formData.get('recruiterId')
    const companyIdInput = formData.get('companyId')

    // Use admin user ID as recruiter if not provided
    // user.id from Supabase Auth is already a UUID
    const finalRecruiterId = (recruiterIdInput && recruiterIdInput !== '' && typeof recruiterIdInput === 'string') 
      ? recruiterIdInput 
      : user.id

    if (!finalRecruiterId || typeof finalRecruiterId !== 'string') {
      throw new Error('Invalid recruiter ID')
    }

    const locationInput = formData.get('location')
    const salaryMinInput = formData.get('salaryMin')
    const salaryMaxInput = formData.get('salaryMax')
    const currencyInput = formData.get('currency')
    const skillIdsInput = formData.get('skillIds')

    // Parse skillIds (can be comma-separated string or array)
    let skillIds: string[] | undefined = undefined
    if (skillIdsInput) {
      if (typeof skillIdsInput === 'string') {
        skillIds = skillIdsInput.split(',').filter(Boolean)
      } else if (Array.isArray(skillIdsInput)) {
        skillIds = skillIdsInput.filter(Boolean) as string[]
      }
    }

    const data = createJobSchema.parse({
      title: formData.get('title'),
      description: formData.get('description'),
      location: locationInput && locationInput !== '' ? locationInput as string : null,
      remote: formData.get('remote') === 'true',
      salaryMin: salaryMinInput && salaryMinInput !== '' ? Number(salaryMinInput) : null,
      salaryMax: salaryMaxInput && salaryMaxInput !== '' ? Number(salaryMaxInput) : null,
      currency: currencyInput && currencyInput !== '' ? currencyInput as string : 'USD',
      recruiterId: finalRecruiterId,
      companyId: (companyIdInput && companyIdInput !== '') ? companyIdInput as string : null,
      skillIds,
    })

    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    const insertData: any = {
      title: data.title,
      description: data.description,
      location: data.location,
      remote: data.remote || false,
      salary_min: data.salaryMin,
      salary_max: data.salaryMax,
      currency: data.currency,
      recruiter_id: data.recruiterId,
      company_id: data.companyId,
      status: 'PUBLISHED',
      published_at: new Date().toISOString(),
    }

    const { error: insertError, data: insertedJob } = await adminSupabase
      .from('jobs')
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      console.error('Insert data:', insertData)
      throw new Error(insertError.message || 'Failed to create job')
    }

    // Handle skills if provided
    if (data.skillIds && data.skillIds.length > 0 && insertedJob) {
      const jobSkillsData = data.skillIds.map((skillId: string) => ({
        A: insertedJob.id, // job_id
        B: skillId, // skill_id
      }))

      const { error: skillsError } = await adminSupabase
        .from('_JobSkills')
        .insert(jobSkillsData)

      if (skillsError) {
        console.error('Error linking skills to job:', skillsError)
        // Don't fail the whole operation if skills fail
      }
    }

    await logAudit({
      adminId: user.id,
      action: 'JOB_CREATED',
      targetType: 'job',
      targetId: insertedJob?.id || null,
      details: data,
    })

    revalidatePath('/admin/jobs')
    return { success: true }
  } catch (error) {
    console.error('Error creating job:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

const updateJobSchema = z.object({
  jobId: z.string().uuid(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']).optional(),
  skillIds: z.array(z.string()).optional(),
})

export async function updateJob(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN', 'QUALITY_ADMIN'])

    const skillIdsInput = formData.get('skillIds')
    let skillIds: string[] | undefined = undefined
    if (skillIdsInput) {
      if (typeof skillIdsInput === 'string') {
        skillIds = skillIdsInput.split(',').filter(Boolean)
      } else if (Array.isArray(skillIdsInput)) {
        skillIds = skillIdsInput.filter(Boolean) as string[]
      }
    }

    const data = updateJobSchema.parse({
      jobId: formData.get('jobId'),
      title: formData.get('title'),
      description: formData.get('description'),
      location: formData.get('location'),
      remote: formData.get('remote') === 'true',
      salaryMin: formData.get('salaryMin') ? Number(formData.get('salaryMin')) : undefined,
      salaryMax: formData.get('salaryMax') ? Number(formData.get('salaryMax')) : undefined,
      currency: formData.get('currency'),
      status: formData.get('status'),
      skillIds,
    })

    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    const updateData: any = {}
    if (data.title) updateData.title = data.title
    if (data.description) updateData.description = data.description
    if (data.location !== undefined) updateData.location = data.location
    if (data.remote !== undefined) updateData.remote = data.remote
    if (data.salaryMin !== undefined) updateData.salary_min = data.salaryMin
    if (data.salaryMax !== undefined) updateData.salary_max = data.salaryMax
    if (data.currency) updateData.currency = data.currency
    if (data.status) {
      updateData.status = data.status
      if (data.status === 'PUBLISHED' && !formData.get('published_at')) {
        updateData.published_at = new Date().toISOString()
      }
    }

    const { error: updateError } = await adminSupabase
      .from('jobs')
      .update(updateData)
      .eq('id', data.jobId)

    if (updateError) throw updateError

    // Handle skills update if provided
    if (data.skillIds !== undefined) {
      // Delete existing job skills
      await adminSupabase
        .from('_JobSkills')
        .delete()
        .eq('A', data.jobId) // A is job_id

      // Insert new job skills
      if (data.skillIds.length > 0) {
        const jobSkillsData = data.skillIds.map((skillId: string) => ({
          A: data.jobId, // job_id
          B: skillId, // skill_id
        }))

        const { error: skillsError } = await adminSupabase
          .from('_JobSkills')
          .insert(jobSkillsData)

        if (skillsError) {
          console.error('Error updating job skills:', skillsError)
          // Don't fail the whole operation if skills fail
        }
      }
    }

    await logAudit({
      adminId: user.id,
      action: 'JOB_UPDATED',
      targetType: 'job',
      targetId: data.jobId,
      details: { ...updateData, skillIds: data.skillIds },
    })

    revalidatePath('/admin/jobs')
    return { success: true }
  } catch (error) {
    console.error('Error updating job:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function deleteJob(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN', 'QUALITY_ADMIN'])

    const jobId = formData.get('jobId')
    if (typeof jobId !== 'string') throw new Error('Invalid job ID')

    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    // Delete job using admin client to bypass RLS
    const { error: deleteError } = await adminSupabase
      .from('jobs')
      .delete()
      .eq('id', jobId)

    if (deleteError) throw deleteError

    await logAudit({
      adminId: user.id,
      action: 'JOB_REJECTED', // Using JOB_REJECTED for deletion (no JOB_DELETED in enum)
      targetType: 'job',
      targetId: jobId,
      details: { action: 'deleted' },
    })

    revalidatePath('/admin/jobs')
    return { success: true }
  } catch (error) {
    console.error('Error deleting job:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ============================================
// SKILL CRUD OPERATIONS
// ============================================

const createSkillSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
})

export async function createSkill(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN', 'QUALITY_ADMIN'])

    const data = createSkillSchema.parse({
      name: formData.get('name'),
      category: formData.get('category'),
    })

    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    const { error: insertError } = await adminSupabase
      .from('skills')
      .insert({
        name: data.name,
        category: data.category || null,
      })

    if (insertError) throw insertError

    await logAudit({
      adminId: user.id,
      action: 'SKILL_CREATED',
      targetType: 'skill',
      targetId: null,
      details: data,
    })

    revalidatePath('/admin/skills')
    return { success: true }
  } catch (error) {
    console.error('Error creating skill:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

const updateSkillSchema = z.object({
  skillId: z.string().uuid(),
  name: z.string().min(1).optional(),
  category: z.string().optional(),
})

export async function updateSkill(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN', 'QUALITY_ADMIN'])

    const data = updateSkillSchema.parse({
      skillId: formData.get('skillId'),
      name: formData.get('name'),
      category: formData.get('category'),
    })

    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.category !== undefined) updateData.category = data.category || null

    const { error: updateError } = await adminSupabase
      .from('skills')
      .update(updateData)
      .eq('id', data.skillId)

    if (updateError) throw updateError

    await logAudit({
      adminId: user.id,
      action: 'SKILL_UPDATED',
      targetType: 'skill',
      targetId: data.skillId,
      details: updateData,
    })

    revalidatePath('/admin/skills')
    return { success: true }
  } catch (error) {
    console.error('Error updating skill:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function deleteSkill(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN', 'QUALITY_ADMIN'])

    const skillId = formData.get('skillId')
    if (typeof skillId !== 'string') throw new Error('Invalid skill ID')

    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    const { error: deleteError } = await adminSupabase
      .from('skills')
      .delete()
      .eq('id', skillId)

    if (deleteError) throw deleteError

    await logAudit({
      adminId: user.id,
      action: 'SKILL_DELETED',
      targetType: 'skill',
      targetId: skillId,
    })

    revalidatePath('/admin/skills')
    return { success: true }
  } catch (error) {
    console.error('Error deleting skill:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ============================================
// APPLICATION CRUD OPERATIONS
// ============================================

const updateApplicationSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(['PENDING', 'REVIEWING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED']).optional(),
  notes: z.string().optional(),
})

export async function updateApplication(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN'])

    const data = updateApplicationSchema.parse({
      applicationId: formData.get('applicationId'),
      status: formData.get('status'),
      notes: formData.get('notes'),
    })

    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    const updateData: any = {}
    if (data.status) updateData.status = data.status
    if (data.notes !== undefined) updateData.notes = data.notes

    const { error: updateError } = await adminSupabase
      .from('applications')
      .update(updateData)
      .eq('id', data.applicationId)

    if (updateError) throw updateError

    await logAudit({
      adminId: user.id,
      action: 'APPLICATION_UPDATED',
      targetType: 'application',
      targetId: data.applicationId,
      details: updateData,
    })

    revalidatePath('/admin/applications')
    return { success: true }
  } catch (error) {
    console.error('Error updating application:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function deleteApplication(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN', 'QUALITY_ADMIN'])

    const applicationId = formData.get('applicationId')
    if (typeof applicationId !== 'string') throw new Error('Invalid application ID')

    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    const { error: deleteError } = await adminSupabase
      .from('applications')
      .delete()
      .eq('id', applicationId)

    if (deleteError) throw deleteError

    await logAudit({
      adminId: user.id,
      action: 'APPLICATION_DELETED',
      targetType: 'application',
      targetId: applicationId,
    })

    revalidatePath('/admin/applications')
    return { success: true }
  } catch (error) {
    console.error('Error deleting application:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ============================================
// TALENT REQUEST CRUD OPERATIONS
// ============================================

const updateTalentRequestSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(['PENDING', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
})

export async function updateTalentRequest(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN', 'SUPPORT_ADMIN', 'QUALITY_ADMIN'])

    const data = updateTalentRequestSchema.parse({
      requestId: formData.get('requestId'),
      status: formData.get('status'),
      notes: formData.get('notes'),
    })

    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    const updateData: any = {}
    if (data.status) updateData.status = data.status
    if (data.notes !== undefined) updateData.notes = data.notes

    const { error: updateError } = await adminSupabase
      .from('talent_requests')
      .update(updateData)
      .eq('id', data.requestId)

    if (updateError) throw updateError

    await logAudit({
      adminId: user.id,
      action: 'TALENT_REQUEST_UPDATED',
      targetType: 'talent_request',
      targetId: data.requestId,
      details: updateData,
    })

    revalidatePath('/admin/talent-requests')
    return { success: true }
  } catch (error) {
    console.error('Error updating talent request:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function deleteTalentRequest(formData: FormData) {
  try {
    const { user, profile, role } = await requireAdmin(['SUPER_ADMIN', 'SUPPORT_ADMIN'])

    const requestId = formData.get('requestId')
    if (typeof requestId !== 'string') throw new Error('Invalid request ID')

    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    const { error: deleteError } = await adminSupabase
      .from('talent_requests')
      .delete()
      .eq('id', requestId)

    if (deleteError) throw deleteError

    await logAudit({
      adminId: user.id,
      action: 'TALENT_REQUEST_DELETED',
      targetType: 'talent_request',
      targetId: requestId,
    })

    revalidatePath('/admin/talent-requests')
    return { success: true }
  } catch (error) {
    console.error('Error deleting talent request:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
