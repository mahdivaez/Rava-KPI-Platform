"use client"

import { Workgroup, WorkgroupMember, User } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">نام کارگروه</TableHead>
              <TableHead className="text-right">توضیحات</TableHead>
              <TableHead className="text-center">تعداد اعضا</TableHead>
              <TableHead className="text-center">وضعیت</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workgroups.map((workgroup) => (
              <TableRow key={workgroup.id}>
                <TableCell className="font-medium text-sm">{workgroup.name}</TableCell>
                <TableCell className="text-slate-600 max-w-xs sm:max-w-md truncate text-sm">
                  {workgroup.description || "-"}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-xs">
                    {workgroup._count.members} نفر
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {workgroup.isActive ? (
                    <Badge variant="default" className="bg-green-500 text-xs">فعال</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">غیرفعال</Badge>
                  )}
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex gap-1 sm:gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setManagingMembers(workgroup)}
                      className="h-8 w-8 p-0"
                    >
                      <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingWorkgroup(workgroup)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(workgroup.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {workgroups.map((workgroup) => (
          <Card key={workgroup.id} className="border border-slate-200 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-900 truncate">
                    {workgroup.name}
                  </h3>
                  {workgroup.description && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {workgroup.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {workgroup._count.members} نفر
                    </Badge>
                    {workgroup.isActive ? (
                      <Badge variant="default" className="bg-green-500 text-xs">فعال</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">غیرفعال</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setManagingMembers(workgroup)}
                    className="h-8 w-8 p-0"
                    title="مدیریت اعضا"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingWorkgroup(workgroup)}
                    className="h-8 w-8 p-0"
                    title="ویرایش"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(workgroup.id)}
                    className="h-8 w-8 p-0"
                    title="حذف"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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

