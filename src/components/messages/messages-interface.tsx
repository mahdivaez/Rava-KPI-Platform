"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowRight, Loader2, MessageSquare, Send } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
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
  initialMessages?: Message[]
}

export function MessagesInterface({ currentUserId, conversations, allUsers, initialMessages = [] }: MessagesInterfaceProps) {
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<string | null>(conversations[0]?.id || null)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
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
      // Only load from API if we don't have initial messages for this user
      const hasInitialMessages = initialMessages.length > 0 &&
        (initialMessages[0].senderId === selectedUser || initialMessages[0].receiverId === selectedUser)
      
      if (!hasInitialMessages) {
        loadMessages(selectedUser)
      } else {
        setMessages(initialMessages)
      }
    }
  }, [selectedUser, initialMessages])

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

  const handleSend = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
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
    // Master/detail: on phones only one pane is on screen at a time, so the
    // thread gets the full width instead of a squeezed column.
    <div className="flex h-full">
      {/* Conversations */}
      <div
        className={`flex w-full flex-col border-e border-border md:w-80 md:shrink-0 ${
          selectedUser ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="space-y-3 border-b border-border p-4">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <MessageSquare className="size-5 text-foreground-subtle" aria-hidden />
            پیام‌ها
          </h2>

          <Select value={selectedUser || ""} onValueChange={setSelectedUser}>
            <SelectTrigger aria-label="شروع گفتگوی جدید">
              <SelectValue placeholder="گفتگوی جدید…" />
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
                aria-current={selectedUser === user.id ? "true" : undefined}
                className={`mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-start transition-colors duration-fast ease-out ${
                  selectedUser === user.id
                    ? "bg-primary-subtle"
                    : "hover:bg-surface-hover"
                }`}
              >
                <Avatar className="size-11 ring-1 ring-border">
                  <AvatarImage src={user.image || undefined} alt="" />
                  <AvatarFallback>
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <p dir="ltr" className="truncate text-start text-xs text-foreground-muted">
                    {user.email}
                  </p>
                </div>
                {user.unreadCount > 0 && (
                  <span
                    data-numeric
                    aria-label={`${user.unreadCount} پیام خوانده‌نشده`}
                    className="grid size-6 shrink-0 place-items-center rounded-full bg-danger text-xs font-bold text-danger-foreground"
                  >
                    {user.unreadCount.toLocaleString("fa-IR")}
                  </span>
                )}
              </button>
            ))}

            {conversations.length === 0 && (
              <EmptyState
                icon={<MessageSquare />}
                title="هنوز گفتگویی ندارید"
                description="از فهرست بالا یک همکار را انتخاب کنید تا گفتگو شروع شود."
                size="sm"
              />
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Thread */}
      <div
        className={`min-w-0 flex-1 flex-col ${selectedUser ? "flex" : "hidden md:flex"}`}
      >
        {selectedUser && selectedUserData ? (
          <>
            <div className="flex items-center gap-3 border-b border-border p-4">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSelectedUser(null)}
                aria-label="بازگشت به فهرست گفتگوها"
                className="md:hidden"
              >
                <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
              </Button>

              <Avatar className="size-10 ring-1 ring-border">
                <AvatarImage src={selectedUserData.image || undefined} alt="" />
                <AvatarFallback>
                  {getInitials(selectedUserData.firstName, selectedUserData.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {selectedUserData.firstName} {selectedUserData.lastName}
                </p>
                <p dir="ltr" className="truncate text-start text-xs text-foreground-muted">
                  {selectedUserData.email}
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2
                    className="size-7 animate-spin text-foreground-subtle"
                    aria-label="در حال بارگذاری پیام‌ها"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isSent = message.senderId === currentUserId
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isSent
                              ? "rounded-ee-md bg-primary text-primary-foreground"
                              : "rounded-es-md bg-surface-sunken text-foreground"
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </p>
                          <p
                            className={`mt-1 text-2xs ${
                              isSent ? "text-primary-foreground/70" : "text-foreground-subtle"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString("fa-IR", {
                              hour: "2-digit",
                              minute: "2-digit",
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

            <form onSubmit={handleSend} className="border-t border-border p-4">
              <div className="flex items-end gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  aria-label="متن پیام"
                  placeholder="پیام خود را بنویسید…"
                  className="max-h-32 min-h-[52px] flex-1 resize-none"
                  disabled={isSending}
                  rows={1}
                />
                <Button
                  type="submit"
                  size="icon-lg"
                  loading={isSending}
                  disabled={!newMessage.trim()}
                  aria-label="ارسال پیام"
                  title="ارسال"
                >
                  {!isSending && <Send className="size-4" aria-hidden />}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              icon={<MessageSquare />}
              title="یک گفتگو را انتخاب کنید"
              description="از فهرست کنار صفحه یک همکار را انتخاب کنید تا پیام‌ها نمایش داده شوند."
            />
          </div>
        )}
      </div>
    </div>
  )
}
