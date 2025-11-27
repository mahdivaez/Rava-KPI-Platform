import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WriterEvaluationsTable } from "@/components/evaluations/writer-evaluations-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function WriterEvaluationPage() {
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

  // Get all writer evaluations for workgroups where user is strategist
  const evaluations = await prisma.writerEvaluation.findMany({
    where: session?.user?.isAdmin
      ? {}
      : {
          strategistId: session?.user?.id,
        },
    include: {
      writer: true,
      strategist: true,
      workgroup: true,
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">ارزیابی نویسنده‌ها</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            ثبت و مشاهده ارزیابی‌های ماهانه نویسنده‌ها
          </p>
        </div>
        <Link href="/evaluations/writer/new" className="flex-shrink-0">
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
          <WriterEvaluationsTable evaluations={evaluations} />
        </CardContent>
      </Card>
    </div>
  )
}

