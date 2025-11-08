import { auth, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User, Bell } from "lucide-react"

export async function Navbar() {
  const session = await auth()
  if (!session) return null

  const initials = session.user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
      {/* Search or breadcrumb could go here */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30"></div>
          <h2 className="relative text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            خوش آمدید
          </h2>
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon"
          className="relative hover:bg-purple-50 rounded-full w-11 h-11"
        >
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-3 hover:bg-purple-50 rounded-xl px-4 h-12"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{session.user.name}</p>
                <p className="text-xs text-slate-500">
                  {session.user.isAdmin ? 'مدیر سیستم' : 'کاربر'}
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-sm"></div>
                <Avatar className="relative h-10 w-10 border-2 border-white shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-2xl border-slate-200">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-slate-900">{session.user.name}</p>
                <p className="text-xs text-slate-500">{session.user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer rounded-lg">
              <User className="ml-2 h-4 w-4" />
              پروفایل
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/login" })
              }}
            >
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full flex items-center text-red-600 cursor-pointer rounded-lg">
                  <LogOut className="ml-2 h-4 w-4" />
                  خروج از حساب
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
