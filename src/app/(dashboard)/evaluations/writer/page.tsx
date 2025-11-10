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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">ارزیابی نویسنده‌ها</h1>
          <p className="text-slate-600 mt-1">
            ثبت و مشاهده ارزیابی‌های ماهانه نویسنده‌ها
          </p>
        </div>
        <Link href="/evaluations/writer/new">
          <Button className="bg-nude-600 hover:bg-nude-700 text-white">
            <Plus className="h-4 w-4 ml-2" />
            ارزیابی جدید
          </Button>
        </Link>
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

