"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button, Icon } from "@blueprintjs/core"
import { useTheme } from "./theme-provider"

const navItems = [
  { href: "/", label: "Overview", icon: "dashboard" as const },
  { href: "/projects", label: "Projects", icon: "projects" as const },
  { href: "/sandboxes", label: "Sandboxes", icon: "cube" as const },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <div className="app-sidebar">
      <div className="app-sidebar-brand">
        <Icon icon="cube" size={18} style={{ color: "#2d72d2" }} />
        <span>Envora</span>
      </div>
      <nav className="app-sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`nav-link${isActive(item.href) ? " active" : ""}`}
          >
            <Icon icon={item.icon} size={16} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="app-sidebar-footer">
        <Button
          minimal
          fill
          icon={theme === "dark" ? "flash" : "moon"}
          onClick={toggle}
          alignText="left"
          text={theme === "dark" ? "Light mode" : "Dark mode"}
        />
      </div>
    </div>
  )
}
