import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const feedbackSchema = z.object({
  strategistId: z.string(),
  workgroupId: z.string(),
  month: z.number().int().min(1).max(11),
  year: z.number().int().min(1400),
  communication: z.number().int().min(1).max(10),
  supportLevel: z.number().int().min(1).max(10),
  clarityOfTasks: z.number().int().min(1).max(10),
  feedbackQuality: z.number().int().min(1).max(10),
  positivePoints: z.string().optional(),
  improvements: z.string().optional(),
  suggestions: z.string().optional(),
  imageUrl: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
    }

    const body = await req.json()
    const data = feedbackSchema.parse(body)

    // Check if user is writer in this workgroup
    const membership = await prisma.workgroupMember.findFirst({
      where: {
        workgroupId: data.workgroupId,
        userId: session.user.id,
        role: "WRITER",
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "شما نویسنده این کارگروه نیستید" },
        { status: 403 }
      )
    }

    const feedback = await prisma.writerFeedback.create({
      data: {
        ...data,
        writerId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, feedback })
  } catch (error: any) {
    console.error(error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "بازخورد برای این استراتژیست در این ماه قبلاً ارسال شده است" },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
  }
}

