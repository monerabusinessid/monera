'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { createUser, updateUser, deleteUser } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string | null
  full_name: string | null
  role: string | null
  status: string | null
}

interface UserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit' | 'view'
  defaultRole?: 'TALENT' | 'CLIENT' | 'SUPER_ADMIN' | 'QUALITY_ADMIN' | 'SUPPORT_ADMIN' | 'ANALYST'
}

export function UserModal({ user, isOpen, onClose, mode, defaultRole }: UserModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: defaultRole || 'TALENT',
    status: 'ACTIVE',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'TALENT',
        status: user.status || 'ACTIVE',
      })
    } else if (mode === 'create') {
      setFormData({
        fullName: '',
        email: '',
        password: '',
        role: defaultRole || 'TALENT',
        status: 'ACTIVE',
      })
    }
  }, [user, mode, defaultRole])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    const formDataObj = new FormData()
    
    if (mode === 'create') {
      formDataObj.append('email', formData.email)
      formDataObj.append('password', formData.password)
      formDataObj.append('fullName', formData.fullName)
      formDataObj.append('role', formData.role)
      formDataObj.append('status', formData.status)

      const result = await createUser(formDataObj)
      setLoading(false)

      if (result.success) {
        router.refresh()
        onClose()
      } else {
        const errorMsg = result.error || 'Failed to create user'
        console.error('Create user error:', errorMsg)
        alert(`Error: ${errorMsg}`)
      }
    } else if (user) {
      formDataObj.append('userId', user.id)
      formDataObj.append('fullName', formData.fullName)
      formDataObj.append('email', formData.email)
      formDataObj.append('role', formData.role)
      formDataObj.append('status', formData.status)

      const result = await updateUser(formDataObj)
      setLoading(false)

      if (result.success) {
        router.refresh()
        onClose()
      } else {
        const errorMsg = result.error || 'Failed to update user'
        console.error('Update user error:', errorMsg)
        alert(`Error: ${errorMsg}`)
      }
    }
  }

  const handleDelete = async () => {
    if (!user) return
    if (!confirm(`Are you sure you want to delete user ${user.email}? This action cannot be undone.`)) return

    setLoading(true)
    const formDataObj = new FormData()
    formDataObj.append('userId', user.id)

    const result = await deleteUser(formDataObj)
    setLoading(false)

    if (result.success) {
      router.refresh()
      onClose()
    } else {
      alert(result.error || 'Failed to delete user')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {mode === 'create' ? 'Create New User' : mode === 'edit' ? 'Edit User' : 'View User'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              disabled={mode === 'view'}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={mode === 'view'}
              required
            />
          </div>

          {mode === 'create' && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>
          )}

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              disabled={mode === 'view'}
              required
            >
              <option value="TALENT">Talent</option>
              <option value="CLIENT">Client</option>
              <option value="ANALYST">Analyst</option>
              <option value="SUPPORT_ADMIN">Support Admin</option>
              <option value="QUALITY_ADMIN">Quality Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              disabled={mode === 'view'}
              required
            >
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </Select>
          </div>

          {(mode === 'create' || mode === 'edit') && (
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (mode === 'create' ? 'Creating...' : 'Saving...') : (mode === 'create' ? 'Create User' : 'Save Changes')}
              </Button>
              {mode === 'edit' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            </div>
          )}

          {mode === 'view' && (
            <div className="pt-4">
              <Button type="button" onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
