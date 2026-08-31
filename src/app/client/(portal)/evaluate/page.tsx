import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ClientEvaluationForm } from "@/components/client/client-evaluation-form"
import { requireClient } from "@/lib/client-session"
import { faNumber } from "@/lib/design-tokens"
import {
  currentPersianPeriod,
  getClientEvaluationTargets,
  getSubmittedTargetKeys,
} from "@/lib/client-evaluations"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "فرم ارزیابی",
}

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
]

export default async function ClientEvaluatePage() {
  const client = await requireClient()
  const { month, year } = currentPersianPeriod()

  const [allTargets, submitted] = await Promise.all([
    getClientEvaluationTargets(client.workgroupId),
    getSubmittedTargetKeys(client.id, month, year),
  ])

  if (allTargets.length === 0) redirect("/client")

  // Only what is still outstanding: a filed evaluation is final.
  const targets = allTargets.filter((t) => !submitted.has(t.key))
  const periodLabel = `${PERSIAN_MONTHS[month - 1]} ${faNumber(year)}`

  if (targets.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <EmptyState
            icon={<CheckCircle2 />}
            title={`ارزیابی ${periodLabel} کامل شده است`}
            description="همه اعضای تیم برای این ماه ارزیابی شده‌اند. ماه بعد دوباره سراغتان می‌آییم."
            action={
              <Button asChild>
                <Link href="/client">بازگشت</Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <ClientEvaluationForm
      targets={targets.map((t) => ({
        key: t.key,
        userId: t.userId,
        firstName: t.firstName,
        lastName: t.lastName,
        role: t.role,
      }))}
      periodLabel={periodLabel}
      month={month}
      year={year}
    />
  )
}
