import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { evaluationId, type, content } = await req.json()

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        evaluationId,
        type,
        content,
        authorId: session.user.id,
      },
      include: {
        author: true,
      },
    })

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}

