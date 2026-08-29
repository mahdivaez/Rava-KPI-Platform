"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { MessageSquare, Send } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { formatPersianDateTime } from "@/lib/utils"

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
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="size-5 text-foreground-subtle" aria-hidden />
        <h3 className="font-semibold text-foreground">
          نظرات{" "}
          <span data-numeric className="text-foreground-muted">
            ({comments.length.toLocaleString("fa-IR")})
          </span>
        </h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 ? (
          <EmptyState
            icon={<MessageSquare />}
            title="هنوز نظری ثبت نشده است"
            description="اولین نفری باشید که درباره این ارزیابی نظر می‌دهد."
            size="sm"
          />
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-4 bg-surface-sunken rounded-xl">
              <Avatar className="size-10 ring-1 ring-border">
                <AvatarImage src={comment.author.image || undefined} />
                <AvatarFallback className="bg-muted text-foreground-secondary text-sm">
                  {getInitials(comment.author.firstName, comment.author.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-semibold text-foreground text-sm">
                    {comment.author.firstName} {comment.author.lastName}
                  </span>
                  <span className="text-xs text-foreground-subtle">
                    {formatPersianDateTime(comment.createdAt, 'yyyy/MM/dd HH:mm')}
                  </span>
                </div>
                <p className="text-foreground-secondary text-sm leading-relaxed whitespace-pre-wrap">
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
          placeholder="نظر خود را بنویسید…"
          className="min-h-[100px]"
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} disabled={!newComment.trim()}>
            {!isSubmitting && <Send aria-hidden />}
            {isSubmitting ? "در حال ثبت…" : "ثبت نظر"}
          </Button>
        </div>
      </form>
    </Card>
  )
}

