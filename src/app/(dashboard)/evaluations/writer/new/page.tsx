import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { WriterEvaluationForm } from "@/components/evaluations/writer-evaluation-form"

export default async function NewWriterEvaluationPage() {
  const session = await auth()
  
  // Get workgroups where user is a strategist
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
              role: "WRITER",
            },
            include: {
              user: true,
            },
          },
        },
      },
    },
  })

  if (strategistMemberships.length === 0 && !session?.user?.isAdmin) {
    redirect('/dashboard')
  }

  const workgroups = strategistMemberships.map(m => m.workgroup)

  return (
    <div className="min-h-screen bg-gradient-to-br from-nude-50 via-white to-nude-100 py-4 sm:py-6 lg:py-8">
      <WriterEvaluationForm workgroups={workgroups} />
    </div>
  )
}

