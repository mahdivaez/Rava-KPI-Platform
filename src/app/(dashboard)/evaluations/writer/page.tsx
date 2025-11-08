import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateWriterEvaluationDialog } from "@/components/evaluations/create-writer-evaluation-dialog"
import { WriterEvaluationsTable } from "@/components/evaluations/writer-evaluations-table"

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">ارزیابی نویسنده‌ها</h1>
          <p className="text-slate-600 mt-1">
            ثبت و مشاهده ارزیابی‌های ماهانه نویسنده‌ها
          </p>
        </div>
        <CreateWriterEvaluationDialog workgroups={strategistMemberships.map(m => m.workgroup)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لیست ارزیابی‌ها</CardTitle>
          <CardDescription>
            تعداد کل: {evaluations.length} ارزیابی
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WriterEvaluationsTable evaluations={evaluations} />
        </CardContent>
      </Card>
    </div>
  )
}

