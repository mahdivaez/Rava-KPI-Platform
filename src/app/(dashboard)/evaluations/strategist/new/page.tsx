import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { StrategistEvaluationForm } from "@/components/evaluations/strategist-evaluation-form"

export default async function NewStrategistEvaluationPage() {
  const session = await auth()
  if (!session?.user?.isTechnicalDeputy && !session?.user?.isAdmin) {
    redirect('/dashboard')
  }

  // Get all strategists
  const strategists = await prisma.user.findMany({
    where: {
      isActive: true,
      workgroupMemberships: {
        some: {
          role: "STRATEGIST",
        },
      },
    },
    orderBy: { firstName: 'asc' },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-nude-50 via-white to-nude-100 py-4 sm:py-6 lg:py-8">
      <StrategistEvaluationForm strategists={strategists} />
    </div>
  )
}

