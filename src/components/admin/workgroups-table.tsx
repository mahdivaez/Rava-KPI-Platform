"use client"

import { Workgroup, WorkgroupMember, User } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { FolderKanban, Pencil, Trash2, Users } from "lucide-react"
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

  const initialsOf = (u: User) =>
    `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}` || "؟"

  return (
    <>
      {workgroups.length === 0 ? (
        <EmptyState
          icon={<FolderKanban />}
          title="هنوز کارگروهی ایجاد نشده است"
          description="با دکمه «کارگروه جدید» اولین کارگروه را بسازید و اعضا را به آن اضافه کنید."
        />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام کارگروه</TableHead>
                  <TableHead>توضیحات</TableHead>
                  <TableHead>اعضا</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead className="text-end">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workgroups.map((workgroup) => (
                  <TableRow key={workgroup.id}>
                    <TableCell className="font-medium text-foreground">
                      {workgroup.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-foreground-muted">
                      {workgroup.description || "—"}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {/* Overlapping avatars read faster than a bare count. */}
                        <span className="flex -space-x-2 space-x-reverse">
                          {workgroup.members.slice(0, 3).map((m) => (
                            <Avatar
                              key={m.id}
                              className="size-7 ring-2 ring-card"
                              title={`${m.user.firstName} ${m.user.lastName}`}
                            >
                              <AvatarImage src={m.user.image || undefined} alt="" />
                              <AvatarFallback className="text-[10px]">
                                {initialsOf(m.user)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </span>
                        <span data-numeric className="text-sm text-foreground-muted">
                          {workgroup._count.members.toLocaleString("fa-IR")} نفر
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge active={workgroup.isActive} />
                    </TableCell>
                    <TableCell>
                      <RowActions
                        name={workgroup.name}
                        onMembers={() => setManagingMembers(workgroup)}
                        onEdit={() => setEditingWorkgroup(workgroup)}
                        onDelete={() => handleDelete(workgroup.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <ul className="space-y-3 px-5 pb-5 md:hidden">
            {workgroups.map((workgroup) => (
              <li
                key={workgroup.id}
                className="rounded-xl border border-border bg-surface-sunken p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">
                      {workgroup.name}
                    </p>
                    {workgroup.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-foreground-muted">
                        {workgroup.description}
                      </p>
                    )}
                  </div>
                  <RowActions
                    name={workgroup.name}
                    onMembers={() => setManagingMembers(workgroup)}
                    onEdit={() => setEditingWorkgroup(workgroup)}
                    onDelete={() => handleDelete(workgroup.id)}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">
                    <Users aria-hidden />
                    {workgroup._count.members.toLocaleString("fa-IR")} نفر
                  </Badge>
                  <StatusBadge active={workgroup.isActive} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

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

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="success" dot="bg-success">
      فعال
    </Badge>
  ) : (
    <Badge variant="neutral" dot="bg-foreground-subtle">
      غیرفعال
    </Badge>
  )
}

function RowActions({
  name,
  onMembers,
  onEdit,
  onDelete,
}: {
  name: string
  onMembers: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex shrink-0 justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onMembers}
        aria-label={`مدیریت اعضای ${name}`}
        title="مدیریت اعضا"
      >
        <Users className="size-4" aria-hidden />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onEdit}
        aria-label={`ویرایش ${name}`}
        title="ویرایش"
      >
        <Pencil className="size-4" aria-hidden />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        aria-label={`حذف ${name}`}
        title="حذف"
        className="text-danger hover:bg-danger-subtle hover:text-danger"
      >
        <Trash2 className="size-4" aria-hidden />
      </Button>
    </div>
  )
}
