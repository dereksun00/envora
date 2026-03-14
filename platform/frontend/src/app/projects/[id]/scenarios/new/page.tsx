"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, X } from "lucide-react"
import { createScenario } from "@/lib/api"
import type { DemoUser } from "@shared/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function CreateScenarioPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [prompt, setPrompt] = useState("")
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addUser() {
    setDemoUsers([...demoUsers, { name: "", email: "", role: "" }])
  }

  function removeUser(index: number) {
    setDemoUsers(demoUsers.filter((_, i) => i !== index))
  }

  function updateUser(index: number, field: keyof DemoUser, value: string) {
    setDemoUsers(demoUsers.map((u, i) => i === index ? { ...u, [field]: value } : u))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await createScenario(params.id, { name, prompt, demoUsers: demoUsers.filter(u => u.name || u.email) })
      router.push(`/projects/${params.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create scenario")
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

      <h1 className="text-2xl font-semibold mb-8">New Scenario</h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Scenario name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Q4 Sales Demo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Data generation prompt</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Generate a realistic CRM database for a mid-size B2B SaaS company with 50 contacts, 20 deals in various pipeline stages, and 3 months of activity history..."
                rows={8}
                required
              />
              <p className="text-xs text-muted-foreground">Describe the data you want AI to generate for this sandbox.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Demo users</Label>
                <Button type="button" variant="outline" size="sm" onClick={addUser}>
                  <Plus size={14} />
                  Add User
                </Button>
              </div>

              {demoUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No demo users. Add users to pre-create login accounts in the sandbox.</p>
              ) : (
                <div className="space-y-2">
                  {demoUsers.map((user, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={user.name}
                        onChange={(e) => updateUser(index, "name", e.target.value)}
                        placeholder="Name"
                        className="flex-1"
                      />
                      <Input
                        value={user.email}
                        onChange={(e) => updateUser(index, "email", e.target.value)}
                        placeholder="email@example.com"
                        type="email"
                        className="flex-1"
                      />
                      <Input
                        value={user.role}
                        onChange={(e) => updateUser(index, "role", e.target.value)}
                        placeholder="Role"
                        className="w-28"
                      />
                      <button
                        type="button"
                        onClick={() => removeUser(index)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                {submitting ? "Creating..." : "Create Scenario"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
