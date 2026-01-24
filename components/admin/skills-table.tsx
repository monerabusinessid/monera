'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SkillModal } from './skill-modal'

interface Skill {
  id: string
  name: string
  category: string | null
  created_at: string
}

interface SkillsTableProps {
  skills: Skill[]
  skillUsage: Map<string, number>
}

export function SkillsTable({ skills, skillUsage }: SkillsTableProps) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [modalMode, setModalMode] = useState<'edit' | 'view'>('view')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSkills = skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6">
        <Input
          placeholder="Search skills by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">Skill Name</th>
            <th className="text-left p-4">Category</th>
            <th className="text-left p-4">Usage Count</th>
            <th className="text-left p-4">Created</th>
            <th className="text-left p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSkills.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-gray-500">
                No skills found
              </td>
            </tr>
          ) : (
            filteredSkills.map((skill) => (
              <tr key={skill.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{skill.name}</td>
                <td className="p-4">
                  {skill.category ? (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {skill.category}
                    </span>
                  ) : (
                    <span className="text-gray-400">Uncategorized</span>
                  )}
                </td>
                <td className="p-4">
                  <span className="font-semibold">{skillUsage.get(skill.id) || 0}</span>
                  <span className="text-sm text-gray-500 ml-1">talents</span>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(skill.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSkill(skill)
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
                        setSelectedSkill(skill)
                        setModalMode('edit')
                        setIsModalOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>

      <SkillModal
        skill={selectedSkill}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedSkill(null)
        }}
        mode={modalMode}
      />
    </div>
  )
}
