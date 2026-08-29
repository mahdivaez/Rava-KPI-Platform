import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StrategistEvaluationsTable } from "@/components/evaluations/strategist-evaluations-table"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
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
    <div className="space-y-6">
      <PageHeader
        title="ارزیابی‌های معاون فنی"
        description="ثبت و مشاهده ارزیابی‌های ماهانه استراتژیست‌ها"
        icon={<TrendingUp />}
        breadcrumbs={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "ارزیابی استراتژیست‌ها" },
        ]}
        actions={
          <Button asChild>
            <Link href="/evaluations/strategist/new">
              <Plus aria-hidden />
              ارزیابی جدید
            </Link>
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>لیست ارزیابی‌ها</CardTitle>
          <CardDescription>
            تعداد کل: {evaluations.length.toLocaleString("fa-IR")} ارزیابی
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-0">
          <StrategistEvaluationsTable evaluations={evaluations} />
        </CardContent>
      </Card>
    </div>
  )
}
