import type { Metadata } from "next"

import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "ورود",
  description: "ورود به سامانه مدیریت عملکرد راوا",
}

/**
 * Login — quiet and typographic. One centred column on the app's own warm
 * neutral plane; no imagery, no gradients, no panel. The hierarchy is carried
 * entirely by type, spacing, and hairlines, and the page inherits the
 * light/dark theme like every other screen.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {/* Wordmark — typographic, no emblem. */}
      <header className="px-6 pt-8 sm:px-10">
        <span className="font-display text-lg font-bold tracking-tight">
          راوا<span className="text-foreground-subtle">.</span>
        </span>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-[21rem]">
          <header className="space-y-3">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              ورود به حساب
            </h1>
            <p className="text-sm leading-relaxed text-foreground-muted">
              سامانه مدیریت عملکرد تیم محتوا
            </p>
          </header>

          <div className="mt-10">
            <LoginForm />
          </div>

          <div className="mt-12 border-t border-border-subtle pt-5">
            <p className="text-xs leading-relaxed text-foreground-subtle">
              حساب کاربری توسط مدیر سیستم ساخته می‌شود. برای بازیابی رمز عبور
              با مدیر سامانه تماس بگیرید.
            </p>
          </div>
        </div>
      </main>

      <footer className="px-6 pb-8 sm:px-10">
        <p className="text-2xs text-foreground-subtle">
          © {new Date().getFullYear()} راوا
        </p>
      </footer>
    </div>
  )
}
