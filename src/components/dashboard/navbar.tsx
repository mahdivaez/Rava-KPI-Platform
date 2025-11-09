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
import { LogOut, User, Bell, Settings, Search } from "lucide-react"

export async function Navbar() {
  const session = await auth()
  if (!session) return null

  const initials = session.user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')

  return (
    <header className="h-18 bg-white border-b border-nude-200 flex items-center justify-between px-8">
      {/* Left Section - Welcome */}
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-nude-900">
            خوش آمدید، {session.user.name?.split(' ')[0]}
          </h2>
          <p className="text-sm text-nude-500 mt-0.5">
            {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search Button */}
        <Button 
          variant="ghost" 
          size="icon"
          className="hover:bg-nude-50 rounded-xl w-10 h-10 text-nude-600 hover:text-nude-900"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon"
          className="relative hover:bg-nude-50 rounded-xl w-10 h-10 text-nude-600 hover:text-nude-900"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-nude-500 rounded-full ring-2 ring-white"></span>
        </Button>

        {/* Settings */}
        <Button 
          variant="ghost" 
          size="icon"
          className="hover:bg-nude-50 rounded-xl w-10 h-10 text-nude-600 hover:text-nude-900"
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* Divider */}
        <div className="h-8 w-px bg-nude-200 mx-2"></div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-3 hover:bg-nude-50 rounded-xl px-3 h-12"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-nude-900">{session.user.name}</p>
                <p className="text-xs text-nude-500">
                  {session.user.isAdmin ? 'مدیر سیستم' : 
                   session.user.isTechnicalDeputy ? 'معاون فنی' : 'کاربر'}
                </p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-nude-200 shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-nude-400 to-nude-600 text-white font-semibold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-lg border-nude-200">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1 py-2">
                <p className="text-sm font-semibold text-nude-900">{session.user.name}</p>
                <p className="text-xs text-nude-500">{session.user.email}</p>
                {session.user.isAdmin && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-nude-100 text-nude-700 w-fit mt-1">
                    مدیر سیستم
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-nude-200" />
            <DropdownMenuItem className="cursor-pointer rounded-lg text-nude-700 hover:text-nude-900 hover:bg-nude-50">
              <User className="ml-2 h-4 w-4" />
              <span>پروفایل من</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-lg text-nude-700 hover:text-nude-900 hover:bg-nude-50">
              <Settings className="ml-2 h-4 w-4" />
              <span>تنظیمات</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-nude-200" />
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/login" })
              }}
            >
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full flex items-center text-destructive cursor-pointer rounded-lg hover:bg-red-50">
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>خروج از حساب</span>
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
