import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ClientEvaluationForm } from "@/components/client/client-evaluation-form"
import { requireClient } from "@/lib/client-session"
import { faYear } from "@/lib/design-tokens"
import { currentPersianPeriod, getClientBoards } from "@/lib/client-evaluations"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "فرم ارزیابی",
}

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
]

/**
 * The form, for one brand (`?brand=…`) or for every brand at once.
 *
 * A client who owns two brands gets both in a single sitting by default —
 * that is the whole point of one login — while the per-brand link from the
 * dashboard keeps the shorter form available.
 */
export default async function ClientEvaluatePage({
  searchParams,
}: {
  searchParams: { brand?: string }
}) {
  const client = await requireClient()
  const { month, year } = await currentPersianPeriod()

  const allBoards = await getClientBoards(client.id, client.brands, month, year)
  if (allBoards.length === 0) redirect("/client")

  // An unknown brand id is a stale link, not an error worth a page of its own.
  const boards = searchParams.brand
    ? allBoards.filter((board) => board.brandId === searchParams.brand)
    : allBoards
  if (boards.length === 0) redirect("/client")

  const targets = boards.flatMap((board) => board.pending)
  const periodLabel = `${PERSIAN_MONTHS[month - 1]} ${faYear(year)}`

  if (targets.length === 0) {
    const brandLabel =
      boards.length === 1 && allBoards.length > 1 ? ` ${boards[0].brandName}` : ""

    return (
      <Card>
        <CardContent className="p-0">
          <EmptyState
            icon={<CheckCircle2 />}
            title={`ارزیابی${brandLabel} ${periodLabel} کامل شده است`}
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

  // Brand headings only earn their place when the form really spans two.
  const brandsInForm = new Set(targets.map((target) => target.brandId))

  return (
    <ClientEvaluationForm
      targets={targets.map((t) => ({
        key: t.key,
        brandId: t.brandId,
        brandName: t.brandName,
        userId: t.userId,
        firstName: t.firstName,
        lastName: t.lastName,
        role: t.role,
      }))}
      showBrandHeadings={brandsInForm.size > 1}
      periodLabel={periodLabel}
      month={month}
      year={year}
    />
  )
}
