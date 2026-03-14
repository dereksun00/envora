"use client"

import { Tag, Spinner } from "@blueprintjs/core"
import type { SandboxStatus } from "@shared/types"

const statusConfig: Record<
  SandboxStatus,
  { intent: "success" | "warning" | "danger" | "none" | "primary"; label: string }
> = {
  running: { intent: "success", label: "Running" },
  provisioning: { intent: "warning", label: "Provisioning" },
  stopped: { intent: "none", label: "Stopped" },
  failed: { intent: "danger", label: "Failed" },
  expired: { intent: "warning", label: "Expired" },
  destroyed: { intent: "none", label: "Destroyed" },
}

export function SandboxStatusBadge({ status }: { status: SandboxStatus }) {
  const config = statusConfig[status] || { intent: "none" as const, label: status }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {status === "provisioning" && <Spinner size={12} />}
      <Tag intent={config.intent} minimal round>
        {config.label}
      </Tag>
    </span>
  )
}
