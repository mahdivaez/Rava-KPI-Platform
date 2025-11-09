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
import { UserCog, Shield, Building2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  image: string | null
  isAdmin: boolean
  isTechnicalDeputy: boolean
  workgroupMemberships: Array<{
    role: string
    workgroup: { name: string }
  }>
}

interface RolesTableProps {
  users: User[]
  workgroups: Array<{ id: string; name: string }>
}

export function RolesTable({ users, workgroups }: RolesTableProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const handleToggleRole = async (userId: string, field: 'isAdmin' | 'isTechnicalDeputy', currentValue: boolean) => {
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
    } catch (error) {
      toast.error("خطا", { description: "خطا در بهروزرسانی نقش" })
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="rounded-lg border border-nude-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-nude-50">
            <TableHead>کاربر</TableHead>
            <TableHead>ایمیل</TableHead>
            <TableHead className="text-center">مدیر سیستم</TableHead>
            <TableHead className="text-center">معاون فنی</TableHead>
            <TableHead>نقش‌های کارگروهی</TableHead>
            <TableHead className="text-center">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const strategistGroups = user.workgroupMemberships.filter(m => m.role === 'STRATEGIST')
            const writerGroups = user.workgroupMemberships.filter(m => m.role === 'WRITER')

            return (
              <TableRow key={user.id} className="hover:bg-nude-50">
                {/* User Info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-nude-200">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className="bg-nude-200 text-nude-700">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-nude-900">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell>
                  <span className="text-sm text-nude-600">{user.email}</span>
                </TableCell>

                {/* Admin Toggle */}
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Switch
                      checked={user.isAdmin}
                      onCheckedChange={() => handleToggleRole(user.id, 'isAdmin', user.isAdmin)}
                      disabled={updating === user.id}
                      className="data-[state=checked]:bg-destructive"
                    />
                    {user.isAdmin && <Shield className="w-4 h-4 text-destructive" />}
                  </div>
                </TableCell>

                {/* Technical Deputy Toggle */}
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Switch
                      checked={user.isTechnicalDeputy}
                      onCheckedChange={() => handleToggleRole(user.id, 'isTechnicalDeputy', user.isTechnicalDeputy)}
                      disabled={updating === user.id}
                      className="data-[state=checked]:bg-nude-500"
                    />
                    {user.isTechnicalDeputy && <Building2 className="w-4 h-4 text-nude-600" />}
                  </div>
                </TableCell>

                {/* Workgroup Roles */}
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {strategistGroups.map((m, i) => (
                      <Badge key={i} className="badge-neutral text-xs">
                        استراتژیست: {m.workgroup.name}
                      </Badge>
                    ))}
                    {writerGroups.map((m, i) => (
                      <Badge key={i} className="bg-success/10 text-success border border-success/30 text-xs">
                        نویسنده: {m.workgroup.name}
                      </Badge>
                    ))}
                    {user.workgroupMemberships.length === 0 && (
                      <span className="text-sm text-nude-500">بدون نقش</span>
                    )}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-nude-600 hover:text-nude-900 hover:bg-nude-100"
                    >
                      <UserCog className="h-4 w-4" />
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

