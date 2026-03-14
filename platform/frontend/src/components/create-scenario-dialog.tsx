"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  Button,
  FormGroup,
  InputGroup,
  TextArea,
  Callout,
  Icon,
} from "@blueprintjs/core"
import { createScenario, updateScenario } from "@/lib/api"
import type { Scenario, DemoUser } from "@shared/types"

interface CreateScenarioDialogProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
  editScenario?: Scenario | null
}

export function CreateScenarioDialog({
  projectId,
  isOpen,
  onClose,
  onCreated,
  editScenario,
}: CreateScenarioDialogProps) {
  const [name, setName] = useState("")
  const [prompt, setPrompt] = useState("")
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!editScenario

  useEffect(() => {
    if (editScenario) {
      setName(editScenario.name)
      setPrompt(editScenario.prompt)
      setDemoUsers(editScenario.demoUsers || [])
    } else {
      setName("")
      setPrompt("")
      setDemoUsers([])
    }
    setError(null)
  }, [editScenario, isOpen])

  function addUser() {
    setDemoUsers([...demoUsers, { name: "", email: "", role: "" }])
  }

  function removeUser(index: number) {
    setDemoUsers(demoUsers.filter((_, i) => i !== index))
  }

  function updateUser(index: number, field: keyof DemoUser, value: string) {
    setDemoUsers(
      demoUsers.map((u, i) => (i === index ? { ...u, [field]: value } : u))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const filtered = demoUsers.filter((u) => u.name || u.email)
      if (isEdit && editScenario) {
        await updateScenario(projectId, editScenario.id, {
          name,
          prompt,
          demoUsers: filtered,
        })
      } else {
        await createScenario(projectId, {
          name,
          prompt,
          demoUsers: filtered,
        })
      }
      onCreated()
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save scenario"
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Scenario" : "New Scenario"}
      icon={isEdit ? "edit" : "plus"}
      style={{ width: 560 }}
    >
      <form onSubmit={handleSubmit}>
        <div className="bp5-dialog-body">
          <FormGroup label="Scenario name" labelFor="scenario-name">
            <InputGroup
              id="scenario-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Q4 Sales Demo"
              required
            />
          </FormGroup>

          <FormGroup
            label="Data generation prompt"
            labelFor="scenario-prompt"
            helperText="Describe the data you want AI to generate."
          >
            <TextArea
              id="scenario-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Generate a realistic CRM database for a mid-size B2B SaaS company..."
              rows={5}
              fill
              growVertically={false}
              required
            />
          </FormGroup>

          <FormGroup label="Demo users">
            {demoUsers.length === 0 && (
              <p style={{ fontSize: 13, opacity: 0.5, marginBottom: 12 }}>
                No demo users. Add users to pre-create login accounts.
              </p>
            )}
            {demoUsers.map((user, index) => (
              <div key={index} className="demo-user-row">
                <InputGroup
                  value={user.name}
                  onChange={(e) => updateUser(index, "name", e.target.value)}
                  placeholder="Name"
                />
                <InputGroup
                  value={user.email}
                  onChange={(e) => updateUser(index, "email", e.target.value)}
                  placeholder="email@example.com"
                  type="email"
                />
                <InputGroup
                  className="role-input"
                  value={user.role}
                  onChange={(e) => updateUser(index, "role", e.target.value)}
                  placeholder="Role"
                />
                <Button
                  minimal
                  icon="cross"
                  intent="danger"
                  onClick={() => removeUser(index)}
                />
              </div>
            ))}
            <Button
              small
              outlined
              icon="plus"
              onClick={addUser}
              style={{ marginTop: 4 }}
            >
              Add User
            </Button>
          </FormGroup>

          {error && (
            <Callout intent="danger" icon="error" className="mb-8">
              {error}
            </Callout>
          )}
        </div>

        <div className="bp5-dialog-footer">
          <div className="bp5-dialog-footer-actions">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              intent="primary"
              type="submit"
              loading={submitting}
              icon={isEdit ? "tick" : "plus"}
            >
              {isEdit ? "Save Changes" : "Create Scenario"}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  )
}
