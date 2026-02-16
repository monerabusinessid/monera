'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { UserModal } from './user-modal'
import { deleteUser } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string | null
  full_name: string | null
  role: string | null
  status: string | null
  created_at: string
  // Talent specific
  hourly_rate?: number | null
  profile_completion?: number | null
  is_profile_ready?: boolean | null
  // Client specific
  company_name?: string | null
  jobs_count?: number | null
}

interface UsersTableProps {
  users: User[]
  userType?: 'admin' | 'talent' | 'client' // Optional: untuk menentukan kolom yang ditampilkan
  canDelete?: boolean
}

export function UsersTable({ users, userType, canDelete }: UsersTableProps) {
  // Auto-detect userType from first user's role if not provided
  if (!userType && users.length > 0) {
    const firstRole = users[0]?.role || ''
    if (firstRole.includes('ADMIN') || firstRole === 'ANALYST') {
      userType = 'admin'
    } else if (firstRole === 'CLIENT') {
      userType = 'client'
    } else if (firstRole === 'TALENT') {
      userType = 'talent'
    }
  }
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalMode, setModalMode] = useState<'edit' | 'view'>('view')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
  const router = useRouter()

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const roleOptions = Array.from(new Set(users.map((u) => u.role).filter(Boolean))).sort()
  const statusOptions = Array.from(new Set(users.map((u) => u.status).filter(Boolean))).sort()

  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      !normalizedQuery ||
      u.email?.toLowerCase().includes(normalizedQuery) ||
      u.full_name?.toLowerCase().includes(normalizedQuery) ||
      u.role?.toLowerCase().includes(normalizedQuery) ||
      u.id.toLowerCase().includes(normalizedQuery)

    const matchesRole = roleFilter === 'all' || (u.role || '').toUpperCase() === roleFilter
    const matchesStatus = statusFilter === 'all' || (u.status || '').toUpperCase() === statusFilter

    return matchesQuery && matchesRole && matchesStatus
  })

  const getRoleColor = (role: string) => {
    if (!role) return 'bg-gray-100 text-gray-700'
    if (role.includes('ADMIN')) return 'bg-purple-100 text-purple-700'
    if (role === 'CLIENT') return 'bg-blue-100 text-blue-700'
    if (role === 'TALENT') return 'bg-green-100 text-green-700'
    return 'bg-gray-100 text-gray-700'
  }

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-700'
    if (status === 'SUSPENDED') return 'bg-red-100 text-red-700'
    if (status === 'ACTIVE') return 'bg-green-100 text-green-700'
    if (status.includes('PENDING')) return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-700'
  }

  const formatLabel = (value: string | null) => {
    if (!value) return 'N/A'
    return value
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getInitials = (name?: string | null, email?: string | null) => {
    const base = name || email || ''
    if (!base) return 'U'
    const parts = base.replace(/@.*/, '').split(' ')
    const initials = parts
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
    return initials || base.charAt(0).toUpperCase()
  }

  const getMeta = (user: User) => {
    if (userType === 'talent') {
      const parts: string[] = []
      if (user.hourly_rate) parts.push(`$${user.hourly_rate.toFixed(2)}/hr`)
      if (user.is_profile_ready) {
        parts.push('Ready')
      } else if (user.profile_completion !== null && user.profile_completion !== undefined) {
        parts.push(`Profile ${Math.round(user.profile_completion)}%`)
      }
      return parts.length > 0 ? parts.join(' • ') : null
    }

    if (userType === 'client') {
      const parts: string[] = []
      if (user.company_name) parts.push(user.company_name)
      if (user.jobs_count !== null && user.jobs_count !== undefined) parts.push(`Jobs ${user.jobs_count}`)
      return parts.length > 0 ? parts.join(' • ') : null
    }

    return null
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete ${user.email || user.full_name || 'this user'}? This action cannot be undone.`)) {
      return
    }

    setDeleteLoadingId(user.id)
    const formDataObj = new FormData()
    formDataObj.append('userId', user.id)

    const result = await deleteUser(formDataObj)
    setDeleteLoadingId(null)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to delete user')
    }
  }

  const showDelete = !!canDelete && (userType === 'talent' || userType === 'client')
  const hasFilters = normalizedQuery || roleFilter !== 'all' || statusFilter !== 'all'

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.4a7.25 7.25 0 11-14.5 0 7.25 7.25 0 0114.5 0z" />
            </svg>
          </span>
          <Input
            placeholder="Search users by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border-gray-200 bg-white pl-11 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 rounded-full border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 shadow-sm focus:outline-none"
            >
              <option value="all">Role: All</option>
              {roleOptions.map((role) => (
                <option key={role} value={role.toUpperCase()}>
                  {formatLabel(role)}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-full border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 shadow-sm focus:outline-none"
            >
              <option value="all">Status: All</option>
              {statusOptions.map((status) => (
                <option key={status} value={status.toUpperCase()}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setRoleFilter('all')
              setStatusFilter('all')
            }}
            className="rounded-full text-gray-500 hover:text-gray-700"
            disabled={!hasFilters}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-brand-purple"
                  aria-label="Select all users"
                />
              </th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Joined Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="text-sm text-gray-700">
                  <td className="bg-white px-4 py-4 rounded-l-2xl shadow-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-brand-purple"
                      aria-label={`Select ${u.full_name || u.email || 'user'}`}
                    />
                  </td>
                  <td className="bg-white px-4 py-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-purple/10 text-sm font-semibold text-brand-purple">
                        {getInitials(u.full_name, u.email)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{u.full_name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{u.email || 'N/A'}</p>
                        {getMeta(u) && <p className="text-xs text-gray-400 mt-1">{getMeta(u)}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="bg-white px-4 py-4 shadow-sm">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleColor(u.role || '')}`}>
                      {formatLabel(u.role)}
                    </span>
                  </td>
                  <td className="bg-white px-4 py-4 shadow-sm">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(u.status)}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {formatLabel(u.status || 'ACTIVE')}
                    </span>
                  </td>
                  <td className="bg-white px-4 py-4 text-xs text-gray-500 shadow-sm hidden md:table-cell">
                    {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
                  </td>
                  <td className="bg-white px-4 py-4 shadow-sm rounded-r-2xl">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(u)
                          setModalMode('view')
                          setIsModalOpen(true)
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(u)
                          setModalMode('edit')
                          setIsModalOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                      {showDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(u)}
                          disabled={deleteLoadingId === u.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          {deleteLoadingId === u.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedUser(null)
        }}
        mode={modalMode}
      />
    </div>
  )
}
