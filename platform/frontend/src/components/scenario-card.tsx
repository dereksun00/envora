"use client"

import { useState } from "react"
import {
  Card,
  Button,
  Icon,
  Alert,
  Menu,
  MenuItem,
  Popover,
} from "@blueprintjs/core"
import type { Scenario } from "@shared/types"

interface ScenarioCardProps {
  scenario: Scenario
  onLaunch: (scenarioId: string) => void
  onEdit: (scenario: Scenario) => void
  onDuplicate: (scenarioId: string) => void
  onDelete: (scenarioId: string) => void
  launching?: boolean
}

export function ScenarioCard({
  scenario,
  onLaunch,
  onEdit,
  onDuplicate,
  onDelete,
  launching = false,
}: ScenarioCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <>
      <Card className="scenario-card">
        <div className="scenario-info">
          <p className="scenario-name">{scenario.name}</p>
          <p className="scenario-prompt">{scenario.prompt}</p>
          <div className="scenario-meta">
            {scenario.demoUsers && scenario.demoUsers.length > 0 && (
              <span className="scenario-meta-item">
                <Icon icon="people" size={12} />
                {scenario.demoUsers.length} user
                {scenario.demoUsers.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <div className="scenario-actions">
          <Button
            intent="success"
            icon={launching ? undefined : "rocket-slant"}
            loading={launching}
            onClick={() => onLaunch(scenario.id)}
            small
          >
            Launch
          </Button>
          <Button
            minimal
            small
            icon="edit"
            onClick={() => onEdit(scenario)}
          />
          <Popover
            content={
              <Menu>
                <MenuItem
                  icon="duplicate"
                  text="Duplicate"
                  onClick={() => onDuplicate(scenario.id)}
                />
                <MenuItem
                  icon="trash"
                  text="Delete"
                  intent="danger"
                  onClick={() => setConfirmDelete(true)}
                />
              </Menu>
            }
            placement="bottom-end"
          >
            <Button minimal small icon="more" />
          </Popover>
        </div>
      </Card>

      <Alert
        isOpen={confirmDelete}
        onConfirm={() => {
          setConfirmDelete(false)
          onDelete(scenario.id)
        }}
        onCancel={() => setConfirmDelete(false)}
        intent="danger"
        icon="trash"
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      >
        <p>Delete scenario &ldquo;{scenario.name}&rdquo;? This cannot be undone.</p>
      </Alert>
    </>
  )
}
