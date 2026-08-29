import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard, StatGrid } from "@/components/ui/stat-card"
import {
  BarChart3,
  ClipboardCheck,
  FolderKanban,
  MessageSquareText,
  TrendingUp,
  Users,
} from "lucide-react"
import { StrategistEvaluationsReport } from "@/components/admin/strategist-evaluations-report"
import { WriterEvaluationsReport } from "@/components/admin/writer-evaluations-report"
import { FeedbackReport } from "@/components/admin/feedback-report"

export default async function ReportsPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect('/dashboard')

  const stats = {
    totalUsers: await prisma.user.count(),
    activeUsers: await prisma.user.count({ where: { isActive: true } }),
    totalWorkgroups: await prisma.workgroup.count(),
    activeWorkgroups: await prisma.workgroup.count({ where: { isActive: true } }),
    strategistEvaluations: await prisma.strategistEvaluation.count(),
    writerEvaluations: await prisma.writerEvaluation.count(),
    writerFeedbacks: await prisma.writerFeedback.count(),
  }

  // Get all strategist evaluations with full details
  const strategistEvaluations = await prisma.strategistEvaluation.findMany({
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      strategist: true,
      evaluator: true,
    },
  })

  // Get all writer evaluations with full details
  const writerEvaluations = await prisma.writerEvaluation.findMany({
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      writer: true,
      strategist: true,
      workgroup: true,
    },
  })

  // Get all writer feedbacks
  const writerFeedbacks = await prisma.writerFeedback.findMany({
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      writer: true,
      workgroup: true,
    },
  })

  const strategistIds = Array.from(
    new Set(writerFeedbacks.map((f) => f.strategistId).filter(Boolean))
  )

  const strategists = strategistIds.length
    ? await prisma.user.findMany({
        where: { id: { in: strategistIds } },
      })
    : []

  const strategistById = new Map(strategists.map((s) => [s.id, s]))

  const writerFeedbacksWithStrategist = writerFeedbacks.map((f) => ({
    ...f,
    strategist: strategistById.get(f.strategistId) || null,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="گزارش‌های کامل"
        description="همه ارزیابی‌ها و بازخوردها با جزئیات کامل"
        icon={<BarChart3 />}
        breadcrumbs={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "گزارش‌ها" },
        ]}
      />

      <StatGrid className="lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="کاربران"
          value={stats.totalUsers.toLocaleString("fa-IR")}
          hint={`${stats.activeUsers.toLocaleString("fa-IR")} فعال`}
          icon={<Users />}
          tone="primary"
        />
        <StatCard
          label="کارگروه‌ها"
          value={stats.totalWorkgroups.toLocaleString("fa-IR")}
          hint={`${stats.activeWorkgroups.toLocaleString("fa-IR")} فعال`}
          icon={<FolderKanban />}
          tone="neutral"
        />
        <StatCard
          label="ارزیابی‌های معاون فنی"
          value={stats.strategistEvaluations.toLocaleString("fa-IR")}
          hint="تعداد کل"
          icon={<TrendingUp />}
          tone="info"
        />
        <StatCard
          label="ارزیابی‌های استراتژیست"
          value={stats.writerEvaluations.toLocaleString("fa-IR")}
          hint="تعداد کل"
          icon={<ClipboardCheck />}
          tone="info"
        />
        <StatCard
          label="ارزیابی‌های نویسنده"
          value={stats.writerFeedbacks.toLocaleString("fa-IR")}
          hint="تعداد کل"
          icon={<MessageSquareText />}
          tone="info"
        />
      </StatGrid>

      <Tabs defaultValue="strategist" className="w-full">
        <TabsList className="w-full justify-start lg:w-fit">
          <TabsTrigger value="strategist">
            ارزیابی‌های معاون فنی
            <span data-numeric className="text-foreground-subtle">
              ({strategistEvaluations.length.toLocaleString("fa-IR")})
            </span>
          </TabsTrigger>
          <TabsTrigger value="writer">
            ارزیابی‌های استراتژیست
            <span data-numeric className="text-foreground-subtle">
              ({writerEvaluations.length.toLocaleString("fa-IR")})
            </span>
          </TabsTrigger>
          <TabsTrigger value="feedback">
            ارزیابی‌های نویسنده
            <span data-numeric className="text-foreground-subtle">
              ({writerFeedbacks.length.toLocaleString("fa-IR")})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategist">
          <StrategistEvaluationsReport evaluations={strategistEvaluations} />
        </TabsContent>

        <TabsContent value="writer">
          <WriterEvaluationsReport evaluations={writerEvaluations} />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackReport feedbacks={writerFeedbacksWithStrategist} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
