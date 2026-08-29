"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { UserCog, Shield, Building2, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { TEAM_ROLES, getRoleBadgeClass, getRoleLabel, type TeamRole } from "@/lib/roles"

interface Membership {
  id: string
  role: string
  workgroupId: string
  workgroup: { name: string }
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  image: string | null
  isAdmin: boolean
  isTechnicalDeputy: boolean
  workgroupMemberships: Membership[]
}

interface RolesTableProps {
  users: User[]
  workgroups: Array<{ id: string; name: string }>
}

export function RolesTable({ users, workgroups }: RolesTableProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)
  const [assignFor, setAssignFor] = useState<User | null>(null)

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase()

  const handleToggleRole = async (
    userId: string,
    field: "isAdmin" | "isTechnicalDeputy",
    currentValue: boolean
  ) => {
    setUpdating(userId)
    try {
      const response = await fetch("/api/admin/roles/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, field, value: !currentValue }),
      })

      if (!response.ok) throw new Error()

      toast.success("موفق", { description: "نقش کاربر بهروزرسانی شد" })
      router.refresh()
    } catch {
      toast.error("خطا", { description: "خطا در بهروزرسانی نقش" })
    } finally {
      setUpdating(null)
    }
  }

  const handleRemoveMembership = async (membershipId: string) => {
    if (!confirm("آیا از حذف این نقش اطمینان دارید؟")) return

    try {
      const res = await fetch(`/api/admin/workgroups/members?id=${membershipId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast.success("نقش حذف شد")
      router.refresh()
    } catch {
      toast.error("خطا در حذف نقش")
    }
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-sunken">
              <TableHead>کاربر</TableHead>
              <TableHead>ایمیل</TableHead>
              <TableHead className="text-center">مدیر سیستم</TableHead>
              <TableHead className="text-center">معاون فنی</TableHead>
              <TableHead>نقش‌های کارگروهی</TableHead>
              <TableHead className="text-center">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-surface-hover">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className="bg-muted text-foreground-secondary">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-sm text-foreground-muted">{user.email}</span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Switch
                      checked={user.isAdmin}
                      onCheckedChange={() =>
                        handleToggleRole(user.id, "isAdmin", user.isAdmin)
                      }
                      disabled={updating === user.id}
                      className="data-[state=checked]:bg-destructive"
                    />
                    {user.isAdmin && <Shield className="w-4 h-4 text-destructive" />}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Switch
                      checked={user.isTechnicalDeputy}
                      onCheckedChange={() =>
                        handleToggleRole(
                          user.id,
                          "isTechnicalDeputy",
                          user.isTechnicalDeputy
                        )
                      }
                      disabled={updating === user.id}
                      className="data-[state=checked]:bg-primary"
                    />
                    {user.isTechnicalDeputy && (
                      <Building2 className="w-4 h-4 text-foreground-muted" />
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-md">
                    {user.workgroupMemberships.map((membership) => (
                      <Badge
                        key={membership.id}
                        className={`text-xs gap-1 ${getRoleBadgeClass(membership.role)}`}
                      >
                        {getRoleLabel(membership.role)}: {membership.workgroup.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveMembership(membership.id)}
                          className="opacity-60 hover:opacity-100 transition-opacity"
                          aria-label="حذف نقش"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                    {user.workgroupMemberships.length === 0 && (
                      <span className="text-sm text-foreground-subtle">بدون نقش</span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAssignFor(user)}
                      className="text-foreground-muted hover:text-foreground hover:bg-surface-hover gap-1"
                    >
                      <UserCog className="size-4" />
                      <span className="text-xs">تخصیص نقش</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {assignFor && (
        <AssignRoleDialog
          user={assignFor}
          workgroups={workgroups}
          open={!!assignFor}
          onOpenChange={(open) => !open && setAssignFor(null)}
        />
      )}
    </>
  )
}

function AssignRoleDialog({
  user,
  workgroups,
  open,
  onOpenChange,
}: {
  user: User
  workgroups: Array<{ id: string; name: string }>
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [workgroupId, setWorkgroupId] = useState("")
  const [role, setRole] = useState<TeamRole>("WRITER")
  const [loading, setLoading] = useState(false)

  async function handleAssign() {
    if (!workgroupId) {
      toast.error("لطفاً کارگروه را انتخاب کنید")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/workgroups/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workgroupId, userId: user.id, role }),
      })

      if (res.ok) {
        toast.success("نقش با موفقیت تخصیص داده شد")
        setWorkgroupId("")
        onOpenChange(false)
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || "خطا در تخصیص نقش")
      }
    } catch {
      toast.error("خطای سرور")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            تخصیص نقش به {user.firstName} {user.lastName}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            کارگروه و نقش کاربر را انتخاب کنید. هر کاربر می‌تواند در چند کارگروه و با
            چند نقش حضور داشته باشد.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>کارگروه</Label>
            <Select value={workgroupId} onValueChange={setWorkgroupId}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب کارگروه" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {workgroups.map((workgroup) => (
                  <SelectItem key={workgroup.id} value={workgroup.id}>
                    {workgroup.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>نقش</Label>
            <Select value={role} onValueChange={(value) => setRole(value as TeamRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {TEAM_ROLES.map((teamRole) => (
                  <SelectItem key={teamRole} value={teamRole}>
                    {getRoleLabel(teamRole)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-1">
            {user.workgroupMemberships.map((membership) => (
              <Badge
                key={membership.id}
                className={`text-xs ${getRoleBadgeClass(membership.role)}`}
              >
                {getRoleLabel(membership.role)}: {membership.workgroup.name}
              </Badge>
            ))}
          </div>

          <Button onClick={handleAssign} disabled={loading} className="w-full">
            <Plus className="size-4" />
            {loading ? "در حال ثبت…" : "تخصیص نقش"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
