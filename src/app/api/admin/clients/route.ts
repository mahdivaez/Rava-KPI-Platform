import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  contactName: z.string().min(1),
  brandName: z.string().min(1),
  greetingName: z.string().optional(),
  workgroupId: z.string().min(1),
  isActive: z.boolean().default(true),
  welcomeTitle: z.string().optional(),
  welcomeMessage: z.string().optional(),
})

const updateSchema = createSchema
  .partial()
  .omit({ password: true })
  .extend({
    id: z.string().min(1),
    /** Omitted or blank leaves the existing password untouched. */
    password: z.string().min(6).optional().or(z.literal("")),
  })

/** Blank strings clear the field back to its default. */
function optionalText(value: string | undefined) {
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

export async function POST(req: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
    }

    const data = createSchema.parse(await req.json())

    const client = await prisma.clientAccount.create({
      data: {
        email: data.email,
        password: await bcrypt.hash(data.password, 10),
        contactName: data.contactName,
        brandName: data.brandName,
        greetingName: optionalText(data.greetingName),
        workgroupId: data.workgroupId,
        isActive: data.isActive,
        welcomeTitle: optionalText(data.welcomeTitle),
        welcomeMessage: optionalText(data.welcomeMessage),
      },
    })

    return NextResponse.json({ success: true, client })
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "اطلاعات وارد شده نامعتبر است" }, { status: 400 })
    }
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "حسابی با این ایمیل از قبل وجود دارد" },
        { status: 400 }
      )
    }
    console.error("ClientAccount create failed:", error)
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
    }

    const { id, password, greetingName, welcomeTitle, welcomeMessage, ...rest } =
      updateSchema.parse(await req.json())

    const client = await prisma.clientAccount.update({
      where: { id },
      data: {
        ...rest,
        ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
        greetingName: optionalText(greetingName),
        welcomeTitle: optionalText(welcomeTitle),
        welcomeMessage: optionalText(welcomeMessage),
      },
    })

    return NextResponse.json({ success: true, client })
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "اطلاعات وارد شده نامعتبر است" }, { status: 400 })
    }
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "حسابی با این ایمیل از قبل وجود دارد" },
        { status: 400 }
      )
    }
    console.error("ClientAccount update failed:", error)
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

    const id = new URL(req.url).searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "شناسه الزامی است" }, { status: 400 })
    }

    await prisma.clientAccount.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("ClientAccount delete failed:", error)
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
  }
}
