import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const memberSchema = z.object({
  workgroupId: z.string(),
  userId: z.string(),
  role: z.enum(["STRATEGIST", "WRITER"]),
})

export async function POST(req: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = memberSchema.parse(body)

    const member = await prisma.workgroupMember.create({
      data: {
        workgroupId: parsed.workgroupId,
        userId: parsed.userId,
        role: parsed.role,
      },
    })

    return NextResponse.json({ success: true, member })
  } catch (error: any) {
    console.error(error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "این کاربر با این نقش قبلاً اضافه شده است" }, { status: 400 })
    }
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "شناسه الزامی است" }, { status: 400 })
    }

    await prisma.workgroupMember.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
  }
}

