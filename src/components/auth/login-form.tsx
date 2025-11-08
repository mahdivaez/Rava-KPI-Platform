"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

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
        <Label htmlFor="email" className="text-white text-sm font-medium">
          ایمیل
        </Label>
        <div className="relative">
          <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@kpi.com"
            required
            disabled={isLoading}
            className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:bg-white/20 focus:border-purple-400 h-12 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white text-sm font-medium">
          رمز عبور
        </Label>
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            disabled={isLoading}
            className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:bg-white/20 focus:border-purple-400 h-12 rounded-xl"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/75 transition-all duration-300 transform hover:scale-105"
      >
        {isLoading ? (
          <>
            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
            در حال ورود...
          </>
        ) : (
          <>
            <ArrowRight className="ml-2 h-5 w-5" />
            ورود به سیستم
          </>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-transparent px-2 text-purple-200">
            ورود امن با رمزنگاری
          </span>
        </div>
      </div>
    </form>
  )
}
