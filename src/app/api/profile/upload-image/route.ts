// @ts-nocheck
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const rawUserId = formData.get("userId")
    const userId = typeof rawUserId === "string" ? rawUserId : undefined
    const isEvaluationImage = userId === 'evaluation-images'
    const isFeedbackImage = userId === 'feedback-images'
    const isSpecialImage = isEvaluationImage || isFeedbackImage

    // Determine whose profile should be updated (ignore provided userId for non-admins)
    const targetUserId = isSpecialImage
      ? undefined
      : session.user.isAdmin
        ? userId || session.user.id
        : session.user.id

    // Allow users to upload evaluation/feedback images or their own profile image
    if (!isSpecialImage && !targetUserId) {
      return NextResponse.json({ error: "Target user is required" }, { status: 400 })
    }

    if (!isSpecialImage && targetUserId !== session.user.id && !session.user.isAdmin) {
      console.log(`Upload denied: targetUserId=${targetUserId}, sessionUserId=${session.user.id}, isAdmin=${session.user.isAdmin}, isSpecialImage=${isSpecialImage}`)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Get file extension
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    
    if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed" }, { status: 400 })
    }

    // Generate unique filename
    const fileName = `${randomBytes(16).toString('hex')}.${fileExtension}`
    
    // Determine upload directory based on context
    let uploadDir: string
    let imageUrl: string
    
    if (isEvaluationImage) {
      // Save evaluation images to evaluations directory
      uploadDir = join(process.cwd(), 'public', 'uploads', 'evaluations')
      imageUrl = `/uploads/evaluations/${fileName}`
    } else if (isFeedbackImage) {
      // Save feedback images to feedback directory
      uploadDir = join(process.cwd(), 'public', 'uploads', 'feedback')
      imageUrl = `/uploads/feedback/${fileName}`
    } else {
      // Save profile images to profiles directory
      uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')
      imageUrl = `/uploads/profiles/${fileName}`
    }
    
    // Create upload directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true })
      console.log(`Created directory: ${uploadDir}`)
    } catch (error) {
      console.error(`Failed to create directory ${uploadDir}:`, error)
      // Continue anyway, directory might already exist
    }

    // Save file
    const filePath = join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    try {
      await writeFile(filePath, buffer)
      console.log(`File saved successfully: ${filePath}`)
    } catch (error) {
      console.error(`Failed to save file ${filePath}:`, error)
      throw new Error('Failed to save file')
    }

    // Update user image in database only for profile images
    if (!isSpecialImage) {
      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true },
      })

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      await prisma.user.update({
        where: { id: targetUserId },
        data: { image: imageUrl },
      })
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      message: "Image uploaded successfully" 
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
}

