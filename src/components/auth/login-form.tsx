"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

/**
 * Login form — minimal and token-driven so it follows the app theme.
 * Fields are quiet by default and only speak on focus: the border darkens,
 * nothing glows, nothing moves.
 */

const fieldClass =
  "h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm text-foreground " +
  "placeholder:text-foreground-subtle outline-none transition-colors duration-fast " +
  "hover:border-border-strong focus:border-foreground " +
  "disabled:cursor-not-allowed disabled:opacity-50"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("خطای ورود", {
          description: result.error,
        })
      } else {
        toast.success("ورود موفق", {
          description: "به سیستم خوش آمدید",
        })
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      toast.error("خطا", {
        description: "مشکلی پیش آمده است",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground-secondary"
        >
          ایمیل
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          // Lets the password manager fill both fields.
          autoComplete="username"
          placeholder="name@company.com"
          dir="ltr"
          required
          disabled={isLoading}
          className={`${fieldClass} text-start`}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground-secondary"
        >
          رمز عبور
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={isLoading}
            className={`${fieldClass} pe-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 end-0 grid w-11 cursor-pointer place-items-center text-foreground-subtle transition-colors duration-fast hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-semibold text-background transition-opacity duration-fast hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:opacity-80 disabled:pointer-events-none disabled:opacity-50"
      >
        {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {isLoading ? "در حال ورود…" : "ورود"}
      </button>
    </form>
  )
}
