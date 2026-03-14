"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, HTMLSelect, Card } from "@blueprintjs/core"
import { listProjects, getProject, createSandbox } from "@/lib/api"
import type { ProjectListItem, Scenario } from "@shared/types"

export function QuickLaunch() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedScenario, setSelectedScenario] = useState("")
  const [loadingScenarios, setLoadingScenarios] = useState(false)
  const [launching, setLaunching] = useState(false)

  useEffect(() => {
    listProjects().then(setProjects)
  }, [])

  useEffect(() => {
    if (!selectedProject) {
      setScenarios([])
      setSelectedScenario("")
      return
    }
    setLoadingScenarios(true)
    getProject(selectedProject)
      .then((p) => {
        setScenarios(p.scenarios)
        setSelectedScenario(p.scenarios.length > 0 ? p.scenarios[0].id : "")
      })
      .finally(() => setLoadingScenarios(false))
  }, [selectedProject])

  async function handleLaunch() {
    if (!selectedProject || !selectedScenario) return
    setLaunching(true)
    try {
      const sandbox = await createSandbox({
        projectId: selectedProject,
        scenarioId: selectedScenario,
      })
      router.push(`/sandboxes/${sandbox.id}`)
    } catch {
      setLaunching(false)
    }
  }

  return (
    <Card>
      <div className="quick-launch">
        <HTMLSelect
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          fill
        >
          <option value="">Select project...</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </HTMLSelect>

        <HTMLSelect
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value)}
          disabled={!selectedProject || loadingScenarios}
          fill
        >
          <option value="">
            {loadingScenarios
              ? "Loading..."
              : scenarios.length === 0
              ? "No scenarios"
              : "Select scenario..."}
          </option>
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </HTMLSelect>

        <Button
          intent="success"
          icon="rocket-slant"
          loading={launching}
          disabled={!selectedProject || !selectedScenario}
          onClick={handleLaunch}
        >
          Launch
        </Button>
      </div>
    </Card>
  )
}
