import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // Create goal
    const goal = await prisma.goal.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        targetValue: data.targetValue,
        unit: data.unit,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        userId: data.userId || null,
        workgroupId: data.workgroupId || null,
        assignedBy: data.assignedBy,
      },
    })

    return NextResponse.json({ success: true, goal })
  } catch (error) {
    console.error("Error creating goal:", error)
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    )
  }
}

