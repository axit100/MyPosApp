"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Users as UsersIcon,
  Table,
  BarChart3,
  Settings,
  ChefHat
} from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { name: "Tables", href: "/dashboard/tables", icon: Table },
  { name: "Menu", href: "/dashboard/menu", icon: UtensilsCrossed },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Users", href: "/dashboard/users", icon: UsersIcon },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r shadow-sm">
      {/* Logo/Brand */}
      <div className="h-16 flex items-center justify-center font-bold border-b bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <ChefHat className="w-6 h-6 mr-2" />
        Dhabha POS
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange-100 text-orange-700 border-r-2 border-orange-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="mt-8 mx-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Today&apos;s Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Orders:</span>
            <span className="font-medium text-gray-900">45</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Revenue:</span>
            <span className="font-medium text-gray-900">₹15,420</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tables:</span>
            <span className="font-medium text-gray-900">2/6 occupied</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
