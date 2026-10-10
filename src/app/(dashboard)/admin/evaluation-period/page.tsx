import { redirect } from "next/navigation"
import { CalendarDays } from "lucide-react"

import { auth } from "@/lib/auth"
import { PageHeader } from "@/components/ui/page-header"
import { EvaluationPeriodForm } from "@/components/admin/evaluation-period-form"
import { calendarPeriod, getOpenPeriod } from "@/lib/evaluation-period"

export const dynamic = "force-dynamic"

export default async function EvaluationPeriodPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect("/dashboard")

  const open = await getOpenPeriod()

  return (
    <div className="space-y-6">
      <PageHeader
        title="دوره ارزیابی"
        description="تعیین ماهی که تیم و مشتریان می‌توانند برای آن KPI ثبت کنند"
        icon={<CalendarDays />}
        breadcrumbs={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "دوره ارزیابی" },
        ]}
      />
      <EvaluationPeriodForm initial={open} calendar={calendarPeriod()} />
    </div>
  )
}
