'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSystemSettings } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

interface Setting {
  key: string
  value: any
  description?: string
}

interface SystemSettingsFormProps {
  settings: Map<string, Setting>
}

export function SystemSettingsForm({ settings }: SystemSettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpdate = async (key: string, value: any) => {
    setLoading(key)
    const formData = new FormData()
    formData.append('key', key)
    formData.append('value', JSON.stringify(value))
    const result = await updateSystemSettings(formData)
    if (result.success) {
      router.refresh()
      alert('Settings updated successfully')
    } else {
      alert(result.error || 'Failed to update settings')
    }
    setLoading(null)
  }

  const profileThreshold = settings.get('profile_readiness_threshold')?.value?.value || 80
  const matchingWeightSkills = settings.get('matching_weight_skills')?.value?.value || 0.4
  const matchingWeightExperience =
    settings.get('matching_weight_experience')?.value?.value || 0.3
  const matchingWeightRate = settings.get('matching_weight_rate')?.value?.value || 0.3

  return (
    <div className="space-y-6">
      {/* Profile Readiness Threshold */}
      <div>
        <Label htmlFor="profile_threshold">Profile Readiness Threshold (%)</Label>
        <div className="flex items-center space-x-4 mt-2">
          <Input
            id="profile_threshold"
            type="number"
            min="0"
            max="100"
            defaultValue={profileThreshold}
            className="w-32"
          />
          <Button
            onClick={() => {
              const input = document.getElementById('profile_threshold') as HTMLInputElement
              handleUpdate('profile_readiness_threshold', { value: parseFloat(input.value) })
            }}
            disabled={loading === 'profile_readiness_threshold'}
          >
            Update
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Minimum profile completion percentage required for readiness
        </p>
      </div>

      {/* Matching Weights */}
      <div>
        <Label>Job Matching Weights</Label>
        <p className="text-sm text-gray-500 mb-4">
          Configure how different factors contribute to job matching (must sum to 1.0)
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="weight_skills">Skills Weight</Label>
            <div className="flex items-center space-x-4 mt-2">
              <Input
                id="weight_skills"
                type="number"
                min="0"
                max="1"
                step="0.1"
                defaultValue={matchingWeightSkills}
                className="w-32"
              />
              <Button
                onClick={() => {
                  const input = document.getElementById('weight_skills') as HTMLInputElement
                  handleUpdate('matching_weight_skills', { value: parseFloat(input.value) })
                }}
                disabled={loading === 'matching_weight_skills'}
              >
                Update
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="weight_experience">Experience Weight</Label>
            <div className="flex items-center space-x-4 mt-2">
              <Input
                id="weight_experience"
                type="number"
                min="0"
                max="1"
                step="0.1"
                defaultValue={matchingWeightExperience}
                className="w-32"
              />
              <Button
                onClick={() => {
                  const input = document.getElementById('weight_experience') as HTMLInputElement
                  handleUpdate('matching_weight_experience', { value: parseFloat(input.value) })
                }}
                disabled={loading === 'matching_weight_experience'}
              >
                Update
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="weight_rate">Rate Weight</Label>
            <div className="flex items-center space-x-4 mt-2">
              <Input
                id="weight_rate"
                type="number"
                min="0"
                max="1"
                step="0.1"
                defaultValue={matchingWeightRate}
                className="w-32"
              />
              <Button
                onClick={() => {
                  const input = document.getElementById('weight_rate') as HTMLInputElement
                  handleUpdate('matching_weight_rate', { value: parseFloat(input.value) })
                }}
                disabled={loading === 'matching_weight_rate'}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
