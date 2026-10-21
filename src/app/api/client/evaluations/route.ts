import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TEAM_ROLES, type TeamRole } from "@/lib/roles"
import {
  pickClientAnswers,
  summarizeClientScores,
  validateClientScores,
} from "@/lib/client-kpis"
import {
  currentPersianPeriod,
  getClientBoards,
  targetKey,
} from "@/lib/client-evaluations"

const entrySchema = z.object({
  brandId: z.string().min(1),
  targetId: z.string().min(1),
  targetRole: z.enum(TEAM_ROLES),
  skipped: z.boolean().default(false),
  scores: z.record(z.union([z.number(), z.string()])).default({}),
  answers: z.record(z.string()).optional(),
})

const payloadSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(1400),
  entries: z.array(entrySchema).min(1),
})

/**
 * Submit a client's monthly evaluation of the team.
 *
 * The whole form arrives in one request and is written in one transaction, so
 * a client never ends up with half a month recorded. Rows already submitted
 * for the period are rejected rather than silently overwritten — a client
 * revises by asking the admin, not by resubmitting.
 *
 * One request may span several brands: an owner of two clinics files both in
 * a single sitting, and every entry names the brand it belongs to.
 */
export async function POST(req: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const session = await auth()
    if (!session?.user?.isClient) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
    }

    const client = await prisma.clientAccount.findUnique({
      where: { id: session.user.id },
      include: {
        brands: {
          include: { workgroup: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!client || !client.isActive) {
      return NextResponse.json({ error: "حساب شما فعال نیست" }, { status: 403 })
    }

    const parsed = payloadSchema.parse(await req.json())

    // The period is fixed server-side: a client files for the open month
    // only, so a stale tab cannot backfill a different one.
    const period = await currentPersianPeriod()
    if (parsed.month !== period.month || parsed.year !== period.year) {
      return NextResponse.json(
        { error: "دوره ارزیابی تغییر کرده است. صفحه را تازه کنید." },
        { status: 400 }
      )
    }

    // Everyone in the payload must really work on the brand they are filed
    // under: the boards are built from the brands this account owns, so a
    // forged brand id or a stranger's user id has nowhere to land.
    const boards = await getClientBoards(
      client.id,
      client.brands,
      period.month,
      period.year
    )
    const workgroupOfBrand = new Map(boards.map((b) => [b.brandId, b.workgroupId]))
    const validTargets = new Set(
      boards.flatMap((board) => board.targets.map((t) => t.key))
    )
    const stillOpen = new Set(
      boards.flatMap((board) => board.pending.map((t) => t.key))
    )

    const rows: Array<{
      clientId: string
      brandId: string
      workgroupId: string
      targetId: string
      targetRole: TeamRole
      month: number
      year: number
      skipped: boolean
      scores: Record<string, number>
      totalScore: number
      averageScore: number
      answers: Record<string, string> | undefined
    }> = []

    const seen = new Set<string>()

    for (const entry of parsed.entries) {
      const key = targetKey(entry.brandId, entry.targetId, entry.targetRole)
      const workgroupId = workgroupOfBrand.get(entry.brandId)

      if (!workgroupId || !validTargets.has(key)) {
        return NextResponse.json(
          { error: "یکی از افراد انتخاب‌شده عضو کارگروه شما نیست" },
          { status: 400 }
        )
      }
      if (!stillOpen.has(key)) {
        return NextResponse.json(
          { error: "ارزیابی این ماه قبلاً ثبت شده است. صفحه را تازه کنید." },
          { status: 400 }
        )
      }
      if (seen.has(key)) {
        return NextResponse.json(
          { error: "یک نفر دو بار در فرم تکرار شده است" },
          { status: 400 }
        )
      }
      seen.add(key)

      const answers = pickClientAnswers(entry.targetRole, entry.answers)

      if (entry.skipped) {
        rows.push({
          clientId: client.id,
          brandId: entry.brandId,
          workgroupId,
          targetId: entry.targetId,
          targetRole: entry.targetRole,
          month: period.month,
          year: period.year,
          skipped: true,
          scores: {},
          totalScore: 0,
          averageScore: 0,
          answers: Object.keys(answers).length ? answers : undefined,
        })
        continue
      }

      const check = validateClientScores(entry.targetRole, entry.scores)
      if (check.error) {
        return NextResponse.json({ error: check.error }, { status: 400 })
      }

      const { totalScore, averageScore } = summarizeClientScores(check.scores)

      rows.push({
        clientId: client.id,
        brandId: entry.brandId,
        workgroupId,
        targetId: entry.targetId,
        targetRole: entry.targetRole,
        month: period.month,
        year: period.year,
        skipped: false,
        scores: check.scores,
        totalScore,
        averageScore,
        answers: Object.keys(answers).length ? answers : undefined,
      })
    }

    await prisma.clientEvaluation.createMany({ data: rows })

    return NextResponse.json({ success: true, count: rows.length })
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: "اطلاعات ارسالی نامعتبر است" },
        { status: 400 }
      )
    }
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "ارزیابی این ماه قبلاً ثبت شده است" },
        { status: 400 }
      )
    }
    console.error("ClientEvaluation create failed:", error)
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
  }
}
