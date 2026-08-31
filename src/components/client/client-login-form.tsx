"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Sign-in for brand contacts.
 *
 * Posts to the `client-credentials` provider, which only ever looks at
 * `ClientAccount`, so a team member's password will not open this door.
 */
export function ClientLoginForm() {
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
      const result = await signIn("client-credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("ورود ناموفق", {
          description: "ایمیل یا رمز عبور درست نیست.",
        })
      } else {
        router.push("/client")
        router.refresh()
      }
    } catch {
      toast.error("خطا", { description: "مشکلی پیش آمده است" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="client-email">ایمیل</Label>
        <Input
          id="client-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          placeholder="name@company.com"
          dir="ltr"
          className="text-start"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="client-password">رمز عبور</Label>
        <div className="relative">
          <Input
            id="client-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={isLoading}
            className="pe-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 end-0 grid w-11 cursor-pointer place-items-center rounded-e-lg text-foreground-subtle transition-colors duration-fast hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {showPassword ? (
              <EyeOff className="size-[18px]" aria-hidden />
            ) : (
              <Eye className="size-[18px]" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        loading={isLoading}
        className="w-full bg-sand-950 text-sand-50 hover:bg-sand-800 dark:bg-sand-50 dark:text-sand-950 dark:hover:bg-sand-200"
      >
        {isLoading ? "در حال ورود…" : "ورود"}
      </Button>
    </form>
  )
}
