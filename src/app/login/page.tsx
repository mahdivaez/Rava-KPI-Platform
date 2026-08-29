import type { Metadata } from "next"
import { BarChart3, ClipboardCheck, Users } from "lucide-react"

import { LoginForm } from "@/components/auth/login-form"
import { BrandLockup, BrandMark } from "@/components/dashboard/brand"

export const metadata: Metadata = {
  title: "ورود",
  description: "ورود به سامانه مدیریت عملکرد راوا",
}

const HIGHLIGHTS = [
  {
    icon: ClipboardCheck,
    title: "ارزیابی ماهانه بر اساس نقش",
    description: "هر نقش شاخص‌های خودش را دارد و فقط همکاران مرتبط را ارزیابی می‌کند.",
  },
  {
    icon: BarChart3,
    title: "تحلیل روند عملکرد",
    description: "روند امتیازها، رتبه‌بندی تیم و هشدارهای عملکردی در یک نگاه.",
  },
  {
    icon: Users,
    title: "مدیریت کارگروه‌ها",
    description: "تخصیص نقش، عضویت و سطوح دسترسی به‌صورت متمرکز.",
  },
]

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel — self-contained, no external asset to wait on. */}
      <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        {/* Decorative field: a faint grid plus two soft washes. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(rgb(255 255 255 / 0.6) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -start-24 size-[28rem] rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -end-16 size-[24rem] rounded-full bg-black/15 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-white/15 backdrop-blur-sm">
            <BrandMark className="size-7" />
          </span>
          <span>
            <span className="block font-display text-lg font-bold leading-tight">
              راوا
            </span>
            <span className="block text-sm leading-tight text-white/70">
              سامانه مدیریت عملکرد
            </span>
          </span>
        </div>

        <div className="relative max-w-md space-y-8">
          <h2 className="font-display text-3xl font-bold leading-snug">
            عملکرد تیم محتوا را شفاف، منظم و قابل اندازه‌گیری کنید
          </h2>

          <ul className="space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/15"
                >
                  <Icon className="size-[18px]" />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-white/70">
                    {description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          © {new Date().getFullYear()} راوا — تمام حقوق محفوظ است
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center bg-background px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex justify-center lg:hidden">
            <BrandLockup />
          </div>

          <header className="space-y-2 text-center lg:text-start">
            <h1 className="text-3xl font-bold text-foreground">خوش آمدید</h1>
            <p className="text-sm text-foreground-muted">
              برای ادامه وارد حساب کاربری خود شوید
            </p>
          </header>

          <LoginForm />
        </div>
      </main>
    </div>
  )
}
