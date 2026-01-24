'use client'

import { format } from 'date-fns'

interface AuditLog {
  id: string
  action: string
  target_type: string
  target_id: string | null
  details: any
  created_at: string
  admin: {
    id: string
    full_name: string | null
    role: string
  } | null
}

interface AuditLogsTableProps {
  logs: AuditLog[]
}

export function AuditLogsTable({ logs }: AuditLogsTableProps) {
  const getActionColor = (action: string) => {
    if (action.includes('APPROVED') || action.includes('UNSUSPENDED')) {
      return 'bg-green-100 text-green-700'
    }
    if (action.includes('REJECTED') || action.includes('SUSPENDED')) {
      return 'bg-red-100 text-red-700'
    }
    return 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">Timestamp</th>
            <th className="text-left p-4">Admin</th>
            <th className="text-left p-4">Action</th>
            <th className="text-left p-4">Target</th>
            <th className="text-left p-4">Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-gray-500">
                No audit logs found
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-600">
                  {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="p-4">
                  <div>
                    <div className="font-medium">{log.admin?.full_name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{log.admin?.role || 'N/A'}</div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="p-4">
                  <div>
                    <div className="text-sm font-medium">{log.target_type}</div>
                    {log.target_id && (
                      <div className="text-xs text-gray-500">{log.target_id.substring(0, 8)}...</div>
                    )}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
