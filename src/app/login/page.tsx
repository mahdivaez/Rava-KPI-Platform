import type { Metadata } from "next"

import { LoginExperience } from "@/components/auth/login-experience"

export const metadata: Metadata = {
  title: "ورود",
  description: "ورود به سامانه مدیریت عملکرد راوا",
}

export default function LoginPage() {
  return <LoginExperience />
}
