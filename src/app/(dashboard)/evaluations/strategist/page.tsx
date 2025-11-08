import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateStrategistEvaluationDialog } from "@/components/evaluations/create-strategist-evaluation-dialog"
import { StrategistEvaluationsTable } from "@/components/evaluations/strategist-evaluations-table"

export default async function StrategistEvaluationPage() {
  const session = await auth()
  if (!session?.user?.isTechnicalDeputy && !session?.user?.isAdmin) {
    redirect('/dashboard')
  }

  // Get all strategists (users who have STRATEGIST role in any workgroup)
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

  // Get evaluations
  const evaluations = await prisma.strategistEvaluation.findMany({
    include: {
      strategist: true,
      evaluator: true,
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">ارزیابی استراتژیست‌ها</h1>
          <p className="text-slate-600 mt-1">
            ثبت و مشاهده ارزیابی‌های ماهانه استراتژیست‌ها
          </p>
        </div>
        <CreateStrategistEvaluationDialog strategists={strategists} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لیست ارزیابی‌ها</CardTitle>
          <CardDescription>
            تعداد کل: {evaluations.length} ارزیابی
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StrategistEvaluationsTable evaluations={evaluations} />
        </CardContent>
      </Card>
    </div>
  )
}

