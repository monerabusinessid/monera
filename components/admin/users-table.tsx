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
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalMode, setModalMode] = useState<'edit' | 'view'>('view')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
  const router = useRouter()

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleColor = (role: string) => {
    if (!role) return 'bg-gray-100 text-gray-700'
    if (role.includes('ADMIN')) return 'bg-purple-100 text-purple-700'
    if (role === 'CLIENT') return 'bg-blue-100 text-blue-700'
    if (role === 'TALENT') return 'bg-green-100 text-green-700'
    return 'bg-gray-100 text-gray-700'
  }

  const getStatusColor = (status: string | null) => {
    if (status === 'SUSPENDED') return 'bg-red-100 text-red-700'
    if (status === 'ACTIVE') return 'bg-green-100 text-green-700'
    return 'bg-gray-100 text-gray-700'
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

  return (
    <div>
      <div className="mb-6">
        <Input
          placeholder="Search users by email, name, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4 hidden sm:table-cell">Role</th>
              {userType === 'talent' && <th className="text-left p-4 hidden md:table-cell">Hourly Rate</th>}
              {userType === 'talent' && <th className="text-left p-4 hidden md:table-cell">Profile Status</th>}
              {userType === 'client' && <th className="text-left p-4 hidden md:table-cell">Company</th>}
              {userType === 'client' && <th className="text-left p-4 hidden md:table-cell">Jobs Posted</th>}
              <th className="text-left p-4 hidden sm:table-cell">Status</th>
              <th className="text-left p-4 hidden lg:table-cell">Joined</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={userType === 'talent' ? 8 : userType === 'client' ? 8 : 6} className="p-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{u.full_name || 'N/A'}</td>
                  <td className="p-4">{u.email || 'N/A'}</td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(u.role || '')}`}>
                      {(u.role || 'N/A').replace(/_/g, ' ')}
                    </span>
                  </td>
                  {userType === 'talent' && (
                    <td className="p-4 text-sm hidden md:table-cell">
                      {u.hourly_rate ? `$${u.hourly_rate.toFixed(2)}/hr` : 'N/A'}
                    </td>
                  )}
                  {userType === 'talent' && (
                    <td className="p-4 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        u.is_profile_ready 
                          ? 'bg-green-100 text-green-700' 
                          : u.profile_completion && u.profile_completion >= 80
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.is_profile_ready ? 'Ready' : u.profile_completion ? `${u.profile_completion}%` : 'Incomplete'}
                      </span>
                    </td>
                  )}
                  {userType === 'client' && (
                    <td className="p-4 text-sm hidden md:table-cell">{u.company_name || 'N/A'}</td>
                  )}
                  {userType === 'client' && (
                    <td className="p-4 text-sm hidden md:table-cell">{u.jobs_count || 0}</td>
                  )}
                  <td className="p-4 hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(u.status)}`}>
                      {u.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 hidden lg:table-cell">
                    {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
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
                        variant="outline"
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
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(u)}
                          disabled={deleteLoadingId === u.id}
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
