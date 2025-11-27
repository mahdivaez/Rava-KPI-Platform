"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff } from "lucide-react"

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
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#6b5d54] text-sm font-medium">
          ایمیل
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="نام@example.com"
          required
          disabled={isLoading}
          className="h-11 sm:h-12 text-sm sm:text-base bg-white/80 border-[#d4c5b9] text-[#3d3530] placeholder:text-[#b5a59a] focus:bg-white focus:border-[#9b8b7e] focus:ring-2 focus:ring-[#d4c5b9]/50 rounded-xl transition-all"
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-[#6b5d54] text-sm font-medium">
          رمز عبور
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="رمز عبور خود را وارد کنید"
            required
            disabled={isLoading}
            className="h-11 sm:h-12 text-sm sm:text-base bg-white/80 border-[#d4c5b9] text-[#3d3530] placeholder:text-[#b5a59a] focus:bg-white focus:border-[#9b8b7e] focus:ring-2 focus:ring-[#d4c5b9]/50 rounded-xl pr-4 pl-12 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#b5a59a] hover:text-[#6b5d54] transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Remember & Forgot */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded border-[#d4c5b9] text-[#9b8b7e] focus:ring-[#d4c5b9]" 
          />
          <span className="text-xs sm:text-sm text-[#8a7a6f]">مرا به خاطر بسپار</span>
        </label>
        <a href="#" className="text-xs sm:text-sm text-[#9b8b7e] hover:text-[#6b5d54] font-medium transition-colors">
          فراموشی رمز عبور؟
        </a>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 sm:h-12 text-sm sm:text-base bg-[#9b8b7e] hover:bg-[#8a7a6f] text-white font-medium rounded-xl shadow-lg shadow-[#9b8b7e]/20 hover:shadow-[#9b8b7e]/30 transition-all duration-300"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            <span>در حال ورود...</span>
          </div>
        ) : (
          <span>ورود به سیستم</span>
        )}
      </Button>
    </form>
  )
}
