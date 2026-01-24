'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Layout already handles auth, so we can fetch directly
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      // TODO: Implement API endpoint for transactions
      // For now, show empty state
      setTransactions([])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loadingData) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading transactions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-1">View all your transactions</p>
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>Complete history of your transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No transactions found</p>
              <p className="text-sm mt-2">Transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="border-b pb-4">
                  {/* Transaction item */}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
