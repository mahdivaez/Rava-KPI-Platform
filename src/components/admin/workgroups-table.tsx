"use client"

import { Workgroup, WorkgroupMember, User } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Users } from "lucide-react"
import { EditWorkgroupDialog } from "./edit-workgroup-dialog"
import { ManageMembersDialog } from "./manage-members-dialog"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type WorkgroupWithMembers = Workgroup & {
  members: (WorkgroupMember & { user: User })[]
  _count: { members: number }
}

export function WorkgroupsTable({
  workgroups,
  users,
}: {
  workgroups: WorkgroupWithMembers[]
  users: User[]
}) {
  const [editingWorkgroup, setEditingWorkgroup] = useState<Workgroup | null>(null)
  const [managingMembers, setManagingMembers] = useState<WorkgroupWithMembers | null>(null)
  const router = useRouter()

  async function handleDelete(workgroupId: string) {
    if (!confirm("آیا از حذف این کارگروه اطمینان دارید؟")) return

    try {
      const res = await fetch(`/api/admin/workgroups?id=${workgroupId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("کارگروه با موفقیت حذف شد")
        router.refresh()
      } else {
        toast.error("خطا در حذف کارگروه")
      }
    } catch (error) {
      toast.error("خطای سرور")
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>نام کارگروه</TableHead>
            <TableHead>توضیحات</TableHead>
            <TableHead className="text-center">تعداد اعضا</TableHead>
            <TableHead className="text-center">وضعیت</TableHead>
            <TableHead className="text-left">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workgroups.map((workgroup) => (
            <TableRow key={workgroup.id}>
              <TableCell className="font-medium">{workgroup.name}</TableCell>
              <TableCell className="text-slate-600 max-w-md truncate">
                {workgroup.description || "-"}
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <Badge variant="outline">{workgroup._count.members} نفر</Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  {workgroup.isActive ? (
                    <Badge variant="default" className="bg-green-500">فعال</Badge>
                  ) : (
                    <Badge variant="destructive">غیرفعال</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-left">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setManagingMembers(workgroup)}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingWorkgroup(workgroup)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(workgroup.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingWorkgroup && (
        <EditWorkgroupDialog
          workgroup={editingWorkgroup}
          open={!!editingWorkgroup}
          onOpenChange={(open) => !open && setEditingWorkgroup(null)}
        />
      )}

      {managingMembers && (
        <ManageMembersDialog
          workgroup={managingMembers}
          users={users}
          open={!!managingMembers}
          onOpenChange={(open) => !open && setManagingMembers(null)}
        />
      )}
    </>
  )
}

