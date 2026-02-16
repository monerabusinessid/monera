'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Footer } from '@/components/footer'

interface Message {
  id: string
  content: string
  createdAt: string
  sender: {
    id: string
    email: string
  }
}

interface Conversation {
  id: string
  recruiter: {
    user: {
      email: string
    }
    company: {
      name: string
    } | null
  }
  job: {
    id: string
    title: string
  } | null
  messages: Message[]
  updatedAt: string
}

export default function TalentMessagesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/messages', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (data.success) {
        setConversations(data.data.conversations || [])
        if (data.data.conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(data.data.conversations[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoadingData(false)
    }
  }, [selectedConversation])

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/messages?conversationId=${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (data.success) {
        setMessages(data.data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }, [])

  useEffect(() => {
    if (!loading && (!user || user.role !== 'TALENT')) {
      router.push('/login')
      return
    }
    if (user && user.role === 'TALENT') {
      fetchConversations()
    }
  }, [user, loading, router, fetchConversations])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation, fetchMessages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessages([...messages, data.data])
        setNewMessage('')
        fetchConversations()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-[#f6f6f9] pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'TALENT') {
    return null
  }

  return (
    <div className="min-h-screen bg-[#f6f6f9] pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">Stay connected with recruiters.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">No conversations yet</div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conv.id ? 'bg-purple-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">
                          {conv.recruiter.company?.name || conv.recruiter.user.email}
                        </p>
                        <span className="text-xs text-gray-400">
                          {new Date(conv.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      {conv.job && (
                        <p className="text-xs text-brand-purple mt-1">{conv.job.title}</p>
                      )}
                      {conv.messages.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-1">{conv.messages[0].content}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm flex flex-col min-h-[520px]">
            {selectedConversation ? (
              <>
                <CardHeader>
                  <CardTitle className="text-base">
                    {selectedConversation.recruiter.company?.name || selectedConversation.recruiter.user.email}
                  </CardTitle>
                  {selectedConversation.job && (
                    <p className="text-xs text-brand-purple">Job: {selectedConversation.job.title}</p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-sm text-gray-500 py-10">No messages yet.</div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender.id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                              msg.sender.id === user.id
                                ? 'bg-brand-purple text-white'
                                : 'bg-white border border-gray-100 text-gray-700'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p className={`mt-2 text-xs ${
                              msg.sender.id === user.id ? 'text-purple-100' : 'text-gray-400'
                            }`}>
                              {new Date(msg.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="border-t px-5 py-4">
                    <div className="flex gap-3">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-brand-purple hover:bg-purple-700 rounded-full px-5"
                      >
                        Send
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </>
            ) : (
              <CardContent className="p-8 text-center text-sm text-gray-500">
                Select a conversation to view messages.
              </CardContent>
            )}
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
