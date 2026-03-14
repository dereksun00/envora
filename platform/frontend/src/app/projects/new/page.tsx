"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { createProject } from "@/lib/api"
import type { SchemaFormat } from "@shared/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function CreateProjectPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [dockerImage, setDockerImage] = useState("")
  const [schema, setSchema] = useState("")
  const [schemaFormat, setSchemaFormat] = useState<SchemaFormat>("prisma")
  const [appPort, setAppPort] = useState(3000)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const project = await createProject({ name, dockerImage, schema, schemaFormat, appPort })
      router.push(`/projects/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 className="text-2xl font-semibold mb-8">New Project</h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My CRM Demo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dockerImage">Docker image</Label>
              <Input
                id="dockerImage"
                value={dockerImage}
                onChange={(e) => setDockerImage(e.target.value)}
                placeholder="yourname/demo-crm:latest"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="schema">Schema</Label>
                <div className="flex rounded-md overflow-hidden border border-input">
                  <button
                    type="button"
                    onClick={() => setSchemaFormat("prisma")}
                    className={`px-3 py-1 text-xs transition-colors ${
                      schemaFormat === "prisma"
                        ? "bg-primary text-primary-foreground"
                        : "bg-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Prisma
                  </button>
                  <button
                    type="button"
                    onClick={() => setSchemaFormat("sql")}
                    className={`px-3 py-1 text-xs transition-colors border-l border-input ${
                      schemaFormat === "sql"
                        ? "bg-primary text-primary-foreground"
                        : "bg-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    SQL
                  </button>
                </div>
              </div>
              <Textarea
                id="schema"
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                placeholder={schemaFormat === "prisma" ? "model User {\n  id Int @id @default(autoincrement())\n  ...\n}" : "CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  ...\n);"}
                className="font-mono text-xs"
                rows={16}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appPort">App port</Label>
              <Input
                id="appPort"
                type="number"
                value={appPort}
                onChange={(e) => setAppPort(Number(e.target.value))}
                min={1}
                max={65535}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
