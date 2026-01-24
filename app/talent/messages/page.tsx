'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

  useEffect(() => {
    if (!loading && (!user || user.role !== 'TALENT')) {
      router.push('/login')
      return
    }
    if (user && user.role === 'TALENT') {
      fetchConversations()
    }
  }, [user, loading, router])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
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
  }

  const fetchMessages = async (conversationId: string) => {
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
  }

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
        fetchConversations() // Refresh conversations to update last message
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!user || user.role !== 'TALENT') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with recruiters</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No conversations yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          selectedConversation?.id === conv.id ? 'bg-purple-50' : ''
                        }`}
                      >
                        <div className="font-semibold">
                          {conv.recruiter.user.email}
                        </div>
                        {conv.recruiter.company && (
                          <div className="text-sm text-gray-600">
                            {conv.recruiter.company.name}
                          </div>
                        )}
                        {conv.job && (
                          <div className="text-sm text-brand-purple mt-1">
                            {conv.job.title}
                          </div>
                        )}
                        {conv.messages.length > 0 && (
                          <div className="text-xs text-gray-500 mt-2 line-clamp-1">
                            {conv.messages[0].content}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Messages Thread */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle>
                    {selectedConversation.recruiter.user.email}
                    {selectedConversation.recruiter.company && (
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        • {selectedConversation.recruiter.company.name}
                      </span>
                    )}
                  </CardTitle>
                  {selectedConversation.job && (
                    <p className="text-sm text-brand-purple">
                      Job: {selectedConversation.job.title}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender.id === user.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.sender.id === user.id
                                ? 'bg-brand-purple text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${
                              msg.sender.id === user.id ? 'text-purple-100' : 'text-gray-500'
                            }`}>
                              {new Date(msg.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t">
                    <div className="flex gap-2">
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
                        className="bg-brand-purple hover:bg-purple-700"
                      >
                        Send
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Select a conversation to view messages
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
