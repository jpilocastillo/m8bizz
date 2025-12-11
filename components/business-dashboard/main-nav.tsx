import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Calendar, FileText, LayoutDashboard, Users } from "lucide-react"

interface MainNavProps {
  className?: string
}

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname()
  
  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Clients",
      href: "/clients",
      icon: Users,
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: Calendar,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
  ]

  return (
    <nav className={cn("flex items-center space-x-2 lg:space-x-3", className)}>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 group",
              isActive
                ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                : "text-m8bs-muted hover:text-white hover:bg-m8bs-card-alt hover:shadow-md",
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
