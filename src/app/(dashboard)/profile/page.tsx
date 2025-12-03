import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileImageUpload } from "@/components/profile/profile-image-upload"
import { ProfileEditForm } from "@/components/profile/profile-edit-form"
import { PasswordChangeForm } from "@/components/profile/password-change-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Shield, Calendar } from "lucide-react"
import { formatPersianDate } from "@/lib/utils"
import { Toaster } from "sonner"

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/login')

  // Fetch full user data from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) redirect('/login')

  const fullName = `${user.firstName} ${user.lastName}`
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-nude-900">پروفایل کاربری</h1>
        <p className="text-sm sm:text-base text-nude-600 mt-1">مشاهده و ویرایش اطلاعات شخصی</p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Profile Picture Card */}
        <Card className="card-nude border-nude-200 lg:col-span-1">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg text-nude-900">تصویر پروفایل</CardTitle>
            <CardDescription className="text-xs sm:text-sm">آپلود یا تغییر تصویر پروفایل</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 border-3 sm:border-4 border-nude-200">
              <AvatarImage src={user.image || undefined} alt={fullName || "Profile"} />
              <AvatarFallback className="bg-nude-200 text-nude-700 text-2xl sm:text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <ProfileImageUpload currentImage={user.image} userId={user.id} />
          </CardContent>
        </Card>

        {/* User Information Card */}
        <Card className="card-nude border-nude-200 lg:col-span-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg text-nude-900">اطلاعات کاربری</CardTitle>
            <CardDescription className="text-xs sm:text-sm">اطلاعات عمومی حساب کاربری شما</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            {/* Name */}
            <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-nude-50 rounded-lg sm:rounded-xl border border-nude-200">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-nude-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-nude-600 mb-1">نام و نام خانوادگی</p>
                <p className="font-semibold text-sm sm:text-base text-nude-900 truncate">{fullName}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-nude-50 rounded-lg sm:rounded-xl border border-nude-200">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-nude-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-nude-600 mb-1">ایمیل</p>
                <p className="font-semibold text-sm sm:text-base text-nude-900 truncate">{user.email}</p>
              </div>
            </div>

            {/* Roles */}
            <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-nude-50 rounded-lg sm:rounded-xl border border-nude-200">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-nude-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-nude-600 mb-2">نقش‌ها</p>
                <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                  {user.isAdmin && <Badge className="badge-error text-xs">مدیر سیستم</Badge>}
                  {user.isTechnicalDeputy && <Badge className="badge-neutral text-xs">معاون فنی</Badge>}
                  {!user.isAdmin && !user.isTechnicalDeputy && <Badge variant="outline" className="text-xs">کاربر</Badge>}
                </div>
              </div>
            </div>

            {/* Account Created */}
            <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-nude-50 rounded-lg sm:rounded-xl border border-nude-200">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-nude-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-nude-600 mb-1">عضویت از</p>
                <p className="font-semibold text-sm sm:text-base text-nude-900">
                  {formatPersianDate(user.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Profile Edit Form */}
        <Card className="card-nude border-nude-200">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg text-nude-900">ویرایش اطلاعات شخصی</CardTitle>
            <CardDescription className="text-xs sm:text-sm">تغییر نام و ایمیل حساب کاربری شما</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ProfileEditForm
              userId={user.id}
              firstName={user.firstName}
              lastName={user.lastName}
              email={user.email}
            />
          </CardContent>
        </Card>

        {/* Password Change Form - Takes full width on large screens */}
        <div className="lg:col-span-2">
          <PasswordChangeForm userId={user.id} />
        </div>
      </div>
      
      {/* Toast Notifications */}
      <Toaster position="top-center" richColors />
    </div>
  )
}

