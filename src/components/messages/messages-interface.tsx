"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Send, MessageSquare, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface User {
  id: string
  firstName: string
  lastName: string
  image: string | null
  email: string
}

interface Conversation extends User {
  unreadCount: number
}

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  isRead: boolean
  createdAt: Date
}

interface MessagesInterfaceProps {
  currentUserId: string
  conversations: Conversation[]
  allUsers: User[]
}

export function MessagesInterface({ currentUserId, conversations, allUsers }: MessagesInterfaceProps) {
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<string | null>(conversations[0]?.id || null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Load messages when user is selected
  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser)
    }
  }, [selectedUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async (userId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/messages/get?userId=${userId}`)
      const data = await response.json()
      setMessages(data.messages || [])
      
      // Mark messages as read
      await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: userId }),
      })
      router.refresh()
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser) return

    setIsSending(true)
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedUser,
          content: newMessage.trim(),
        }),
      })

      if (!response.ok) throw new Error()

      setNewMessage("")
      loadMessages(selectedUser)
      router.refresh()
    } catch (error) {
      toast.error("خطا", { description: "خطا در ارسال پیام" })
    } finally {
      setIsSending(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const selectedUserData = conversations.find(u => u.id === selectedUser) || allUsers.find(u => u.id === selectedUser)

  return (
    <div className="h-full flex">
      {/* Conversations Sidebar */}
      <div className="w-80 border-l border-nude-200 flex flex-col">
        <div className="p-4 border-b border-nude-200">
          <h2 className="font-bold text-nude-900 flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5" />
            پیام‌ها
          </h2>
          
          {/* New Conversation */}
          <Select value={selectedUser || ""} onValueChange={setSelectedUser}>
            <SelectTrigger className="bg-nude-50 border-nude-200">
              <SelectValue placeholder="پیام جدید" />
            </SelectTrigger>
            <SelectContent>
              {allUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all mb-1 ${
                  selectedUser === user.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-nude-50'
                }`}
              >
                <Avatar className="h-12 w-12 border border-nude-200">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="bg-nude-200 text-nude-700">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-right">
                  <p className="font-semibold text-nude-900 text-sm">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-nude-600">{user.email}</p>
                </div>
                {user.unreadCount > 0 && (
                  <div className="w-6 h-6 rounded-full bg-destructive text-white text-xs flex items-center justify-center font-bold">
                    {user.unreadCount}
                  </div>
                )}
              </button>
            ))}

            {conversations.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-nude-400 mx-auto mb-2" />
                <p className="text-sm text-nude-600">هنوز گفتگویی ندارید</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser && selectedUserData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-nude-200 bg-nude-50">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-nude-200">
                  <AvatarImage src={selectedUserData.image || undefined} />
                  <AvatarFallback className="bg-nude-200 text-nude-700">
                    {getInitials(selectedUserData.firstName, selectedUserData.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-nude-900">
                    {selectedUserData.firstName} {selectedUserData.lastName}
                  </p>
                  <p className="text-xs text-nude-600">{selectedUserData.email}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-nude-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isSent = message.senderId === currentUserId
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            isSent
                              ? 'bg-primary text-white'
                              : 'bg-nude-100 text-nude-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${isSent ? 'text-white/70' : 'text-nude-600'}`}>
                            {new Date(message.createdAt).toLocaleTimeString('fa-IR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-nude-200">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="پیام خود را بنویسید..."
                  className="bg-nude-50 border-nude-200"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="bg-nude-500 hover:bg-nude-600 text-white"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-nude-400 mx-auto mb-4" />
              <p className="text-nude-600">یک مکالمه را انتخاب کنید</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

