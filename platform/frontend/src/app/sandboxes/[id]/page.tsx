"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Button,
  Card,
  Icon,
  Spinner,
  Tag,
  Callout,
} from "@blueprintjs/core"
import { getSandbox } from "@/lib/api"
import { SandboxStatusBadge } from "@/components/sandbox-status-badge"
import { SandboxActions } from "@/components/sandbox-actions"
import type { Sandbox, ProvisioningStep } from "@shared/types"

const STEPS: { key: ProvisioningStep; label: string; icon: string }[] = [
  { key: "creating_database", label: "Creating database", icon: "database" },
  { key: "applying_schema", label: "Applying schema", icon: "th" },
  { key: "generating_data", label: "Generating synthetic data", icon: "clean" },
  { key: "seeding_database", label: "Seeding database", icon: "import" },
  { key: "launching_app", label: "Launching application", icon: "play" },
  { key: "waiting_for_ready", label: "Waiting for app to be ready", icon: "time" },
  { key: "ready", label: "Ready!", icon: "tick-circle" },
]

function getStepIndex(step: ProvisioningStep | null | undefined): number {
  if (!step) return -1
  return STEPS.findIndex((s) => s.key === step)
}

function StepIcon({ state, icon }: { state: string; icon: string }) {
  if (state === "completed")
    return <div className="step-icon completed"><Icon icon="tick" size={14} /></div>
  if (state === "active")
    return <div className="step-icon active"><Spinner size={14} /></div>
  if (state === "failed")
    return <div className="step-icon failed"><Icon icon="cross" size={14} /></div>
  return <div className="step-icon pending"><Icon icon={icon as any} size={12} /></div>
}

function timeRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return "expired"
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m remaining`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m remaining`
}

export default function SandboxDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [sandbox, setSandbox] = useState<Sandbox | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function stopPolling() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  function load() {
    getSandbox(params.id).then((data) => {
      setSandbox(data)
      // Start polling if still provisioning
      if (data.status === "provisioning" && !intervalRef.current) {
        intervalRef.current = setInterval(() => {
          getSandbox(params.id).then((updated) => {
            setSandbox(updated)
            if (updated.status !== "provisioning") stopPolling()
          })
        }, 2000)
      }
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    return stopPolling
  }, [params.id])

  function copyUrl() {
    if (sandbox?.url) {
      navigator.clipboard.writeText(sandbox.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading)
    return <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}><Spinner size={30} /></div>
  if (!sandbox) return <div style={{ opacity: 0.6 }}>Sandbox not found.</div>

  const currentStepIndex = getStepIndex(sandbox.currentStep)
  const isRunning = sandbox.status === "running"
  const isFailed = sandbox.status === "failed"
  const isStopped = sandbox.status === "stopped"
  const isExpired = sandbox.status === "expired"

  return (
    <div className="page-container-sm">
      <button className="back-link" onClick={() => router.push("/sandboxes")}>
        <Icon icon="arrow-left" size={14} /> Sandboxes
      </button>

      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 className="page-title">Sandbox</h1>
            <SandboxStatusBadge status={sandbox.status} />
          </div>
          <p style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.5, marginTop: 4 }}>
            {sandbox.id}
          </p>
        </div>
      </div>

      {/* Lifecycle actions */}
      <Card className="mb-24" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 13, opacity: 0.6 }}>
          {timeRemaining(sandbox.expiresAt)}
        </div>
        <SandboxActions
          sandboxId={sandbox.id}
          status={sandbox.status}
          url={sandbox.url}
          onAction={load}
        />
      </Card>

      {/* Success callout */}
      {isRunning && sandbox.url && (
        <Callout intent="success" icon="tick-circle" className="mb-24">
          <p style={{ fontWeight: 500, marginBottom: 10 }}>Sandbox is ready</p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a href={sandbox.url} target="_blank" rel="noopener noreferrer" className="sandbox-url-bar" style={{ flex: 1 }}>
              <Icon icon="share" size={12} /> {sandbox.url}
            </a>
            <Button small outlined icon={copied ? "tick" : "clipboard"}
              intent={copied ? "success" : "none"} onClick={copyUrl}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </Callout>
      )}

      {/* Stopped callout */}
      {isStopped && (
        <Callout intent="warning" icon="pause" className="mb-24">
          <p style={{ fontWeight: 500 }}>Sandbox is stopped</p>
          <p style={{ fontSize: 13, opacity: 0.7 }}>Container is paused. Start it to resume.</p>
        </Callout>
      )}

      {/* Expired callout */}
      {isExpired && (
        <Callout intent="warning" icon="time" className="mb-24">
          <p style={{ fontWeight: 500 }}>Sandbox has expired</p>
          <p style={{ fontSize: 13, opacity: 0.7 }}>Start it again to re-extend the expiry.</p>
        </Callout>
      )}

      {/* Failed callout */}
      {isFailed && (
        <Callout intent="danger" icon="error" className="mb-24">
          <p style={{ fontWeight: 500, marginBottom: 4 }}>Provisioning failed</p>
          {sandbox.statusMessage && (
            <p style={{ fontSize: 12, fontFamily: "monospace", opacity: 0.6 }}>{sandbox.statusMessage}</p>
          )}
        </Callout>
      )}

      {/* Provisioning steps */}
      {(sandbox.status === "provisioning" || isRunning || isFailed) && (
        <Card>
          <div className="step-list">
            {STEPS.map((step, index) => {
              let state: string
              if (isRunning) state = "completed"
              else if (isFailed) {
                if (index < currentStepIndex) state = "completed"
                else if (index === currentStepIndex) state = "failed"
                else state = "pending"
              } else {
                if (index < currentStepIndex) state = "completed"
                else if (index === currentStepIndex) state = "active"
                else state = "pending"
              }
              const isLast = index === STEPS.length - 1

              return (
                <div key={step.key}>
                  <div className="step-item">
                    <StepIcon state={state} icon={step.icon} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className={`step-label ${state}`}>{step.label}</div>
                      {state === "active" && sandbox.statusMessage && (
                        <div className="step-sublabel">{sandbox.statusMessage}</div>
                      )}
                    </div>
                    {state === "completed" && <Tag minimal intent="success" round>done</Tag>}
                  </div>
                  {!isLast && <div className={`step-connector ${state === "completed" ? "completed" : ""}`} />}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
