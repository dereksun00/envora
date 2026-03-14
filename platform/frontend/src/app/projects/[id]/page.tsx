"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Button,
  Card,
  Icon,
  Spinner,
  NonIdealState,
} from "@blueprintjs/core"
import { getProject, createSandbox, deleteScenario, duplicateScenario, deleteProject } from "@/lib/api"
import { ScenarioCard } from "@/components/scenario-card"
import { CreateScenarioDialog } from "@/components/create-scenario-dialog"
import { SandboxTable } from "@/components/sandbox-table"
import type { ProjectWithDetails, Scenario } from "@shared/types"

function SchemaPanel({ schema }: { schema: string }) {
  const [expanded, setExpanded] = useState(false)
  const lines = schema.split("\n")
  const preview = lines.slice(0, 12).join("\n")
  const hasMore = lines.length > 12

  return (
    <div className="schema-block">
      <pre>{expanded ? schema : preview}</pre>
      {hasMore && (
        <button className="schema-toggle" onClick={() => setExpanded(!expanded)}>
          <Icon icon={expanded ? "chevron-up" : "chevron-down"} size={12} />
          {expanded ? "Show less" : `Show ${lines.length - 12} more lines`}
        </button>
      )}
    </div>
  )
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [project, setProject] = useState<ProjectWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [launchingScenario, setLaunchingScenario] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editScenario, setEditScenario] = useState<Scenario | null>(null)
  const [deletingProject, setDeletingProject] = useState(false)

  function load() {
    getProject(params.id).then(setProject).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [params.id])

  async function handleLaunch(scenarioId: string) {
    setLaunchingScenario(scenarioId)
    try {
      const sandbox = await createSandbox({ projectId: params.id, scenarioId })
      router.push(`/sandboxes/${sandbox.id}`)
    } catch {
      setLaunchingScenario(null)
    }
  }

  async function handleDelete(scenarioId: string) {
    await deleteScenario(params.id, scenarioId)
    load()
  }

  async function handleDuplicate(scenarioId: string) {
    await duplicateScenario(params.id, scenarioId)
    load()
  }

  function handleEdit(scenario: Scenario) {
    setEditScenario(scenario)
    setDialogOpen(true)
  }

  async function handleDeleteProject() {
    if (!confirm(`Delete project "${project?.name}"? This cannot be undone.`)) return
    setDeletingProject(true)
    try {
      await deleteProject(params.id)
      router.push("/projects")
    } finally {
      setDeletingProject(false)
    }
  }

  function handleNewScenario() {
    setEditScenario(null)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <Spinner size={30} />
      </div>
    )
  }

  if (!project) return <NonIdealState icon="search" title="Project not found" />

  return (
    <div className="page-container">
      <button className="back-link" onClick={() => router.push("/projects")}>
        <Icon icon="arrow-left" size={14} /> Projects
      </button>

      <div className="page-header">
        <div>
          <h1 className="page-title">{project.name}</h1>
          <p className="page-subtitle" style={{ fontFamily: "monospace" }}>
            {project.dockerImage} &middot; port {project.appPort}
          </p>
        </div>
        <Button
          intent="danger"
          icon="trash"
          minimal
          loading={deletingProject}
          onClick={handleDeleteProject}
        >
          Delete Project
        </Button>
      </div>

      {/* Schema */}
      <div className="mb-24">
        <h3 className="section-heading">
          Schema ({project.schemaFormat})
        </h3>
        <SchemaPanel schema={project.schema} />
      </div>

      {/* Scenarios */}
      <div className="mb-24">
        <div className="page-header">
          <h3 className="section-heading" style={{ marginBottom: 0 }}>Scenarios</h3>
          <Button small intent="primary" icon="plus" onClick={handleNewScenario}>
            New Scenario
          </Button>
        </div>

        {project.scenarios.length === 0 ? (
          <Card className="empty-card">
            <NonIdealState
              icon="lightbulb"
              title="No scenarios yet"
              description="Create a scenario to define what data the AI should generate."
              action={
                <Button small intent="primary" icon="plus" onClick={handleNewScenario}>
                  New Scenario
                </Button>
              }
            />
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {project.scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onLaunch={handleLaunch}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                launching={launchingScenario === scenario.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sandboxes */}
      {project.sandboxes.length > 0 && (
        <div>
          <h3 className="section-heading">Sandboxes</h3>
          <SandboxTable
            sandboxes={project.sandboxes}
            onRefresh={load}
            emptyMessage="No sandboxes for this project"
          />
        </div>
      )}

      {/* Create/Edit Scenario Dialog */}
      <CreateScenarioDialog
        projectId={params.id}
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditScenario(null)
        }}
        onCreated={load}
        editScenario={editScenario}
      />
    </div>
  )
}
