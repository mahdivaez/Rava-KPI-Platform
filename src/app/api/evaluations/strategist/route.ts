import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const evaluationSchema = z.object({
  strategistId: z.string(),
  month: z.number().int().min(1).max(11),
  year: z.number().int().min(1400),
  ideation: z.number().int().min(1).max(10),
  avgViews: z.number().int().min(1).max(10),
  qualityControl: z.number().int().min(1).max(10),
  teamRelations: z.number().int().min(1).max(10),
  clientRelations: z.number().int().min(1).max(10),
  responsiveness: z.number().int().min(1).max(10),
  clientSatisfaction: z.number().int().min(1).max(10),
  strengths: z.string().optional(),
  improvements: z.string().optional(),
  suggestions: z.string().optional(),
  evaluatorNotes: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(["PENDING", "COMPLETED"]).default("COMPLETED"),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isTechnicalDeputy && !session?.user?.isAdmin) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
    }

    const body = await req.json()
    const data = evaluationSchema.parse(body)

    const evaluation = await prisma.strategistEvaluation.create({
      data: {
        ...data,
        evaluatorId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, evaluation })
  } catch (error: any) {
    console.error(error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "ارزیابی برای این استراتژیست در این ماه قبلاً ثبت شده است" },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
  }
}

