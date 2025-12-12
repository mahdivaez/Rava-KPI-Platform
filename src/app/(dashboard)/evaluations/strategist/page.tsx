import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StrategistEvaluationsTable } from "@/components/evaluations/strategist-evaluations-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">  ارزیابی‌های معاون فنی  </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            ثبت و مشاهده ارزیابی‌های ماهانه استراتژیست‌ها
          </p>
        </div>
        <Link href="/evaluations/strategist/new" className="flex-shrink-0">
          <Button className="bg-nude-600 hover:bg-nude-700 text-white w-full sm:w-auto text-sm sm:text-base">
            <Plus className="h-4 w-4 ml-2" />
            ارزیابی جدید
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">لیست ارزیابی‌ها</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            تعداد کل: {evaluations.length} ارزیابی
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <StrategistEvaluationsTable evaluations={evaluations} />
        </CardContent>
      </Card>
    </div>
  )
}

