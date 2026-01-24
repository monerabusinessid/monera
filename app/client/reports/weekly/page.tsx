'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function WeeklyReportsPage() {
  const [data, setData] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    // Layout already handles auth, so we can fetch directly
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // TODO: Implement API endpoint for weekly reports
      // For now, show placeholder data
      setData({
        totalSpent: 0,
        jobsPosted: 0,
        applicationsReceived: 0,
      })
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loadingData) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading reports...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Weekly Financial Summary</h1>
        <p className="text-gray-600 mt-1">View your weekly spending and activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">${data?.totalSpent || 0}</div>
            <p className="text-xs text-gray-500 mt-2">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Jobs Posted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{data?.jobsPosted || 0}</div>
            <p className="text-xs text-gray-500 mt-2">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{data?.applicationsReceived || 0}</div>
            <p className="text-xs text-gray-500 mt-2">Received this week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Detailed breakdown of your weekly activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p>Weekly activity data will be displayed here</p>
            <p className="text-sm mt-2">This feature is coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
