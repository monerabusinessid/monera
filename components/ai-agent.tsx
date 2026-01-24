'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AIAgent() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI recruitment consultant. I can help you with:\n\n• Finding the right talent\n• Posting effective job descriptions\n• Understanding profile readiness\n• Best practices for hiring\n\nWhat would you like to know?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response (in production, this would call an AI API)
    setTimeout(() => {
      const response = generateAIResponse(input)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1000)
  }

  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes('talent') || lowerQuery.includes('find') || lowerQuery.includes('search')) {
      return `To find the right talent on Monera:\n\n1. Use our Talent Search feature to filter by:\n   • Skills and expertise\n   • Profile readiness (look for "Ready ✓" badge)\n   • Hourly rate range\n   • Availability status\n\n2. Profile readiness ensures quality - only candidates with 80%+ completion can apply to jobs.\n\n3. Review full profiles including portfolio, experience, and skills before inviting.\n\nWould you like help with posting a job or understanding our matching system?`
    }

    if (lowerQuery.includes('job') || lowerQuery.includes('post') || lowerQuery.includes('create')) {
      return `Here's how to post an effective job on Monera:\n\n1. **Clear Title**: Be specific about the role (e.g., "Senior React Developer" not just "Developer")\n\n2. **Detailed Description**: Include:\n   • Project scope and goals\n   • Required skills (be specific)\n   • Expected timeline\n   • Budget range\n\n3. **Required Skills**: List 3-5 key skills to get better matches\n\n4. **Budget**: Set a realistic range to attract quality talent\n\n5. **Remote Options**: Specify if remote, hybrid, or onsite\n\nReady to post? I can guide you through the process!`
    }

    if (lowerQuery.includes('readiness') || lowerQuery.includes('profile') || lowerQuery.includes('ready')) {
      return `Profile Readiness is our quality-first system:\n\n**What it means:**\n• Candidates must complete 80%+ of their profile\n• Includes: full name, headline (5+ words), 3+ skills, bio (100+ chars), hourly rate, portfolio URL, and availability\n\n**Why it matters:**\n• Only ready profiles can apply to jobs\n• Reduces spam and low-quality applications\n• Higher success rate for both parties\n\n**How to use it:**\n• Look for "Ready ✓" badge on candidate profiles\n• Filter talent search by "Profile Ready" status\n• Ready candidates are more likely to be serious and prepared\n\nThis ensures you only see candidates who are ready to work!`
    }

    if (lowerQuery.includes('hire') || lowerQuery.includes('best practice') || lowerQuery.includes('tips')) {
      return `Best practices for hiring on Monera:\n\n1. **Use Talent Search First**: Browse vetted talent before posting jobs\n\n2. **Check Profile Readiness**: Prioritize candidates with "Ready ✓" badge\n\n3. **Review Portfolios**: Look at their work samples and experience\n\n4. **Clear Communication**: Set expectations upfront in job description\n\n5. **Quick Response**: Respond to applications within 24-48 hours\n\n6. **Use Direct Invites**: Invite specific talent to your jobs for better matches\n\n7. **Quality Over Quantity**: Focus on 3-5 strong candidates rather than many applications\n\nNeed help with a specific hiring challenge?`
    }

    if (lowerQuery.includes('pricing') || lowerQuery.includes('cost') || lowerQuery.includes('fee')) {
      return `Monera pricing for recruiters:\n\n**Starter Plan - $49/month:**\n• Post up to 3 jobs\n• Talent search\n• View full profiles\n• Basic applicant management\n\n**Professional Plan - $149/month:**\n• Unlimited job posts\n• Advanced talent search\n• Priority matching\n• Full applicant management\n• Direct talent invites\n• Analytics & reports\n\nAll plans include:\n• Profile readiness filtering\n• Quality-first matching\n• Email support\n\nWould you like to see a comparison or have questions about features?`
    }

    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('help')) {
      return `I'm here to help! I can assist with:\n\n• Finding and hiring talent\n• Posting effective job descriptions\n• Understanding profile readiness system\n• Best practices for recruitment\n• Platform features and pricing\n\nWhat would you like to know?`
    }

    return `I understand you're asking about "${query}". Let me help you with that!\n\nOn Monera, we focus on quality-first hiring. Here are some key points:\n\n• Use Talent Search to find vetted candidates\n• Look for "Ready ✓" badges on profiles\n• Post detailed job descriptions for better matches\n• Our matching system considers skills, rate, and profile completeness\n\nWould you like more specific information about any of these topics?`
  }

  const quickQuestions = [
    'How do I find talent?',
    'What is profile readiness?',
    'How to post a job?',
    'Best hiring practices?',
  ]

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-brand-purple to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50 group"
          aria-label="Open AI Assistant"
        >
          <svg
            className="w-8 h-8 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-purple to-indigo-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">AI Recruitment Consultant</h3>
                <p className="text-xs text-white/80">Online • Ready to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-brand-purple text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-white border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(q)
                      handleSend()
                    }}
                    className="text-xs px-3 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1"
              />
              <Button type="submit" disabled={!input.trim()} className="bg-brand-purple hover:bg-purple-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
