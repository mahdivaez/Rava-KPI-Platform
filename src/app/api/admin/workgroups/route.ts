import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const workgroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

export async function POST(req: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }
    const session = await getSession()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = workgroupSchema.parse(body)

    const workgroup = await prisma.workgroup.create({
      data: {
        name: parsed.name,
        description: parsed.description,
        isActive: parsed.isActive,
      },
    })

    return NextResponse.json({ success: true, workgroup })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }
    const session = await getSession()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
    }

    const body = await req.json()
    const { id, ...data } = body

    const workgroup = await prisma.workgroup.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, workgroup })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }
    const session = await getSession()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "شناسه الزامی است" }, { status: 400 })
    }

    await prisma.workgroup.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
  }
}
