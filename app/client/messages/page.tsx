'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Conversation {
  id: string
  talent: {
    id: string
    full_name: string | null
    email: string
  }
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
}

interface Message {
  id: string
  content: string
  sender_id?: string
  senderId?: string
  created_at?: string
  createdAt?: string
  is_read?: boolean
  isRead?: boolean
}

export default function ClientMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    // Fetch user ID from API
    fetch('/api/auth/me', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCurrentUserId(data.data.id)
        }
      })
      .catch(err => {
        console.error('Failed to fetch user:', err)
      })

    // Fetch conversations (layout already handles auth, so we can fetch directly)
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages?role=client', {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.success) {
        const convs = data.data.conversations || []
        setConversations(convs)
        if (convs.length > 0 && !selectedConversation) {
          setSelectedConversation(convs[0])
        }
      } else {
        console.error('Failed to fetch conversations:', data.error)
        setConversations([])
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      setConversations([])
    } finally {
      setLoadingData(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.success) {
        setMessages(data.data.messages || [])
      } else {
        console.error('Failed to fetch messages:', data.error)
        setMessages([])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      setMessages([])
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setNewMessage('')
        fetchMessages(selectedConversation.id)
        fetchConversations()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  if (loadingData) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading messages...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Communicate with talent</p>
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
                      className={`
                        w-full text-left p-4 hover:bg-gray-50 transition-colors
                        ${selectedConversation?.id === conv.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {conv.talent.full_name || conv.talent.email}
                          </div>
                          {conv.lastMessage && (
                            <div className="text-sm text-gray-600 mt-1 truncate">
                              {conv.lastMessage}
                            </div>
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 bg-purple-600 text-white text-xs font-semibold rounded-full px-2 py-1">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Messages */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card className="flex flex-col h-[600px]">
              <CardHeader className="border-b">
                <CardTitle>
                  {selectedConversation.talent.full_name || selectedConversation.talent.email}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const senderId = msg.sender_id || msg.senderId || ''
                    const isOwn = currentUserId && senderId === currentUserId
                    const createdAt = msg.created_at || msg.createdAt || ''
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`
                            max-w-[70%] rounded-lg px-4 py-2
                            ${isOwn ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-900'}
                          `}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-purple-100' : 'text-gray-500'}`}>
                            {createdAt ? new Date(createdAt).toLocaleTimeString() : ''}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">Select a conversation</p>
                <p className="text-sm">Choose a conversation from the list to start messaging</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
