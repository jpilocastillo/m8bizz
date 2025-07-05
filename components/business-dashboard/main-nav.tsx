import Link from "next/link"
import { cn } from "@/lib/utils"
import { BarChart3, Calendar, FileText, LayoutDashboard, Users } from "lucide-react"

interface MainNavProps {
  className?: string
}

export function MainNav({ className }: MainNavProps) {
  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
      active: true,
    },
    {
      name: "Clients",
      href: "/clients",
      icon: <Users className="h-4 w-4 mr-2" />,
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: <Calendar className="h-4 w-4 mr-2" />,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: <FileText className="h-4 w-4 mr-2" />,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="h-4 w-4 mr-2" />,
    },
  ]

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            item.active ? "text-primary" : "text-muted-foreground",
          )}
        >
          {item.icon}
          {item.name}
        </Link>
      ))}
    </nav>
  )
}
