import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import {
  ALLOW_SELF_EVALUATION,
  TEAM_ROLES,
  canEvaluate,
  getRoleLabel,
  isTeamRole,
  summarizeScores,
  validateScores,
  type TeamRole,
} from "@/lib/roles"

const roleEnum = z.enum(TEAM_ROLES)

const evaluationSchema = z.object({
  workgroupId: z.string().min(1),
  targetId: z.string().min(1),
  targetRole: roleEnum,
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(1400),
  scores: z.record(z.union([z.number(), z.string()])),
  metricNotes: z.record(z.string()).optional(),
  strengths: z.string().optional(),
  improvements: z.string().optional(),
  example: z.string().optional(),
  suggestions: z.string().optional(),
  imageUrl: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
    }

    const parsed = evaluationSchema.parse(await req.json())

    if (!ALLOW_SELF_EVALUATION && parsed.targetId === session.user.id) {
      return NextResponse.json(
        { error: "امکان ارزیابی خودتان وجود ندارد" },
        { status: 400 }
      )
    }

    // The person being evaluated must actually hold that role in this workgroup.
    const targetMembership = await prisma.workgroupMember.findFirst({
      where: {
        workgroupId: parsed.workgroupId,
        userId: parsed.targetId,
        role: parsed.targetRole,
      },
    })

    if (!targetMembership) {
      return NextResponse.json(
        {
          error: `این کاربر در این کارگروه نقش «${getRoleLabel(
            parsed.targetRole
          )}» ندارد`,
        },
        { status: 400 }
      )
    }

    // Which roles does the evaluator hold here, and do any of them permit this?
    const evaluatorMemberships = await prisma.workgroupMember.findMany({
      where: { workgroupId: parsed.workgroupId, userId: session.user.id },
    })

    const evaluatorRoles = evaluatorMemberships
      .map((m) => m.role)
      .filter(isTeamRole) as TeamRole[]

    const permittedRole = evaluatorRoles.find((role) =>
      canEvaluate(role, parsed.targetRole)
    )

    if (!permittedRole && !session.user.isAdmin) {
      return NextResponse.json(
        {
          error: evaluatorRoles.length
            ? `نقش شما اجازه ارزیابی «${getRoleLabel(parsed.targetRole)}» را ندارد`
            : "شما عضو این کارگروه نیستید",
        },
        { status: 403 }
      )
    }

    // Admins evaluating outside their own memberships are recorded under the
    // target's role so the entry still carries a valid evaluator role.
    const evaluatorRole = permittedRole ?? parsed.targetRole

    const scoreCheck = validateScores(parsed.targetRole, parsed.scores)
    if (scoreCheck.error) {
      return NextResponse.json({ error: scoreCheck.error }, { status: 400 })
    }

    const { totalScore, averageScore } = summarizeScores(scoreCheck.scores)

    const evaluation = await prisma.roleEvaluation.create({
      data: {
        workgroupId: parsed.workgroupId,
        evaluatorId: session.user.id,
        evaluatorRole,
        targetId: parsed.targetId,
        targetRole: parsed.targetRole,
        month: parsed.month,
        year: parsed.year,
        status: "COMPLETED",
        scores: scoreCheck.scores,
        totalScore,
        averageScore,
        metricNotes: parsed.metricNotes ?? undefined,
        strengths: parsed.strengths || undefined,
        improvements: parsed.improvements || undefined,
        example: parsed.example || undefined,
        suggestions: parsed.suggestions || undefined,
        imageUrl: parsed.imageUrl || undefined,
      },
    })

    return NextResponse.json({ success: true, evaluation })
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: "اطلاعات ارسالی نامعتبر است" },
        { status: 400 }
      )
    }
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "شما این فرد را برای این ماه قبلاً ارزیابی کرده‌اید" },
        { status: 400 }
      )
    }
    console.error("RoleEvaluation create failed:", error)
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const scope = searchParams.get("scope") ?? "given"
    const targetRole = searchParams.get("targetRole")
    const workgroupId = searchParams.get("workgroupId")

    const where: Record<string, unknown> = {}

    if (scope === "received") {
      where.targetId = session.user.id
    } else if (scope === "all") {
      if (!session.user.isAdmin) {
        return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
      }
    } else {
      where.evaluatorId = session.user.id
    }

    if (targetRole && isTeamRole(targetRole)) where.targetRole = targetRole
    if (workgroupId) where.workgroupId = workgroupId

    const evaluations = await prisma.roleEvaluation.findMany({
      where,
      include: { target: true, evaluator: true, workgroup: true },
      orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json({ evaluations })
  } catch (error) {
    console.error("RoleEvaluation list failed:", error)
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
  }
}
