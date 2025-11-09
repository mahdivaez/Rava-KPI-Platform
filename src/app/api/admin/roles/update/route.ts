import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, field, value } = await req.json()

    // Prevent user from removing their own admin status
    if (userId === session.user.id && field === 'isAdmin' && !value) {
      return NextResponse.json(
        { error: "Cannot remove your own admin status" },
        { status: 400 }
      )
    }

    // Update user role
    await prisma.user.update({
      where: { id: userId },
      data: { [field]: value },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating role:", error)
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    )
  }
}

