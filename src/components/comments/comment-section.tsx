"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { MessageSquare, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Comment {
  id: string
  content: string
  createdAt: Date
  author: {
    firstName: string
    lastName: string
    image: string | null
  }
}

interface CommentSectionProps {
  evaluationId: string
  type: "STRATEGIST_EVALUATION" | "WRITER_EVALUATION" | "WRITER_FEEDBACK"
  comments: Comment[]
  currentUserId: string
  currentUserName: string
}

export function CommentSection({
  evaluationId,
  type,
  comments,
  currentUserId,
  currentUserName,
}: CommentSectionProps) {
  const router = useRouter()
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/comments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluationId,
          type,
          content: newComment.trim(),
        }),
      })

      if (!response.ok) throw new Error()

      toast.success("موفق", { description: "نظر شما ثبت شد" })
      setNewComment("")
      router.refresh()
    } catch (error) {
      toast.error("خطا", { description: "خطا در ثبت نظر" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <Card className="p-6 border-nude-200 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-nude-600" />
        <h3 className="font-semibold text-nude-900">نظرات ({comments.length})</h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-nude-400 mx-auto mb-2" />
            <p className="text-nude-600 text-sm">هنوز نظری ثبت نشده است</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-4 bg-nude-50 rounded-xl">
              <Avatar className="h-10 w-10 border border-nude-200">
                <AvatarImage src={comment.author.image || undefined} />
                <AvatarFallback className="bg-nude-200 text-nude-700 text-sm">
                  {getInitials(comment.author.firstName, comment.author.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-semibold text-nude-900 text-sm">
                    {comment.author.firstName} {comment.author.lastName}
                  </span>
                  <span className="text-xs text-nude-500">
                    {new Date(comment.createdAt).toLocaleDateString('fa-IR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-nude-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="نظر خود را بنویسید..."
          className="bg-nude-50 border-nude-200 min-h-[100px]"
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="bg-nude-500 hover:bg-nude-600 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                در حال ثبت...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 ml-2" />
                ثبت نظر
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}

