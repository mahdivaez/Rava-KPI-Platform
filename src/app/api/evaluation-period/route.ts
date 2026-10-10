import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { getOpenPeriod, setOpenPeriod } from "@/lib/evaluation-period"

export const dynamic = "force-dynamic"

/** The month currently open for KPI entry. Any signed-in user may read it. */
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "غیرمجاز" }, { status: 401 })
  }
  return NextResponse.json(await getOpenPeriod())
}

const updateSchema = z.union([
  z.object({ mode: z.literal("auto") }),
  z.object({
    mode: z.literal("manual"),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(1400).max(1500),
  }),
])

/** Admins pin the open month, or switch back to following the calendar. */
export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "غیرمجاز" }, { status: 403 })
  }

  try {
    const body = updateSchema.parse(await req.json())
    await setOpenPeriod(
      body.mode === "auto" ? null : { month: body.month, year: body.year }
    )
    return NextResponse.json(await getOpenPeriod())
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "اطلاعات ارسالی نامعتبر است" }, { status: 400 })
    }
    console.error("Error updating evaluation period:", error)
    return NextResponse.json({ error: "خطا در ذخیره دوره ارزیابی" }, { status: 500 })
  }
}
