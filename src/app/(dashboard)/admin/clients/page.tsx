import { redirect } from "next/navigation"
import { Building2 } from "lucide-react"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateClientDialog } from "@/components/admin/create-client-dialog"
import {
  ClientAccountsTable,
  type ClientAccountRow,
} from "@/components/admin/client-accounts-table"
import {
  ClientEvaluationsReport,
  type ClientEvaluationRow,
} from "@/components/admin/client-evaluations-report"
import { faNumber } from "@/lib/design-tokens"
import type { TeamRole } from "@/lib/roles"

export const dynamic = "force-dynamic"

export default async function AdminClientsPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect("/dashboard")

  const [accounts, workgroups, evaluations] = await Promise.all([
    prisma.clientAccount.findMany({
      include: {
        workgroup: { select: { name: true } },
        _count: { select: { evaluations: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.workgroup.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.clientEvaluation.findMany({
      include: {
        target: { select: { firstName: true, lastName: true } },
        client: { select: { contactName: true, brandName: true } },
        workgroup: { select: { name: true } },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
    }),
  ])

  const clients: ClientAccountRow[] = accounts.map((account) => ({
    id: account.id,
    email: account.email,
    contactName: account.contactName,
    brandName: account.brandName,
    greetingName: account.greetingName,
    workgroupId: account.workgroupId,
    isActive: account.isActive,
    welcomeTitle: account.welcomeTitle,
    welcomeMessage: account.welcomeMessage,
    workgroupName: account.workgroup.name,
    evaluationCount: account._count.evaluations,
  }))

  const evaluationRows: ClientEvaluationRow[] = evaluations.map((row) => ({
    id: row.id,
    month: row.month,
    year: row.year,
    skipped: row.skipped,
    averageScore: row.averageScore,
    totalScore: row.totalScore,
    scores: (row.scores ?? {}) as Record<string, number>,
    answers: (row.answers ?? {}) as Record<string, string>,
    targetName: `${row.target.firstName} ${row.target.lastName}`,
    targetRole: row.targetRole as TeamRole,
    clientName: row.client.contactName,
    brandName: row.client.brandName,
    workgroupName: row.workgroup.name,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="مشتریان"
        description="حساب‌های ورود مشتری، متن داشبورد هر مشتری و ارزیابی‌هایی که ثبت کرده‌اند"
        icon={<Building2 />}
        breadcrumbs={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "مشتریان" },
        ]}
        actions={<CreateClientDialog workgroups={workgroups} />}
      />

      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts">
            حساب‌های مشتری ({faNumber(clients.length)})
          </TabsTrigger>
          <TabsTrigger value="evaluations">
            ارزیابی‌های ثبت‌شده ({faNumber(evaluationRows.length)})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>حساب‌های مشتری</CardTitle>
              <CardDescription>
                مشتری از طریق <span dir="ltr">/client/login</span> وارد می‌شود و
                فقط اعضای کارگروه خودش را ارزیابی می‌کند.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 sm:px-0">
              <ClientAccountsTable clients={clients} workgroups={workgroups} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations">
          <Card>
            <CardHeader>
              <CardTitle>ارزیابی مشتری از تیم</CardTitle>
              <CardDescription>
                پاسخ‌های ماهانه مشتری‌ها، به تفکیک فرد و دوره
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientEvaluationsReport evaluations={evaluationRows} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
