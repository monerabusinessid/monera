'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SpendingPage() {
  const [data, setData] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    // Layout already handles auth, so we can fetch directly
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // TODO: Implement API endpoint for spending analysis
      // For now, show placeholder data
      setData({
        byCategory: [],
        trends: [],
      })
    } catch (error) {
      console.error('Failed to fetch spending data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loadingData) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading spending data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Spending by Activity</h1>
        <p className="text-gray-600 mt-1">Analyze your spending patterns</p>
      </div>

      {/* Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Breakdown of spending by activity type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <p>Spending breakdown will be displayed here</p>
              <p className="text-sm mt-2">This feature is coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending Trends</CardTitle>
            <CardDescription>Monthly spending trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <p>Spending trends chart will be displayed here</p>
              <p className="text-sm mt-2">This feature is coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
