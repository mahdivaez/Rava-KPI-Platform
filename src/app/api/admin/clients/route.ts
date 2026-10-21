import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

/**
 * One brand the account speaks for. `id` is present when the admin is editing
 * a brand that already exists; absent means a brand being added now.
 */
const brandSchema = z.object({
  id: z.string().min(1).optional(),
  brandName: z.string().min(1),
  workgroupId: z.string().min(1),
})

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  contactName: z.string().min(1),
  greetingName: z.string().optional(),
  /** At least one — an account with no brand has nothing to evaluate. */
  brands: z.array(brandSchema).min(1),
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
    brands: z.array(brandSchema).min(1),
  })

/** Blank strings clear the field back to its default. */
function optionalText(value: string | undefined) {
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

/** Two brands on one workgroup would ask the client the same questions twice. */
function duplicateWorkgroup(brands: z.infer<typeof brandSchema>[]) {
  return new Set(brands.map((b) => b.workgroupId)).size !== brands.length
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

    if (duplicateWorkgroup(data.brands)) {
      return NextResponse.json(
        { error: "هر کارگروه فقط یک بار می‌تواند به این حساب وصل شود" },
        { status: 400 }
      )
    }

    const client = await prisma.clientAccount.create({
      data: {
        email: data.email,
        password: await bcrypt.hash(data.password, 10),
        contactName: data.contactName,
        greetingName: optionalText(data.greetingName),
        isActive: data.isActive,
        welcomeTitle: optionalText(data.welcomeTitle),
        welcomeMessage: optionalText(data.welcomeMessage),
        brands: {
          create: data.brands.map((brand) => ({
            brandName: brand.brandName.trim(),
            workgroupId: brand.workgroupId,
          })),
        },
      },
      include: { brands: true },
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

    const {
      id,
      password,
      greetingName,
      welcomeTitle,
      welcomeMessage,
      brands,
      ...rest
    } = updateSchema.parse(await req.json())

    if (duplicateWorkgroup(brands)) {
      return NextResponse.json(
        { error: "هر کارگروه فقط یک بار می‌تواند به این حساب وصل شود" },
        { status: 400 }
      )
    }

    // The brand list arrives whole: what is missing from it was removed, and
    // removing a brand takes its evaluations with it (the admin confirms that
    // in the dialog, where the counts are shown).
    const keptIds = brands.map((brand) => brand.id).filter(Boolean) as string[]

    const client = await prisma.$transaction(async (tx) => {
      await tx.clientBrand.deleteMany({
        where: { clientId: id, id: { notIn: keptIds } },
      })

      for (const brand of brands) {
        const values = {
          brandName: brand.brandName.trim(),
          workgroupId: brand.workgroupId,
        }

        if (brand.id) {
          // Scoped to this account, so a stray id cannot move another
          // client's brand across.
          await tx.clientBrand.updateMany({
            where: { id: brand.id, clientId: id },
            data: values,
          })
        } else {
          await tx.clientBrand.create({ data: { ...values, clientId: id } })
        }
      }

      return tx.clientAccount.update({
        where: { id },
        data: {
          ...rest,
          ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
          greetingName: optionalText(greetingName),
          welcomeTitle: optionalText(welcomeTitle),
          welcomeMessage: optionalText(welcomeMessage),
        },
        include: { brands: true },
      })
    })

    return NextResponse.json({ success: true, client })
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "اطلاعات وارد شده نامعتبر است" }, { status: 400 })
    }
    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          error: error?.meta?.target?.includes?.("workgroupId")
            ? "هر کارگروه فقط یک بار می‌تواند به این حساب وصل شود"
            : "حسابی با این ایمیل از قبل وجود دارد",
        },
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
