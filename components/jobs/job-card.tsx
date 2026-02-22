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
    <Card className="hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-brand-purple/30 rounded-xl overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-br from-white to-purple-50/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 mb-3 leading-tight">
              <Link href={`/jobs/${job.id}`} className="hover:text-brand-purple transition-colors">
                {job.title}
              </Link>
            </CardTitle>
            
            {job.company && (
              <div className="flex items-center gap-3 mb-3">
                {job.company.logoUrl ? (
                  <img 
                    src={job.company.logoUrl} 
                    alt={`${job.company.name} logo`}
                    className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-purple to-purple-700 flex items-center justify-center text-white font-bold text-sm">
                    {job.company.name[0]}
                  </div>
                )}
                <span className="text-base font-semibold text-gray-800">{job.company.name}</span>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location || 'Remote'}
              </span>
              {job.remote && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                  🌍 Remote
                </span>
              )}
              {formatSalary() && (
                <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatSalary()}
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right flex flex-col items-end gap-2">
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {formatDate(job.publishedAt || job.createdAt)}
            </div>
            <div className="flex gap-2">
              {onSave && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSave(job.id)}
                  className={`rounded-lg ${isSaved ? 'text-red-500 border-red-500 hover:bg-red-50' : 'hover:bg-gray-50'}`}
                >
                  {isSaved ? '❤️' : '🤍'}
                </Button>
              )}
              {showApplyButton && (
                <Button
                  size="sm"
                  onClick={() => onApply?.(job.id)}
                  disabled={isApplied}
                  className={`rounded-lg font-semibold ${isApplied ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-purple hover:bg-purple-700 shadow-md hover:shadow-lg'}`}
                >
                  {isApplied ? '✓ Applied' : 'Apply Now'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-5">
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {job.description.length > 180 
            ? `${job.description.substring(0, 180)}...` 
            : job.description
          }
        </p>
        
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill.id}
                className="bg-purple-50 text-brand-purple border border-purple-200 px-3 py-1.5 rounded-lg text-xs font-semibold"
              >
                {skill.name}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg font-medium">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}