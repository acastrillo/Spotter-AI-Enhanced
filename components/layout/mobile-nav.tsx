
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Grid3X3, 
  Calendar, 
  BarChart3, 
  MessageCircle
} from "lucide-react"

export function MobileNav() {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/", icon: Grid3X3 },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Profile", href: "/profile", icon: MessageCircle },
  ]

  return (
    <nav className="bottom-nav h-20 border-t border-border md:hidden">
      <div className="flex items-center justify-around h-full">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "nav-item transition-all duration-200",
                isActive ? "active" : ""
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
