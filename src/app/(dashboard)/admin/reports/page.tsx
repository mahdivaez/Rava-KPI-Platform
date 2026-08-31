import { redirect } from "next/navigation"
import {
  Archive,
  BarChart3,
  Building2,
  ClipboardCheck,
  FolderKanban,
  Users,
} from "lucide-react"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard, StatGrid } from "@/components/ui/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleEvaluationsReport } from "@/components/admin/role-evaluations-report"
import {
  ClientEvaluationsReport,
  type ClientEvaluationRow,
} from "@/components/admin/client-evaluations-report"
import { StrategistEvaluationsReport } from "@/components/admin/strategist-evaluations-report"
import { WriterEvaluationsReport } from "@/components/admin/writer-evaluations-report"
import { FeedbackReport } from "@/components/admin/feedback-report"
import {
  aggregateByRole,
  getClientEvaluationRecords,
  getRoleEvaluationRecords,
  overallAverage,
} from "@/lib/admin-analytics"
import { faNumber } from "@/lib/design-tokens"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect("/dashboard")

  const [
    evaluations,
    clientEvaluations,
    totalUsers,
    activeUsers,
    totalWorkgroups,
    activeWorkgroups,
    strategistEvaluations,
    writerEvaluations,
    writerFeedbacks,
  ] = await Promise.all([
    getRoleEvaluationRecords(),
    getClientEvaluationRecords(),
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.workgroup.count(),
    prisma.workgroup.count({ where: { isActive: true } }),
    prisma.strategistEvaluation.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
      include: { strategist: true, evaluator: true },
    }),
    prisma.writerEvaluation.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
      include: { writer: true, strategist: true, workgroup: true },
    }),
    prisma.writerFeedback.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
      include: { writer: true, workgroup: true },
    }),
  ])

  // The legacy feedback table stores only a strategist id, so the name has to
  // be looked up separately before that tab can render.
  const strategistIds = Array.from(
    new Set(writerFeedbacks.map((f) => f.strategistId).filter(Boolean))
  )
  const strategists = strategistIds.length
    ? await prisma.user.findMany({ where: { id: { in: strategistIds } } })
    : []
  const strategistById = new Map(strategists.map((s) => [s.id, s]))
  const writerFeedbacksWithStrategist = writerFeedbacks.map((f) => ({
    ...f,
    strategist: strategistById.get(f.strategistId) || null,
  }))

  const clientRows: ClientEvaluationRow[] = clientEvaluations.map((row) => ({
    id: row.id,
    month: row.month,
    year: row.year,
    skipped: row.skipped,
    averageScore: row.average,
    totalScore: row.total,
    scores: Object.fromEntries(row.metrics.map((m) => [m.key, m.score])),
    answers: Object.fromEntries(row.answers.map((a) => [a.key, a.answer])),
    targetName: row.targetName,
    targetRole: row.targetRole,
    clientName: row.clientName,
    brandName: row.brandName,
    workgroupName: row.workgroupName,
  }))

  const roleAggregates = aggregateByRole(evaluations).filter((r) => r.count > 0)
  const coveredRoles = roleAggregates.length
  const peopleEvaluated = new Set(evaluations.map((e) => e.targetId)).size
  const average = overallAverage(evaluations)

  const scoredClient = clientEvaluations.filter((r) => !r.skipped)
  const clientAverage = scoredClient.length
    ? scoredClient.reduce((sum, r) => sum + r.average, 0) / scoredClient.length
    : 0

  const legacyTotal =
    strategistEvaluations.length + writerEvaluations.length + writerFeedbacks.length

  return (
    <div className="space-y-6">
      <PageHeader
        title="گزارش‌های کامل"
        description="همه ارزیابی‌های نقش‌محور، ارزیابی مشتریان و آرشیو سیستم قدیم"
        icon={<BarChart3 />}
        breadcrumbs={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "گزارش‌ها" },
        ]}
      />

      <StatGrid className="lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="ارزیابی‌های تیمی"
          value={faNumber(evaluations.length)}
          hint={`${faNumber(peopleEvaluated)} نفر ارزیابی‌شده`}
          icon={<ClipboardCheck />}
          tone="primary"
        />
        <StatCard
          label="میانگین کل"
          value={evaluations.length ? faNumber(average, 2) : "—"}
          hint={evaluations.length ? "از ۱۰" : "هنوز داده‌ای نیست"}
          icon={<BarChart3 />}
          tone="info"
        />
        <StatCard
          label="نقش‌های پوشش‌داده‌شده"
          value={faNumber(coveredRoles)}
          hint="نقشی که حداقل یک ارزیابی دارد"
          icon={<Users />}
          tone="neutral"
        />
        <StatCard
          label="ارزیابی مشتریان"
          value={faNumber(clientEvaluations.length)}
          hint={
            scoredClient.length
              ? `میانگین ${faNumber(clientAverage, 2)} از ۱۰`
              : "هنوز امتیازی ثبت نشده"
          }
          icon={<Building2 />}
          tone="info"
        />
        <StatCard
          label="کارگروه‌ها"
          value={faNumber(totalWorkgroups)}
          hint={`${faNumber(activeWorkgroups)} فعال · ${faNumber(activeUsers)} کاربر فعال از ${faNumber(totalUsers)}`}
          icon={<FolderKanban />}
          tone="neutral"
        />
      </StatGrid>

      <Tabs defaultValue="team" className="w-full">
        <TabsList className="w-full justify-start lg:w-fit">
          <TabsTrigger value="team">
            ارزیابی تیم
            <span data-numeric className="text-foreground-subtle">
              ({faNumber(evaluations.length)})
            </span>
          </TabsTrigger>
          <TabsTrigger value="client">
            ارزیابی مشتریان
            <span data-numeric className="text-foreground-subtle">
              ({faNumber(clientEvaluations.length)})
            </span>
          </TabsTrigger>
          <TabsTrigger value="archive">
            آرشیو سیستم قدیم
            <span data-numeric className="text-foreground-subtle">
              ({faNumber(legacyTotal)})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>ارزیابی‌های نقش‌محور</CardTitle>
              <CardDescription>
                همه ارزیابی‌های ثبت‌شده در همه نقش‌ها، با امتیاز هر شاخص و
                پاسخ‌های تشریحی
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleEvaluationsReport evaluations={evaluations} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="client">
          <Card>
            <CardHeader>
              <CardTitle>ارزیابی مشتری از تیم</CardTitle>
              <CardDescription>
                پاسخ‌های ماهانه مشتری‌ها، به تفکیک فرد و دوره
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientEvaluationsReport evaluations={clientRows} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kept read-only for history: these three tables predate the
            role-driven system and are no longer written to. */}
        <TabsContent value="archive" className="space-y-5">
          <Card elevation="flat" className="border-dashed">
            <CardContent className="flex items-start gap-3 py-4">
              <Archive
                className="mt-0.5 size-4 shrink-0 text-foreground-subtle"
                aria-hidden
              />
              <p className="text-sm leading-relaxed text-foreground-muted">
                این بخش داده‌های سیستم قدیم است و دیگر رکورد جدیدی در آن ثبت
                نمی‌شود. ارزیابی‌های جاری را در تب «ارزیابی تیم» ببینید.
              </p>
            </CardContent>
          </Card>

          <ArchiveSection
            title="ارزیابی‌های معاون فنی"
            count={strategistEvaluations.length}
          >
            <StrategistEvaluationsReport evaluations={strategistEvaluations} />
          </ArchiveSection>

          <ArchiveSection
            title="ارزیابی‌های استراتژیست از نویسنده"
            count={writerEvaluations.length}
          >
            <WriterEvaluationsReport evaluations={writerEvaluations} />
          </ArchiveSection>

          <ArchiveSection
            title="بازخوردهای نویسنده"
            count={writerFeedbacks.length}
          >
            <FeedbackReport feedbacks={writerFeedbacksWithStrategist} />
          </ArchiveSection>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ArchiveSection({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>تعداد کل: {faNumber(count)}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
