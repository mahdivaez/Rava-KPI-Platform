import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileImageUpload } from "@/components/profile/profile-image-upload"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Shield, Calendar } from "lucide-react"

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const user = session.user
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-nude-900">پروفایل کاربری</h1>
        <p className="text-nude-600 mt-1">مشاهده و ویرایش اطلاعات شخصی</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Picture Card */}
        <Card className="card-nude border-nude-200 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg text-nude-900">تصویر پروفایل</CardTitle>
            <CardDescription>آپلود یا تغییر تصویر پروفایل</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="w-32 h-32 border-4 border-nude-200">
              <AvatarImage src={user.image || undefined} alt={user.name || "Profile"} />
              <AvatarFallback className="bg-nude-200 text-nude-700 text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <ProfileImageUpload currentImage={user.image} userId={user.id} />
          </CardContent>
        </Card>

        {/* User Information Card */}
        <Card className="card-nude border-nude-200 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-nude-900">اطلاعات کاربری</CardTitle>
            <CardDescription>اطلاعات عمومی حساب کاربری شما</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="flex items-center gap-3 p-4 bg-nude-50 rounded-xl border border-nude-200">
              <User className="w-5 h-5 text-nude-600" />
              <div className="flex-1">
                <p className="text-sm text-nude-600 mb-1">نام و نام خانوادگی</p>
                <p className="font-semibold text-nude-900">{user.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 p-4 bg-nude-50 rounded-xl border border-nude-200">
              <Mail className="w-5 h-5 text-nude-600" />
              <div className="flex-1">
                <p className="text-sm text-nude-600 mb-1">ایمیل</p>
                <p className="font-semibold text-nude-900">{user.email}</p>
              </div>
            </div>

            {/* Roles */}
            <div className="flex items-center gap-3 p-4 bg-nude-50 rounded-xl border border-nude-200">
              <Shield className="w-5 h-5 text-nude-600" />
              <div className="flex-1">
                <p className="text-sm text-nude-600 mb-2">نقش‌ها</p>
                <div className="flex gap-2 flex-wrap">
                  {user.isAdmin && <Badge className="badge-error">مدیر سیستم</Badge>}
                  {user.isTechnicalDeputy && <Badge className="badge-neutral">معاون فنی</Badge>}
                  {!user.isAdmin && !user.isTechnicalDeputy && <Badge variant="outline">کاربر</Badge>}
                </div>
              </div>
            </div>

            {/* Account Created */}
            <div className="flex items-center gap-3 p-4 bg-nude-50 rounded-xl border border-nude-200">
              <Calendar className="w-5 h-5 text-nude-600" />
              <div className="flex-1">
                <p className="text-sm text-nude-600 mb-1">عضویت از</p>
                <p className="font-semibold text-nude-900">
                  {new Date().toLocaleDateString('fa-IR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Notice */}
      <Card className="border-info/30 bg-info/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-info mt-0.5" />
            <div>
              <h3 className="font-semibold text-info mb-1">نکته امنیتی</h3>
              <p className="text-sm text-muted-foreground">
                برای تغییر رمز عبور یا اطلاعات حساس، با مدیر سیستم تماس بگیرید.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

