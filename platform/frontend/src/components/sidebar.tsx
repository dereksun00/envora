"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Box } from "lucide-react"
import { clsx } from "clsx"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/", label: "Projects", icon: Box },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-60 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center border-b border-border px-5">
        <span className="text-base font-semibold tracking-tight">Envora</span>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
