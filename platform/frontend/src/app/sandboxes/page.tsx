"use client"

import { useEffect, useState } from "react"
import { Spinner, HTMLSelect } from "@blueprintjs/core"
import { listSandboxes } from "@/lib/api"
import { SandboxTable } from "@/components/sandbox-table"
import type { SandboxWithContext, SandboxStatus } from "@shared/types"

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "running", label: "Running" },
  { value: "provisioning", label: "Provisioning" },
  { value: "stopped", label: "Stopped" },
  { value: "failed", label: "Failed" },
  { value: "expired", label: "Expired" },
  { value: "destroyed", label: "Destroyed" },
]

export default function SandboxesPage() {
  const [sandboxes, setSandboxes] = useState<SandboxWithContext[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")

  function load() {
    const query = statusFilter ? { status: statusFilter as SandboxStatus } : undefined
    listSandboxes(query).then(setSandboxes).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusFilter])

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sandboxes</h1>
          <p className="page-subtitle">{sandboxes.length} sandbox{sandboxes.length !== 1 ? "es" : ""}</p>
        </div>
        <HTMLSelect
          value={statusFilter}
          onChange={(e) => {
            setLoading(true)
            setStatusFilter(e.target.value)
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </HTMLSelect>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <Spinner size={30} />
        </div>
      ) : (
        <SandboxTable
          sandboxes={sandboxes}
          onRefresh={load}
          showProject
          showScenario
          emptyMessage="No sandboxes found"
        />
      )}
    </div>
  )
}
