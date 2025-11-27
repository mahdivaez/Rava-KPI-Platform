import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { MessagesInterface } from "@/components/messages/messages-interface"

export default async function MessagesPage() {
  const session = await auth()
  if (!session) redirect('/login')

  // Fetch conversations (unique users the current user has chatted with)
  const sentMessages = await prisma.message.findMany({
    where: { senderId: session.user.id },
    select: { receiverId: true },
    distinct: ['receiverId'],
  })

  const receivedMessages = await prisma.message.findMany({
    where: { receiverId: session.user.id },
    select: { senderId: true },
    distinct: ['senderId'],
  })

  const conversationUserIds = [
    ...new Set([
      ...sentMessages.map(m => m.receiverId),
      ...receivedMessages.map(m => m.senderId),
    ])
  ]

  // Fetch user details for conversations
  const conversationUsers = await prisma.user.findMany({
    where: { id: { in: conversationUserIds } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      image: true,
      email: true,
    },
  })

  // Get unread count for each conversation
  const unreadCounts = await Promise.all(
    conversationUsers.map(async (user) => {
      const count = await prisma.message.count({
        where: {
          senderId: user.id,
          receiverId: session.user.id,
          isRead: false,
        },
      })
      return { userId: user.id, count }
    })
  )

  const conversationsWithUnread = conversationUsers.map(user => ({
    ...user,
    unreadCount: unreadCounts.find(u => u.userId === user.id)?.count || 0,
  }))

  // Fetch all users for new conversation
  const allUsers = await prisma.user.findMany({
    where: {
      isActive: true,
      id: { not: session.user.id },
    },
    orderBy: { firstName: 'asc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      image: true,
      email: true,
    },
  })

  return (
    <div className="h-[calc(100vh-10rem)] sm:h-[calc(100vh-9rem)] lg:h-[calc(100vh-8rem)]">
      <Card className="h-full border-nude-200 overflow-hidden">
        <MessagesInterface
          currentUserId={session.user.id}
          conversations={conversationsWithUnread}
          allUsers={allUsers}
        />
      </Card>
    </div>
  )
}

