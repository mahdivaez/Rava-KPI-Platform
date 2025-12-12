import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileImageUpload } from "@/components/profile/profile-image-upload"
import { ProfileEditForm } from "@/components/profile/profile-edit-form"
import { PasswordChangeForm } from "@/components/profile/password-change-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Shield, Calendar, Settings, KeyRound, Edit3, Upload } from "lucide-react"
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
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Enhanced Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-nude-600 via-nude-500 to-nude-700 rounded-2xl p-6 sm:p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">پروفایل کاربری</h1>
          <p className="text-nude-100 text-sm sm:text-base">مدیریت و ویرایش اطلاعات شخصی شما</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mx-auto bg-white border border-nude-200 p-1 rounded-xl shadow-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-nude-50 data-[state=active]:text-nude-700">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">نمای کلی</span>
            <span className="sm:hidden">کلی</span>
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2 data-[state=active]:bg-nude-50 data-[state=active]:text-nude-700">
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">ویرایش</span>
            <span className="sm:hidden">ویرایش</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-nude-50 data-[state=active]:text-nude-700">
            <KeyRound className="w-4 h-4" />
            <span className="hidden sm:inline">امنیت</span>
            <span className="sm:hidden">امنیت</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Enhanced Profile Information */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Enhanced Profile Card */}
            <Card className="lg:col-span-1 border-0 shadow-xl bg-gradient-to-br from-white to-nude-50">
              <CardHeader className="text-center p-6">
                <div className="flex flex-col items-center gap-4">
                  {/* Avatar */}
                  <Avatar className="w-32 h-32 sm:w-36 sm:h-36 border-4 border-white shadow-lg">
                    <AvatarImage src={user.image || undefined} alt={fullName || "Profile"} />
                    <AvatarFallback className="bg-gradient-to-br from-nude-500 to-nude-600 text-white text-4xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Profile Image Upload */}
                  <div className="w-full max-w-xs">
                    <ProfileImageUpload currentImage={user.image} userId={user.id} />
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-nude-900">{fullName}</h2>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {user.isAdmin && <Badge className="badge-error text-xs">مدیر سیستم</Badge>}
                    {user.isTechnicalDeputy && <Badge className="badge-neutral text-xs">معاون فنی</Badge>}
                    {!user.isAdmin && !user.isTechnicalDeputy && <Badge variant="outline" className="text-xs">کاربر</Badge>}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Enhanced Information Cards */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-nude-900">
                    <User className="w-5 h-5 text-nude-600" />
                    اطلاعات شخصی
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-nude-500">نام و نام خانوادگی</p>
                      <p className="text-lg font-semibold text-nude-900">{fullName}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-nude-500">ایمیل</p>
                      <p className="text-lg font-semibold text-nude-900">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-nude-500">تاریخ عضویت</p>
                      <p className="text-lg font-semibold text-nude-900">{formatPersianDate(user.createdAt)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-nude-500">آخرین بروزرسانی</p>
                      <p className="text-lg font-semibold text-nude-900">{formatPersianDate(user.updatedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Statistics */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-nude-50 to-nude-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-nude-900">
                    <Settings className="w-5 h-5 text-nude-600" />
                    آمار حساب کاربری
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-nude-600">✓</div>
                      <div className="text-sm text-nude-600 mt-1">وضعیت حساب</div>
                      <div className="text-xs text-green-600 font-medium">فعال</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-nude-500">★</div>
                      <div className="text-sm text-nude-600 mt-1">سطح دسترسی</div>
                      <div className="text-xs text-nude-700 font-medium">
                        {user.isAdmin ? 'مدیر' : user.isTechnicalDeputy ? 'معاون فنی' : 'کاربر عادی'}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-nude-400">🛡️</div>
                      <div className="text-sm text-nude-600 mt-1">امنیت</div>
                      <div className="text-xs text-green-600 font-medium">محفاظت شده</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Edit Tab - Profile Information Form */}
        <TabsContent value="edit">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-nude-900">
                <Edit3 className="w-5 h-5 text-nude-600" />
                ویرایش اطلاعات شخصی
              </CardTitle>
              <CardDescription>
                نام و ایمیل حساب کاربری خود را بروزرسانی کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileEditForm
                userId={user.id}
                firstName={user.firstName}
                lastName={user.lastName}
                email={user.email}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab - Password Change */}
        <TabsContent value="security">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-nude-900">
                <KeyRound className="w-5 h-5 text-nude-600" />
                تغییر رمز عبور
              </CardTitle>
              <CardDescription>
                رمز عبور فعلی خود را تغییر دهید تا امنیت حساب خود را افزایش دهید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordChangeForm userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Toast Notifications */}
      <Toaster position="top-center" richColors />
    </div>
  )
}
