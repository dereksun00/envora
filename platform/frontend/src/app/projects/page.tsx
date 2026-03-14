"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Icon, NonIdealState, Tag, Spinner } from "@blueprintjs/core"
import { listProjects } from "@/lib/api"
import type { ProjectListItem } from "@shared/types"

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listProjects().then(setProjects).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <Spinner size={30} />
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Button intent="primary" icon="plus" onClick={() => router.push("/projects/new")}>
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="empty-card">
          <NonIdealState
            icon="projects"
            title="No projects yet"
            description="Create your first project to get started."
            action={
              <Button intent="primary" icon="plus" onClick={() => router.push("/projects/new")}>
                New Project
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="card-grid">
          {projects.map((project) => (
            <Card
              key={project.id}
              interactive
              className="project-card"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <div className="project-card-title">
                <Icon icon="cube" size={16} />
                {project.name}
              </div>
              <div className="project-card-meta mb-8">{project.dockerImage}</div>
              <div className="project-card-tags">
                <Tag minimal round icon="lightbulb">
                  {project._count.scenarios} scenario{project._count.scenarios !== 1 ? "s" : ""}
                </Tag>
                {project.activeSandboxCount > 0 && (
                  <Tag minimal round intent="success" icon="play">
                    {project.activeSandboxCount} active
                  </Tag>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
