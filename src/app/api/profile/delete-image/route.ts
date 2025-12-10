import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await req.json()

    // Verify user can only delete their own image (unless admin)
    if (userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get current user to check if they have an image
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove user image from database (blob storage file will be orphaned)
    await prisma.user.update({
      where: { id: userId },
      data: { image: null },
    })

    return NextResponse.json({ 
      success: true,
      message: "Image deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    )
  }
}

