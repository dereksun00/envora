"use client"

import { useEffect, useState } from "react"
import { Spinner } from "@blueprintjs/core"
import { getOverview } from "@/lib/api"
import { StatCard } from "@/components/stat-card"
import { QuickLaunch } from "@/components/quick-launch"
import { SandboxTable } from "@/components/sandbox-table"
import type { OverviewStats } from "@shared/types"

export default function OverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  function load() {
    getOverview().then(setStats).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <Spinner size={30} />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="page-container">
      <h1 className="page-title mb-24">Overview</h1>

      {/* Stat cards */}
      <div className="stat-grid mb-24">
        <StatCard icon="projects" value={stats.projectCount} label="Projects" intent="primary" />
        <StatCard icon="lightbulb" value={stats.scenarioCount} label="Scenarios" intent="primary" />
        <StatCard icon="play" value={stats.activeSandboxCount} label="Active Sandboxes" intent="success" />
        <StatCard icon="error" value={stats.failedSandboxCount} label="Failed" intent="danger" />
      </div>

      {/* Quick Launch */}
      <div className="mb-24">
        <h3 className="section-heading">Quick Launch</h3>
        <QuickLaunch />
      </div>

      {/* Recent Sandboxes */}
      <div>
        <h3 className="section-heading">Recent Sandboxes</h3>
        <SandboxTable
          sandboxes={stats.recentSandboxes}
          onRefresh={load}
          showProject
          showScenario
          emptyMessage="No sandboxes yet. Launch one above!"
        />
      </div>
    </div>
  )
}
