"use client"

import { User } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { EditUserDialog } from "./edit-user-dialog"
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

export function UsersTable({ users }: { users: User[] }) {
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const router = useRouter()

  async function handleDelete(userId: string) {
    if (!confirm("آیا از حذف این کاربر اطمینان دارید؟")) return

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("کاربر با موفقیت حذف شد")
        router.refresh()
      } else {
        toast.error("خطا در حذف کاربر")
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
            <TableHead>نام</TableHead>
            <TableHead>ایمیل</TableHead>
            <TableHead>نقش</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead className="text-left">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell className="text-slate-600">{user.email}</TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {user.isAdmin && <Badge className="badge-error">مدیر</Badge>}
                  {user.isTechnicalDeputy && (
                    <Badge className="badge-neutral">معاون فنی</Badge>
                  )}
                  {!user.isAdmin && !user.isTechnicalDeputy && (
                    <Badge variant="outline">کاربر</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {user.isActive ? (
                  <Badge variant="default" className="bg-green-500">فعال</Badge>
                ) : (
                  <Badge variant="destructive">غیرفعال</Badge>
                )}
              </TableCell>
              <TableCell className="text-left">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingUser(user)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        />
      )}
    </>
  )
}

