import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const evaluationSchema = z.object({
  writerId: z.string(),
  workgroupId: z.string(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
  responsibility: z.number().int().min(1).max(10),
  strategistSatisfaction: z.number().int().min(1).max(10),
  meetingEngagement: z.number().int().min(1).max(10),
  scenarioPerformance: z.number().int().min(1).max(10),
  clientSatisfaction: z.number().int().min(1).max(10),
  brandAlignment: z.number().int().min(1).max(10),
  strengths: z.string().optional(),
  improvements: z.string().optional(),
  suggestions: z.string().optional(),
  evaluatorNotes: z.string().optional(),
  status: z.enum(["PENDING", "COMPLETED"]).default("COMPLETED"),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
    }

    const body = await req.json()
    const data = evaluationSchema.parse(body)

    // Check if user is strategist in this workgroup (or admin)
    if (!session.user.isAdmin) {
      const membership = await prisma.workgroupMember.findFirst({
        where: {
          workgroupId: data.workgroupId,
          userId: session.user.id,
          role: "STRATEGIST",
        },
      })

      if (!membership) {
        return NextResponse.json(
          { error: "شما استراتژیست این کارگروه نیستید" },
          { status: 403 }
        )
      }
    }

    const evaluation = await prisma.writerEvaluation.create({
      data: {
        ...data,
        strategistId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, evaluation })
  } catch (error: any) {
    console.error(error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "ارزیابی برای این نویسنده در این ماه قبلاً ثبت شده است" },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
  }
}

