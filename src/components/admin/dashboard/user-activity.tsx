"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, UserCheck, UserX, Shield, Briefcase, PenTool } from "lucide-react"
import { format } from "date-fns"
import { faIR } from 'date-fns/locale'

interface UserActivityProps {
  users: any[]
  totalUsers: number
  activeUsers: number
  strategists: number
  writers: number
}

export function UserActivity({ users, totalUsers, activeUsers, strategists, writers }: UserActivityProps) {
  const inactiveUsers = totalUsers - activeUsers
  const admins = users.filter(u => u.isAdmin).length
  const technicalDeputies = users.filter(u => u.isTechnicalDeputy).length

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const getUserRoleBadges = (user: any) => {
    const badges = []
    if (user.isAdmin) {
      badges.push(
        <Badge key="admin" className="badge-error">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      )
    }
    if (user.isTechnicalDeputy) {
      badges.push(
        <Badge key="deputy" className="badge-neutral">
          معاون فنی
        </Badge>
      )
    }
    return badges
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* User Statistics Cards */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>📊 آمار کاربران سیستم</CardTitle>
          <CardDescription>توزیع و وضعیت کاربران</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="flex items-center gap-3 p-4 rounded-lg border border-nude-200 bg-nude-50">
              <Users className="h-10 w-10 text-nude-600" />
              <div>
                <p className="text-2xl font-bold text-nude-900">{totalUsers}</p>
                <p className="text-xs text-nude-600">کل کاربران</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border border-success/30 bg-success/10">
              <UserCheck className="h-10 w-10 text-success" />
              <div>
                <p className="text-2xl font-bold text-success-foreground">{activeUsers}</p>
                <p className="text-xs text-success">کاربران فعال</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border border-nude-200 bg-nude-50">
              <UserX className="h-10 w-10 text-nude-500" />
              <div>
                <p className="text-2xl font-bold text-nude-900">{inactiveUsers}</p>
                <p className="text-xs text-nude-600">غیرفعال</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border border-nude-200 bg-nude-50">
              <Briefcase className="h-10 w-10 text-nude-600" />
              <div>
                <p className="text-2xl font-bold text-nude-900">{strategists}</p>
                <p className="text-xs text-nude-600">استراتژیست</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border border-nude-200 bg-nude-50">
              <PenTool className="h-10 w-10 text-nude-600" />
              <div>
                <p className="text-2xl font-bold text-nude-900">{writers}</p>
                <p className="text-xs text-nude-600">نویسنده</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Users List */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>👥 کاربران اخیر</CardTitle>
          <CardDescription>10 کاربر آخر ثبت‌نام شده</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div 
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-nude-200 text-nude-700">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getUserRoleBadges(user)}
                  {user.isActive ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      فعال
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-100 text-slate-600">
                      غیرفعال
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {users.length === 0 && (
            <p className="text-center text-slate-500 py-8">
              هیچ کاربری یافت نشد
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

