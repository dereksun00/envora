"use client"

import { useRouter } from "next/navigation"
import { HTMLTable, NonIdealState, Card } from "@blueprintjs/core"
import { SandboxStatusBadge } from "./sandbox-status-badge"
import { SandboxActions } from "./sandbox-actions"
import type { Sandbox, SandboxWithContext } from "@shared/types"

interface SandboxTableProps {
  sandboxes: (Sandbox | SandboxWithContext)[]
  onRefresh: () => void
  showProject?: boolean
  showScenario?: boolean
  emptyMessage?: string
}

function isWithContext(sb: Sandbox | SandboxWithContext): sb is SandboxWithContext {
  return "projectName" in sb
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function expiresIn(date: string): string {
  const diff = new Date(date).getTime() - Date.now()
  if (diff <= 0) return "expired"
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m`
}

export function SandboxTable({
  sandboxes,
  onRefresh,
  showProject = false,
  showScenario = false,
  emptyMessage = "No sandboxes yet",
}: SandboxTableProps) {
  const router = useRouter()

  if (sandboxes.length === 0) {
    return (
      <Card className="empty-card">
        <NonIdealState icon="cube" title={emptyMessage} />
      </Card>
    )
  }

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <HTMLTable className="sandbox-html-table" striped interactive>
        <thead>
          <tr>
            <th>Status</th>
            <th>ID</th>
            {showProject && <th>Project</th>}
            {showScenario && <th>Scenario</th>}
            <th>Created</th>
            <th>Expires</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sandboxes.map((sb) => (
            <tr key={sb.id}>
              <td>
                <SandboxStatusBadge status={sb.status} />
              </td>
              <td>
                <span
                  className="sandbox-id"
                  onClick={() => router.push(`/sandboxes/${sb.id}`)}
                >
                  {sb.id.slice(0, 12)}
                </span>
              </td>
              {showProject && (
                <td>{isWithContext(sb) ? sb.projectName : "—"}</td>
              )}
              {showScenario && (
                <td>{isWithContext(sb) ? sb.scenarioName : "—"}</td>
              )}
              <td className="sandbox-time">{timeAgo(sb.createdAt)}</td>
              <td className="sandbox-time">{expiresIn(sb.expiresAt)}</td>
              <td style={{ textAlign: "right" }}>
                <SandboxActions
                  sandboxId={sb.id}
                  status={sb.status}
                  url={sb.url}
                  onAction={onRefresh}
                  compact
                />
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    </Card>
  )
}
