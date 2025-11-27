'use client'

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
import { LogOut, User, Bell, Settings, Search, Menu } from "lucide-react"
import { formatPersianDateWithWeekday } from "@/lib/utils"

interface NavbarContentProps {
  session: any
  onMenuClick?: () => void
  signOutAction: () => Promise<void>
}

export function NavbarContent({ session, onMenuClick, signOutAction }: NavbarContentProps) {
  const initials = session.user.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')

  return (
    <header className="h-16 sm:h-18 bg-white border-b border-nude-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left Section - Welcome */}
      <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
        {/* Hamburger Menu Button - Mobile Only */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-nude-50 rounded-xl w-10 h-10 text-nude-600 hover:text-nude-900"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-nude-900 truncate">
            خوش آمدید، {session.user.name?.split(' ')[0]}
          </h2>
          <p className="text-xs sm:text-sm text-nude-500 mt-0.5 hidden sm:block">
            {formatPersianDateWithWeekday(new Date())}
          </p>
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
        {/* Search Button - Hidden on small mobile */}
        <Button 
          variant="ghost" 
          size="icon"
          className="hidden sm:flex hover:bg-nude-50 rounded-xl w-9 h-9 sm:w-10 sm:h-10 text-nude-600 hover:text-nude-900"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon"
          className="relative hover:bg-nude-50 rounded-xl w-9 h-9 sm:w-10 sm:h-10 text-nude-600 hover:text-nude-900"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-2 h-2 bg-nude-500 rounded-full ring-2 ring-white"></span>
        </Button>

        {/* Settings - Hidden on small mobile */}
        <Button 
          variant="ghost" 
          size="icon"
          className="hidden sm:flex hover:bg-nude-50 rounded-xl w-9 h-9 sm:w-10 sm:h-10 text-nude-600 hover:text-nude-900"
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {/* Divider */}
        <div className="h-6 sm:h-8 w-px bg-nude-200 mx-1 sm:mx-2"></div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 sm:gap-3 hover:bg-nude-50 rounded-xl px-2 sm:px-3 h-10 sm:h-12"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-nude-900">{session.user.name}</p>
                <p className="text-xs text-nude-500">
                  {session.user.isAdmin ? 'مدیر سیستم' : 
                   session.user.isTechnicalDeputy ? 'معاون فنی' : 'کاربر'}
                </p>
              </div>
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 border-2 border-nude-200 shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-nude-400 to-nude-600 text-white font-semibold text-xs sm:text-sm">
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
            <DropdownMenuItem asChild>
              <button 
                onClick={() => signOutAction()} 
                className="w-full flex items-center text-destructive cursor-pointer rounded-lg hover:bg-red-50"
              >
                <LogOut className="ml-2 h-4 w-4" />
                <span>خروج از حساب</span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

// Server Component Wrapper
import { auth } from "@/lib/auth"
import { handleSignOut } from "@/app/actions/auth"

export async function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const session = await auth()
  if (!session) return null

  return <NavbarContent session={session} onMenuClick={onMenuClick} signOutAction={handleSignOut} />
}
