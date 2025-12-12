import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FeedbackForm } from "@/components/feedback/feedback-form"

export default async function SendFeedbackPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  // Get workgroups where user is a writer
  const writerMemberships = await prisma.workgroupMember.findMany({
    where: {
      userId: session?.user?.id,
      role: "WRITER",
    },
    include: {
      workgroup: {
        include: {
          members: {
            where: {
              role: "STRATEGIST",
            },
            include: {
              user: true,
            },
          },
        },
      },
    },
  })

  // Also check if user is strategist (can give feedback to other strategists)
  const strategistMemberships = await prisma.workgroupMember.findMany({
    where: {
      userId: session?.user?.id,
      role: "STRATEGIST",
    },
    include: {
      workgroup: {
        include: {
          members: {
            where: {
              role: "STRATEGIST",
            },
            include: {
              user: true,
            },
          },
        },
      },
    },
  })

  if (writerMemberships.length === 0 && strategistMemberships.length === 0) {
    redirect('/dashboard')
  }

  // Combine workgroups from both writer and strategist memberships
  const workgroups = [
    ...writerMemberships.map(m => m.workgroup),
    ...strategistMemberships.map(m => m.workgroup)
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-nude-50 via-white to-nude-100">
      <FeedbackForm workgroups={workgroups} />
    </div>
  )
}
