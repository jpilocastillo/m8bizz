"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell, HelpCircle, Menu, MessageSquare, Moon, Sun } from "lucide-react"
import Image from "next/image"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MainNav } from "@/components/main-nav"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function DashboardHeader() {
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-m8bs-border bg-gradient-to-r from-m8bs-card to-m8bs-card-alt px-4 md:px-6 shadow-lg backdrop-blur-sm">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <div className="flex items-center gap-2 pb-4 pt-2">
            <Image src="/motiv8-logo.png" alt="Motiv8 Advisors" width={40} height={40} className="h-10 w-10" />
            <span className="text-lg font-bold">Motiv8 Advisors</span>
          </div>
          <MainNav className="flex flex-col space-y-1" />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <Image
          src="/motiv8-logo.png"
          alt="Motiv8 Advisors"
          width={40}
          height={40}
          className="h-10 w-10 hidden md:block"
        />
        <span className="text-lg font-bold hidden md:block">Motiv8 Advisors</span>
      </div>

      <MainNav className="hidden md:flex mx-6" />

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg text-m8bs-muted hover:text-m8bs-blue hover:bg-m8bs-card-alt transition-all duration-200">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-gradient-to-r from-m8bs-pink to-m8bs-purple text-white border-2 border-m8bs-card">
            3
          </Badge>
          <span className="sr-only">Notifications</span>
        </Button>

        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-m8bs-muted hover:text-m8bs-blue hover:bg-m8bs-card-alt transition-all duration-200">
          <MessageSquare className="h-5 w-5" />
          <span className="sr-only">Messages</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 rounded-lg text-m8bs-muted hover:text-m8bs-blue hover:bg-m8bs-card-alt transition-all duration-200"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>

        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-m8bs-muted hover:text-m8bs-blue hover:bg-m8bs-card-alt transition-all duration-200">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
