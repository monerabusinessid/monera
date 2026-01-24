export type AdminRole = 'SUPER_ADMIN' | 'QUALITY_ADMIN' | 'SUPPORT_ADMIN' | 'ANALYST'

export const ADMIN_ROLES: AdminRole[] = [
  'SUPER_ADMIN',
  'QUALITY_ADMIN',
  'SUPPORT_ADMIN',
  'ANALYST',
]

// Check if user is any admin
export function isAdmin(role: string): role is AdminRole {
  return ADMIN_ROLES.includes(role as AdminRole)
}

// Check if user is super admin
export function isSuperAdmin(role: string): boolean {
  return role === 'SUPER_ADMIN'
}

// Check if user is quality admin
export function isQualityAdmin(role: string): boolean {
  return role === 'QUALITY_ADMIN' || role === 'SUPER_ADMIN'
}

// Check if user is support admin
export function isSupportAdmin(role: string): boolean {
  return role === 'SUPPORT_ADMIN' || role === 'SUPER_ADMIN'
}

// Check if user is analyst
export function isAnalyst(role: string): boolean {
  return role === 'ANALYST' || role === 'SUPER_ADMIN'
}

// Route access permissions
export const ADMIN_ROUTE_PERMISSIONS: Record<string, AdminRole[]> = {
  '/admin/dashboard': ADMIN_ROLES,
  '/admin/users': ['SUPER_ADMIN', 'QUALITY_ADMIN'],
  '/admin/users/talent': ['SUPER_ADMIN', 'QUALITY_ADMIN'],
  '/admin/users/recruiter': ['SUPER_ADMIN', 'QUALITY_ADMIN'],
  '/admin/talent-review': ['SUPER_ADMIN', 'QUALITY_ADMIN'],
  '/admin/jobs': ['SUPER_ADMIN', 'QUALITY_ADMIN'],
  '/admin/applications': ADMIN_ROLES,
  '/admin/skills': ['SUPER_ADMIN', 'QUALITY_ADMIN'],
  '/admin/analytics': ['SUPER_ADMIN', 'ANALYST'],
  '/admin/settings': ['SUPER_ADMIN'],
  '/admin/audit-logs': ADMIN_ROLES,
}

// Check if user has access to a route
export function hasRouteAccess(userRole: string, route: string): boolean {
  // Super admin has access to everything
  if (isSuperAdmin(userRole)) {
    return true
  }

  // Check route permissions
  for (const [routePattern, allowedRoles] of Object.entries(ADMIN_ROUTE_PERMISSIONS)) {
    if (route.startsWith(routePattern)) {
      return allowedRoles.includes(userRole as AdminRole)
    }
  }

  return false
}

// Get user's admin capabilities
export function getAdminCapabilities(role: string) {
  return {
    canManageAdmins: isSuperAdmin(role),
    canReviewTalent: isQualityAdmin(role),
    canReviewJobs: isQualityAdmin(role),
    canManageSettings: isSuperAdmin(role),
    canViewAnalytics: isAnalyst(role) || isSuperAdmin(role),
    canSupportUsers: isSupportAdmin(role),
    canAccessDatabase: isSuperAdmin(role),
    canViewAuditLog: isSuperAdmin(role),
  }
}
