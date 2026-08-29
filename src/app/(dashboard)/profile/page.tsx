import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CalendarDays, KeyRound, Mail, Pencil, ShieldCheck, UserRound } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { ProfileImageUpload } from "@/components/profile/profile-image-upload"
import { ProfileEditForm } from "@/components/profile/profile-edit-form"
import { PasswordChangeForm } from "@/components/profile/password-change-form"
import { formatPersianDate } from "@/lib/utils"

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/login')

  // Fetch full user data from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) redirect('/login')

  const fullName = `${user.firstName} ${user.lastName}`
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()

  const accessLabel = user.isAdmin
    ? "مدیر سیستم"
    : user.isTechnicalDeputy
      ? "معاون فنی"
      : "کاربر عادی"

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="پروفایل کاربری"
        description="مدیریت اطلاعات شخصی و امنیت حساب شما"
        icon={<UserRound />}
        breadcrumbs={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "پروفایل" },
        ]}
      />

      <Tabs defaultValue="overview" className="space-y-5">
        <TabsList variant="underline" className="w-full">
          <TabsTrigger variant="underline" value="overview">
            <UserRound aria-hidden />
            نمای کلی
          </TabsTrigger>
          <TabsTrigger variant="underline" value="edit">
            <Pencil aria-hidden />
            ویرایش
          </TabsTrigger>
          <TabsTrigger variant="underline" value="security">
            <KeyRound aria-hidden />
            امنیت
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Identity card */}
            <Card className="lg:col-span-1">
              <CardContent className="flex flex-col items-center gap-5 pt-6 text-center">
                <Avatar className="size-28 ring-2 ring-border">
                  <AvatarImage src={user.image || undefined} alt="" />
                  <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">{fullName}</h2>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {user.isAdmin && (
                      <Badge variant="info">
                        <ShieldCheck aria-hidden />
                        مدیر سیستم
                      </Badge>
                    )}
                    {user.isTechnicalDeputy && (
                      <Badge variant="secondary">معاون فنی</Badge>
                    )}
                    {!user.isAdmin && !user.isTechnicalDeputy && (
                      <Badge variant="neutral">کاربر</Badge>
                    )}
                  </div>
                </div>

                <div className="w-full border-t border-border-subtle pt-5">
                  <ProfileImageUpload currentImage={user.image} userId={user.id} />
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <div className="space-y-5 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>اطلاعات شخصی</CardTitle>
                  <CardDescription>
                    این اطلاعات در گزارش‌ها و ارزیابی‌ها نمایش داده می‌شود
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                    <Field
                      icon={<UserRound />}
                      label="نام و نام خانوادگی"
                      value={fullName}
                    />
                    <Field icon={<Mail />} label="ایمیل" value={user.email} />
                    <Field
                      icon={<CalendarDays />}
                      label="تاریخ عضویت"
                      value={formatPersianDate(user.createdAt)}
                    />
                    <Field
                      icon={<CalendarDays />}
                      label="آخرین بروزرسانی"
                      value={formatPersianDate(user.updatedAt)}
                    />
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>وضعیت حساب</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <StatusTile
                      label="وضعیت حساب"
                      value={user.isActive ? "فعال" : "غیرفعال"}
                      tone={user.isActive ? "success" : "danger"}
                    />
                    <StatusTile label="سطح دسترسی" value={accessLabel} tone="neutral" />
                    <StatusTile label="امنیت" value="محافظت‌شده" tone="success" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Edit */}
        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>ویرایش اطلاعات شخصی</CardTitle>
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

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>تغییر رمز عبور</CardTitle>
              <CardDescription>
                برای افزایش امنیت حساب، رمز عبور خود را به‌صورت دوره‌ای تغییر دهید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordChangeForm userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ==========================================================================
   Local pieces
   ========================================================================== */

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden
        className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-surface-sunken text-foreground-subtle [&>svg]:size-4"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-foreground-muted">{label}</dt>
        <dd className="truncate font-medium text-foreground">{value}</dd>
      </div>
    </div>
  )
}

function StatusTile({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "success" | "danger" | "neutral"
}) {
  const toneClass = {
    success: "text-success",
    danger: "text-danger",
    neutral: "text-foreground",
  }[tone]

  return (
    <div className="rounded-xl border border-border bg-surface-sunken p-4">
      <p className="text-xs text-foreground-muted">{label}</p>
      <p className={`mt-1 font-semibold ${toneClass}`}>{value}</p>
    </div>
  )
}
