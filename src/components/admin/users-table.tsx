"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { User } from "@prisma/client"
import { Mail, Pencil, Search, ShieldCheck, Trash2, UserRound, Users } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EditUserDialog } from "./edit-user-dialog"

export function UsersTable({ users }: { users: User[] }) {
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [query, setQuery] = useState("")
  const router = useRouter()

  // Client-side filter over the rows already on the page — no refetch.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q)
    )
  }, [users, query])

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

  const initialsOf = (u: User) =>
    `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}` || "؟"

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4 sm:px-6">
        <div className="relative w-full sm:max-w-xs">
          <Search
            aria-hidden
            className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-foreground-subtle"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی نام یا ایمیل…"
            aria-label="جستجوی کاربران"
            className="ps-9"
          />
        </div>
        <p className="text-sm text-foreground-muted" aria-live="polite">
          {filtered.length.toLocaleString("fa-IR")} از{" "}
          {users.length.toLocaleString("fa-IR")} کاربر
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title={query ? "کاربری با این مشخصات پیدا نشد" : "هنوز کاربری ثبت نشده است"}
          description={
            query
              ? "عبارت جستجو را تغییر دهید یا آن را پاک کنید."
              : "با دکمه «کاربر جدید» اولین حساب کاربری را بسازید."
          }
          action={
            query ? (
              <Button variant="outline" onClick={() => setQuery("")}>
                پاک کردن جستجو
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام</TableHead>
                  <TableHead>ایمیل</TableHead>
                  <TableHead>سطح دسترسی</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead className="text-end">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <span className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarImage src={user.image || undefined} alt="" />
                          <AvatarFallback className="text-2xs">
                            {initialsOf(user)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell dir="ltr" className="text-start text-foreground-muted">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <AccessBadges user={user} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge active={user.isActive} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditingUser(user)}
                          aria-label={`ویرایش ${user.firstName} ${user.lastName}`}
                          title="ویرایش"
                        >
                          <Pencil className="size-4" aria-hidden />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(user.id)}
                          aria-label={`حذف ${user.firstName} ${user.lastName}`}
                          title="حذف"
                          className="text-danger hover:bg-danger-subtle hover:text-danger"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <ul className="space-y-3 px-5 pb-5 md:hidden">
            {filtered.map((user) => (
              <li
                key={user.id}
                className="rounded-xl border border-border bg-surface-sunken p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src={user.image || undefined} alt="" />
                      <AvatarFallback>{initialsOf(user)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p
                        dir="ltr"
                        className="flex items-center gap-1.5 truncate text-xs text-foreground-muted"
                      >
                        <Mail className="size-3 shrink-0" aria-hidden />
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setEditingUser(user)}
                      aria-label={`ویرایش ${user.firstName} ${user.lastName}`}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(user.id)}
                      aria-label={`حذف ${user.firstName} ${user.lastName}`}
                      className="text-danger hover:bg-danger-subtle hover:text-danger"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <AccessBadges user={user} />
                  <StatusBadge active={user.isActive} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

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

function AccessBadges({ user }: { user: User }) {
  if (user.isAdmin) {
    return (
      <Badge variant="info">
        <ShieldCheck aria-hidden />
        مدیر
      </Badge>
    )
  }
  if (user.isTechnicalDeputy) {
    return <Badge variant="secondary">معاون فنی</Badge>
  }
  return (
    <Badge variant="neutral">
      <UserRound aria-hidden />
      کاربر
    </Badge>
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
