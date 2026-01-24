'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSkill, updateSkill, deleteSkill } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

interface Skill {
  id: string
  name: string
  category: string | null
  created_at: string
}

interface SkillModalProps {
  skill: Skill | null
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit' | 'view'
}

export function SkillModal({ skill, isOpen, onClose, mode }: SkillModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
  })

  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name || '',
        category: skill.category || '',
      })
    } else if (mode === 'create') {
      setFormData({
        name: '',
        category: '',
      })
    }
  }, [skill, mode])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    const formDataObj = new FormData()

    if (mode === 'create') {
      formDataObj.append('name', formData.name)
      if (formData.category) formDataObj.append('category', formData.category)

      const result = await createSkill(formDataObj)
      setLoading(false)

      if (result.success) {
        router.refresh()
        onClose()
      } else {
        alert(result.error || 'Failed to create skill')
      }
    } else if (skill) {
      formDataObj.append('skillId', skill.id)
      if (formData.name) formDataObj.append('name', formData.name)
      formDataObj.append('category', formData.category)

      const result = await updateSkill(formDataObj)
      setLoading(false)

      if (result.success) {
        router.refresh()
        onClose()
      } else {
        alert(result.error || 'Failed to update skill')
      }
    }
  }

  const handleDelete = async () => {
    if (!skill) return
    if (!confirm(`Are you sure you want to delete skill "${skill.name}"? This action cannot be undone.`)) return

    setLoading(true)
    const formDataObj = new FormData()
    formDataObj.append('skillId', skill.id)

    const result = await deleteSkill(formDataObj)
    setLoading(false)

    if (result.success) {
      router.refresh()
      onClose()
    } else {
      alert(result.error || 'Failed to delete skill')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {mode === 'create' ? 'Create New Skill' : mode === 'edit' ? 'Edit Skill' : 'View Skill'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Skill Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={mode === 'view'}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={mode === 'view'}
              placeholder="e.g., Programming, Design, Marketing"
            />
          </div>

          {(mode === 'create' || mode === 'edit') && (
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (mode === 'create' ? 'Creating...' : 'Saving...') : (mode === 'create' ? 'Create Skill' : 'Save Changes')}
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
