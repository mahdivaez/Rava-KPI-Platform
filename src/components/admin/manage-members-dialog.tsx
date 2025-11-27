"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Workgroup, WorkgroupMember, User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Trash2, Plus } from "lucide-react"

type WorkgroupWithMembers = Workgroup & {
  members: (WorkgroupMember & { user: User })[]
}

export function ManageMembersDialog({
  workgroup,
  users,
  open,
  onOpenChange,
}: {
  workgroup: WorkgroupWithMembers
  users: User[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedRole, setSelectedRole] = useState<"STRATEGIST" | "WRITER">("WRITER")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleAddMember() {
    if (!selectedUserId) {
      toast.error("لطفاً کاربر را انتخاب کنید")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/admin/workgroups/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workgroupId: workgroup.id,
          userId: selectedUserId,
          role: selectedRole,
        }),
      })

      if (res.ok) {
        toast.success("عضو با موفقیت اضافه شد")
        setSelectedUserId("")
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || "خطا در افزودن عضو")
      }
    } catch (error) {
      toast.error("خطای سرور")
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("آیا از حذف این عضو اطمینان دارید؟")) return

    try {
      const res = await fetch(`/api/admin/workgroups/members?id=${memberId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("عضو با موفقیت حذف شد")
        router.refresh()
      } else {
        toast.error("خطا در حذف عضو")
      }
    } catch (error) {
      toast.error("خطای سرور")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>مدیریت اعضای {workgroup.name}</DialogTitle>
          <DialogDescription>
            افزودن و حذف اعضای کارگروه
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Member Form */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">افزودن عضو جدید</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>کاربر</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب کاربر" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>نقش</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(v: any) => setSelectedRole(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STRATEGIST">استراتژیست</SelectItem>
                    <SelectItem value="WRITER">نویسنده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAddMember} disabled={loading} className="w-full">
              <Plus className="h-4 w-4 ml-2" />
              افزودن عضو
            </Button>
          </div>

          {/* Members List */}
          <div className="space-y-2">
            <h3 className="font-semibold">اعضای فعلی ({workgroup.members.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {workgroup.members.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">
                  هنوز عضوی اضافه نشده است
                </p>
              ) : (
                workgroup.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {member.user.firstName} {member.user.lastName}
                      </span>
                      <Badge variant={member.role === "STRATEGIST" ? "default" : "secondary"}>
                        {member.role === "STRATEGIST" ? "استراتژیست" : "نویسنده"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

