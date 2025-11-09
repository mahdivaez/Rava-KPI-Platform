"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Goal {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  targetValue: number
  currentValue: number
  unit: string
  startDate: Date
  endDate: Date
  user: { firstName: string; lastName: string } | null
  workgroup: { name: string } | null
  assigner: { firstName: string; lastName: string }
}

interface GoalsTableProps {
  goals: Goal[]
}

export function GoalsTable({ goals }: GoalsTableProps) {
  const router = useRouter()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="badge-success">تکمیل شده</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-info/10 text-info border border-info/30">در حال انجام</Badge>
      case "OVERDUE":
        return <Badge className="badge-error">عقب افتاده</Badge>
      default:
        return <Badge className="badge-neutral">شروع نشده</Badge>
    }
  }

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این هدف اطمینان دارید؟")) return

    try {
      const response = await fetch(`/api/admin/goals/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) throw new Error()

      toast.success("موفق", { description: "هدف حذف شد" })
      router.refresh()
    } catch (error) {
      toast.error("خطا", { description: "خطا در حذف هدف" })
    }
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-nude-600">هیچ هدفی ثبت نشده است</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-nude-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-nude-50">
            <TableHead>عنوان</TableHead>
            <TableHead>منتسب به</TableHead>
            <TableHead>هدف</TableHead>
            <TableHead>پیشرفت</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead>مهلت</TableHead>
            <TableHead className="text-center">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goals.map((goal) => {
            const progress = getProgress(goal.currentValue, goal.targetValue)
            const assignedTo = goal.user 
              ? `${goal.user.firstName} ${goal.user.lastName}`
              : goal.workgroup?.name || "شرکت"

            return (
              <TableRow key={goal.id} className="hover:bg-nude-50">
                <TableCell>
                  <div>
                    <p className="font-semibold text-nude-900">{goal.title}</p>
                    {goal.description && (
                      <p className="text-sm text-nude-600 mt-1">{goal.description}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-nude-700">{assignedTo}</span>
                </TableCell>
                <TableCell>
                  <div className="text-nude-900">
                    <span className="font-semibold">{goal.targetValue}</span> {goal.unit}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2 min-w-[150px]">
                    <div className="flex justify-between text-sm">
                      <span className="text-nude-700">{goal.currentValue.toFixed(0)}</span>
                      <span className="text-nude-600">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(goal.status)}</TableCell>
                <TableCell>
                  <span className="text-sm text-nude-600">
                    {new Date(goal.endDate).toLocaleDateString('fa-IR')}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-nude-600 hover:text-nude-900 hover:bg-nude-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(goal.id)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

