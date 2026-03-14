"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Box, Layers } from "lucide-react"
import { listProjects } from "@/lib/api"
import type { Project } from "@shared/types"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => router.push("/projects/new")}>
          <Plus size={16} />
          New Project
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Layers size={40} className="text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">No projects yet</h2>
          <p className="text-sm text-muted-foreground mb-6">Create your first project to start provisioning sandboxes.</p>
          <Button onClick={() => router.push("/projects/new")}>
            <Plus size={16} />
            New Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Box size={16} className="text-muted-foreground shrink-0" />
                  {project.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground truncate">{project.dockerImage}</p>
                <p className="text-xs text-muted-foreground mt-2">Port {project.appPort}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
