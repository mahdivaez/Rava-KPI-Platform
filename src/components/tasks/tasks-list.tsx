"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, AlertTriangle, X } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: Date | null
  createdAt: Date
  completedAt: Date | null
  writer: { firstName: string; lastName: string }
  creator: { firstName: string; lastName: string }
  workgroup: { name: string } | null
}

interface TasksListProps {
  tasks: Task[]
  isCreator: boolean
}

export function TasksList({ tasks, isCreator }: TasksListProps) {
  const router = useRouter()

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge className="badge-error">فوری</Badge>
      case "HIGH":
        return <Badge className="badge-warning">بالا</Badge>
      case "MEDIUM":
        return <Badge className="bg-info/10 text-info border border-info/30">متوسط</Badge>
      default:
        return <Badge className="badge-neutral">کم</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="badge-success"><CheckCircle2 className="w-3 h-3 ml-1" />تکمیل شده</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-info/10 text-info border border-info/30"><Clock className="w-3 h-3 ml-1" />در حال انجام</Badge>
      case "CANCELLED":
        return <Badge variant="outline"><X className="w-3 h-3 ml-1" />لغو شده</Badge>
      default:
        return <Badge className="badge-neutral">در انتظار</Badge>
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/tasks/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      })

      if (!response.ok) throw new Error()

      toast.success("موفق", { description: "وضعیت وظیفه بهروزرسانی شد" })
      router.refresh()
    } catch (error) {
      toast.error("خطا", { description: "خطا در بهروزرسانی وظیفه" })
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-nude-400 mx-auto mb-4" />
        <p className="text-nude-600">هیچ وظیفه‌ای ثبت نشده است</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
        const daysLeft = task.dueDate
          ? Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : null

        return (
          <div
            key={task.id}
            className={`p-4 rounded-xl border transition-all ${
              isOverdue
                ? 'bg-destructive/5 border-destructive/30'
                : 'bg-nude-50 border-nude-200 hover:border-nude-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-nude-900 text-lg">{task.title}</h3>
                  {getPriorityBadge(task.priority)}
                  {isOverdue && (
                    <Badge className="badge-error">
                      <AlertTriangle className="w-3 h-3 ml-1" />
                      عقب افتاده
                    </Badge>
                  )}
                </div>
                {task.description && (
                  <p className="text-sm text-nude-600 mb-2">{task.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-nude-600">
                  {isCreator ? (
                    <span>برای: {task.writer.firstName} {task.writer.lastName}</span>
                  ) : (
                    <span>از: {task.creator.firstName} {task.creator.lastName}</span>
                  )}
                  {task.workgroup && (
                    <span className="flex items-center gap-1">
                      <span className="text-nude-400">•</span>
                      {task.workgroup.name}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className={`flex items-center gap-1 ${isOverdue ? 'text-destructive font-medium' : ''}`}>
                      <span className="text-nude-400">•</span>
                      مهلت: {new Date(task.dueDate).toLocaleDateString('fa-IR')}
                      {daysLeft !== null && daysLeft > 0 && ` (${daysLeft} روز)`}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(task.status)}
              </div>
            </div>

            {/* Action Buttons (for writers) */}
            {!isCreator && task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
              <div className="flex gap-2 pt-3 border-t border-nude-200">
                {task.status === 'PENDING' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                    className="bg-info hover:bg-info/90 text-white"
                  >
                    شروع وظیفه
                  </Button>
                )}
                {task.status === 'IN_PROGRESS' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                    className="bg-success hover:bg-success/90 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 ml-1" />
                    تکمیل وظیفه
                  </Button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

