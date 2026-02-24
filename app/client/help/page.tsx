'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
export const runtime = 'edge'

const faqCategories = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I post a job?',
        answer: 'Click on "Jobs" in the navigation menu, then select "Post a Job". Fill in the job details including title, description, requirements, and required skills. Once submitted, your job will be reviewed and published.',
      },
      {
        question: 'How do I find talent?',
        answer: 'Use the "Talent" menu and select "Find Talent" to search for freelancers. You can filter by skills, location, and other criteria to find the perfect match for your project.',
      },
      {
        question: 'How do I manage applications?',
        answer: 'Go to "Jobs" → "Applications" to view all applications for your job postings. You can review, shortlist, accept, or reject applications from there.',
      },
    ],
  },
  {
    title: 'Managing Jobs',
    items: [
      {
        question: 'Can I edit a job after posting?',
        answer: 'Yes! Go to "My Jobs", find the job you want to edit, and click "Edit". You can update any details including title, description, requirements, and skills.',
      },
      {
        question: 'How do I close a job posting?',
        answer: 'In "My Jobs", find the job you want to close and click "Edit". Change the status to "Closed" and save. This will prevent new applications.',
      },
      {
        question: 'What happens when I delete a job?',
        answer: 'Deleting a job will permanently remove it from the platform. All associated applications will also be removed. This action cannot be undone.',
      },
    ],
  },
  {
    title: 'Talent & Hiring',
    items: [
      {
        question: 'How do I request specific talent?',
        answer: 'Use "Talent" → "Request Talent" to submit a custom talent request. Fill in the details about what you\'re looking for, and our team will help you find the right match.',
      },
      {
        question: 'How do I view talent projects?',
        answer: 'Go to "Talent" → "Projects" to see portfolios and projects from other professionals. This helps you evaluate their work quality.',
      },
      {
        question: 'Can I save talent profiles?',
        answer: 'Yes! When viewing a talent profile, you can save them for later. Saved profiles can be accessed from your dashboard.',
      },
    ],
  },
  {
    title: 'Messages & Communication',
    items: [
      {
        question: 'How do I message talent?',
        answer: 'Go to "Messages" in the navigation bar. You can start a conversation with any talent who has applied to your jobs or who you\'ve interacted with.',
      },
      {
        question: 'Can I send attachments in messages?',
        answer: 'Currently, messages support text only. File sharing features are coming soon.',
      },
    ],
  },
  {
    title: 'Reports & Analytics',
    items: [
      {
        question: 'What reports are available?',
        answer: 'You can view Weekly Financial Summary, Transaction History, and Spending by Activity from the "Reports" menu.',
      },
      {
        question: 'How often are reports updated?',
        answer: 'Reports are updated in real-time based on your activity. Financial summaries are calculated weekly.',
      },
    ],
  },
  {
    title: 'Account & Settings',
    items: [
      {
        question: 'How do I update my profile?',
        answer: 'Click on your profile icon in the top right, then select "Account Settings". You can update your name, phone, and company information there.',
      },
      {
        question: 'How do I change my password?',
        answer: 'Go to "Account Settings" → "Security" section and click "Change Password". You\'ll receive an email with instructions.',
      },
      {
        question: 'Can I delete my account?',
        answer: 'Account deletion is available through Account Settings. Please note that this action is permanent and will remove all your data.',
      },
    ],
  },
]

const quickLinks = [
  { href: '/client/post-job', label: 'Post Your First Job', icon: '➕' },
  { href: '/client/find-talent', label: 'Find Talent', icon: '🔍' },
  { href: '/client/messages', label: 'Contact Support', icon: '💬' },
  { href: '/client/settings', label: 'Account Settings', icon: '⚙️' },
]

export default function HelpPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
        <p className="text-gray-600 mt-1">Find answers to common questions and get support</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{link.icon}</div>
                <p className="font-medium text-gray-900">{link.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* FAQ Sections */}
      <div className="space-y-6">
        {faqCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.items.map((item, index) => (
                  <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.question}</h3>
                    <p className="text-gray-600 text-sm">{item.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Support */}
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>Our support team is here to assist you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/client/messages">
              <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
                Contact Support
              </Button>
            </Link>
            <a href="mailto:monerabusiness.id@gmail.com">
              <Button variant="outline" className="w-full sm:w-auto">
                Email Us
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
