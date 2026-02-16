import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface JobCardProps {
  job: {
    id: string
    title: string
    description: string
    location?: string
    remote: boolean
    salaryMin?: number
    salaryMax?: number
    currency?: string
    company?: {
      name: string
      logoUrl?: string
    }
    skills: Array<{
      id: string
      name: string
    }>
    createdAt: string
    publishedAt?: string
  }
  showApplyButton?: boolean
  onApply?: (jobId: string) => void
  isApplied?: boolean
  onSave?: (jobId: string) => void
  isSaved?: boolean
}

export function JobCard({ job, showApplyButton = true, onApply, isApplied, onSave, isSaved }: JobCardProps) {
  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null
    
    const currency = job.currency || 'USD'
    const formatNumber = (num: number) => new Intl.NumberFormat().format(num)
    
    if (job.salaryMin && job.salaryMax) {
      return `${currency} ${formatNumber(job.salaryMin)} - ${formatNumber(job.salaryMax)}`
    } else if (job.salaryMin) {
      return `${currency} ${formatNumber(job.salaryMin)}+`
    } else if (job.salaryMax) {
      return `Up to ${currency} ${formatNumber(job.salaryMax)}`
    }
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              <Link href={`/jobs/${job.id}`} className="hover:text-brand-purple transition-colors">
                {job.title}
              </Link>
            </CardTitle>
            
            {job.company && (
              <div className="flex items-center gap-2 mb-2">
                {job.company.logoUrl && (
                  <img 
                    src={job.company.logoUrl} 
                    alt={`${job.company.name} logo`}
                    className="w-6 h-6 rounded object-cover"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">{job.company.name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                📍 {job.location || (job.remote ? 'Remote' : 'Not specified')}
              </span>
              {job.remote && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  Remote
                </span>
              )}
              {formatSalary() && (
                <span className="flex items-center gap-1">
                  💰 {formatSalary()}
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-2">
              {formatDate(job.publishedAt || job.createdAt)}
            </div>
            <div className="flex gap-2">
              {onSave && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSave(job.id)}
                  className={isSaved ? 'text-red-600 border-red-600' : ''}
                >
                  {isSaved ? '❤️' : '🤍'}
                </Button>
              )}
              {showApplyButton && (
                <Button
                  size="sm"
                  onClick={() => onApply?.(job.id)}
                  disabled={isApplied}
                  className={isApplied ? 'bg-gray-400' : 'bg-brand-purple hover:bg-purple-700'}
                >
                  {isApplied ? 'Applied' : 'Apply'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
          {job.description.length > 150 
            ? `${job.description.substring(0, 150)}...` 
            : job.description
          }
        </p>
        
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 5).map((skill) => (
              <span
                key={skill.id}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium"
              >
                {skill.name}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="text-xs text-gray-500">
                +{job.skills.length - 5} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}