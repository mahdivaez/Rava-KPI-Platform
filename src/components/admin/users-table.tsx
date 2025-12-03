"use client"

import { User } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Trash2, Mail, User as UserIcon } from "lucide-react"
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
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">نام</TableHead>
              <TableHead className="text-right">ایمیل</TableHead>
              <TableHead className="text-center">نقش</TableHead>
              <TableHead className="text-center">وضعیت</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-sm">
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell className="text-slate-600 text-sm">{user.email}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1 flex-wrap">
                    {user.isAdmin && <Badge className="badge-error text-xs">مدیر</Badge>}
                    {user.isTechnicalDeputy && (
                      <Badge className="badge-neutral text-xs">معاون فنی</Badge>
                    )}
                    {!user.isAdmin && !user.isTechnicalDeputy && (
                      <Badge variant="outline" className="text-xs">کاربر</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    {user.isActive ? (
                      <Badge variant="default" className="bg-green-500 text-xs">فعال</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">غیرفعال</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex gap-1 sm:gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
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
        {users.map((user) => (
          <Card key={user.id} className="border border-slate-200 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    <h3 className="font-semibold text-sm text-slate-900 truncate">
                      {user.firstName} {user.lastName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
                    <p className="text-xs text-slate-600 truncate">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {user.isAdmin && <Badge className="badge-error text-xs">مدیر</Badge>}
                    {user.isTechnicalDeputy && (
                      <Badge className="badge-neutral text-xs">معاون فنی</Badge>
                    )}
                    {!user.isAdmin && !user.isTechnicalDeputy && (
                      <Badge variant="outline" className="text-xs">کاربر</Badge>
                    )}
                    {user.isActive ? (
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
                    onClick={() => setEditingUser(user)}
                    className="h-8 w-8 p-0"
                    title="ویرایش"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
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

