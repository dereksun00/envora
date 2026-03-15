"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Alert } from "@blueprintjs/core"
import { updateSandbox, destroySandbox } from "@/lib/api"
import type { SandboxStatus } from "@shared/types"

interface SandboxActionsProps {
  sandboxId: string
  status: SandboxStatus
  url: string | null
  onAction: () => void
  compact?: boolean
}

export function SandboxActions({
  sandboxId,
  status,
  url,
  onAction,
  compact = false,
}: SandboxActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<string | null>(null)

  async function doAction(action: string) {
    setLoading(action)
    try {
      if (action === "destroy") {
        await destroySandbox(sandboxId)
      } else {
        await updateSandbox(sandboxId, { action: action as any })
      }
      onAction()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
      setConfirmAction(null)
    }
  }

  const small = compact
  const minimal = compact

  return (
    <>
      <span className="sandbox-actions">
        {status === "running" && url && (
          <Button
            small={small}
            minimal={minimal}
            icon="share"
            intent="primary"
            onClick={() => router.push(`/sandboxes/${sandboxId}/view`)}
          >
            {!compact && "Open"}
          </Button>
        )}
        {status === "running" && (
          <Button
            small={small}
            minimal={minimal}
            icon="stop"
            loading={loading === "stop"}
            onClick={() => doAction("stop")}
          >
            {!compact && "Stop"}
          </Button>
        )}
        {(status === "stopped" || status === "expired") && (
          <Button
            small={small}
            minimal={minimal}
            icon="play"
            intent="success"
            loading={loading === "start"}
            onClick={() => doAction("start")}
          >
            {!compact && "Start"}
          </Button>
        )}
        {(status === "running" || status === "stopped" || status === "failed") && (
          <Button
            small={small}
            minimal={minimal}
            icon="refresh"
            loading={loading === "reset"}
            onClick={() => doAction("reset")}
          >
            {!compact && "Reset"}
          </Button>
        )}
        {(status === "running" || status === "stopped") && (
          <Button
            small={small}
            minimal={minimal}
            icon="time"
            loading={loading === "extend"}
            onClick={() => doAction("extend")}
          >
            {!compact && "Extend"}
          </Button>
        )}
        {status !== "destroyed" && status !== "provisioning" && (
          <Button
            small={small}
            minimal={minimal}
            icon="trash"
            intent="danger"
            loading={loading === "destroy"}
            onClick={() => setConfirmAction("destroy")}
          >
            {!compact && "Destroy"}
          </Button>
        )}
      </span>

      <Alert
        isOpen={confirmAction === "destroy"}
        onConfirm={() => doAction("destroy")}
        onCancel={() => setConfirmAction(null)}
        intent="danger"
        icon="trash"
        confirmButtonText="Destroy"
        cancelButtonText="Cancel"
      >
        <p>
          This will stop the container and delete the database. This cannot be
          undone.
        </p>
      </Alert>
    </>
  )
}
