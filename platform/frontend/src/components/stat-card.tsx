"use client"

import { Card, Icon } from "@blueprintjs/core"

interface StatCardProps {
  icon: string
  value: number
  label: string
  intent?: "primary" | "success" | "warning" | "danger"
}

export function StatCard({ icon, value, label, intent }: StatCardProps) {
  const intentColors: Record<string, string> = {
    primary: "#2d72d2",
    success: "#238551",
    warning: "#c87619",
    danger: "#cd4246",
  }
  const color = intent ? intentColors[intent] : undefined

  return (
    <Card className="stat-card">
      <div className="stat-card-icon" style={color ? { color } : undefined}>
        <Icon icon={icon as any} size={20} />
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </Card>
  )
}
