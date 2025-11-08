import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateFeedbackDialog } from "@/components/feedback/create-feedback-dialog"
import { FeedbackTable } from "@/components/feedback/feedback-table"

export default async function WriterFeedbackPage() {
  const session = await auth()
  
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

  if (writerMemberships.length === 0) {
    redirect('/dashboard')
  }

  // Get all feedbacks sent by this writer
  const feedbacks = await prisma.writerFeedback.findMany({
    where: {
      writerId: session?.user?.id,
    },
    include: {
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
          <h1 className="text-3xl font-bold text-slate-900">ارسال بازخورد</h1>
          <p className="text-slate-600 mt-1">
            ارسال بازخورد به استراتژیست‌های کارگروه
          </p>
        </div>
        <CreateFeedbackDialog workgroups={writerMemberships.map(m => m.workgroup)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بازخوردهای ارسال شده</CardTitle>
          <CardDescription>
            تعداد کل: {feedbacks.length} بازخورد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeedbackTable feedbacks={feedbacks} />
        </CardContent>
      </Card>
    </div>
  )
}

