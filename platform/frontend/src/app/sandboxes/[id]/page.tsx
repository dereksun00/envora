"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X, ExternalLink, Copy, ArrowLeft } from "lucide-react"
import { getSandbox, destroySandbox } from "@/lib/api"
import type { Sandbox, ProvisioningStep } from "@shared/types"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

const STEPS: { key: ProvisioningStep; label: string }[] = [
  { key: "creating_database", label: "Creating database" },
  { key: "applying_schema", label: "Applying schema" },
  { key: "generating_data", label: "Generating synthetic data" },
  { key: "seeding_database", label: "Seeding database" },
  { key: "launching_app", label: "Launching application" },
  { key: "waiting_for_ready", label: "Waiting for app to be ready" },
  { key: "ready", label: "Ready!" },
]

function getStepIndex(step: ProvisioningStep | null | undefined): number {
  if (!step) return -1
  return STEPS.findIndex((s) => s.key === step)
}

function StepIcon({ state }: { state: "completed" | "active" | "pending" | "failed" }) {
  if (state === "completed") {
    return (
      <div className="w-7 h-7 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0">
        <Check size={14} className="text-green-500" />
      </div>
    )
  }
  if (state === "active") {
    return (
      <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
        <Spinner size={14} className="text-foreground" />
      </div>
    )
  }
  if (state === "failed") {
    return (
      <div className="w-7 h-7 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center shrink-0">
        <X size={14} className="text-destructive" />
      </div>
    )
  }
  return (
    <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
      <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
    </div>
  )
}

export default function SandboxStatusPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [sandbox, setSandbox] = useState<Sandbox | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [destroying, setDestroying] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function stopPolling() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    getSandbox(params.id)
      .then((data) => {
        setSandbox(data)
        if (data.status !== "running" && data.status !== "failed" && data.status !== "destroyed") {
          intervalRef.current = setInterval(() => {
            getSandbox(params.id).then((updated) => {
              setSandbox(updated)
              if (updated.status === "running" || updated.status === "failed" || updated.status === "destroyed") {
                stopPolling()
              }
            })
          }, 2000)
        }
      })
      .finally(() => setLoading(false))

    return stopPolling
  }, [params.id])

  async function handleDestroy() {
    setDestroying(true)
    try {
      await destroySandbox(params.id)
      router.push("/")
    } catch {
      setDestroying(false)
    }
  }

  function copyUrl() {
    if (sandbox?.url) {
      navigator.clipboard.writeText(sandbox.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={24} className="text-muted-foreground" />
      </div>
    )
  }

  if (!sandbox) {
    return <div className="text-muted-foreground">Sandbox not found.</div>
  }

  const currentStepIndex = getStepIndex(sandbox.currentStep)
  const isRunning = sandbox.status === "running"
  const isFailed = sandbox.status === "failed"

  return (
    <div className="max-w-xl mx-auto">
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Dashboard
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Sandbox</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">{sandbox.id}</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              Destroy
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Destroy sandbox?</AlertDialogTitle>
              <AlertDialogDescription>
                This will stop the container and delete the database. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDestroy} disabled={destroying}>
                {destroying ? "Destroying..." : "Destroy"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Success card */}
      {isRunning && sandbox.url && (
        <Card className="border-green-500/30 mb-6">
          <CardContent className="pt-5">
            <p className="text-sm font-medium text-green-500 mb-3">Sandbox is ready</p>
            <div className="flex items-center gap-2">
              <a
                href={sandbox.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 flex-1 font-mono text-sm bg-muted rounded-md px-3 py-2 hover:bg-accent transition-colors border border-border truncate"
              >
                <ExternalLink size={14} className="shrink-0 text-muted-foreground" />
                {sandbox.url}
              </a>
              <Button variant="outline" size="sm" onClick={copyUrl}>
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error card */}
      {isFailed && (
        <Card className="border-destructive/30 mb-6">
          <CardContent className="pt-5">
            <p className="text-sm font-medium text-destructive mb-1">Provisioning failed</p>
            {sandbox.statusMessage && (
              <p className="text-xs text-muted-foreground font-mono">{sandbox.statusMessage}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step indicator */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="space-y-1">
            {STEPS.map((step, index) => {
              let state: "completed" | "active" | "pending" | "failed"
              if (isRunning) {
                state = "completed"
              } else if (isFailed) {
                if (index < currentStepIndex) state = "completed"
                else if (index === currentStepIndex) state = "failed"
                else state = "pending"
              } else {
                if (index < currentStepIndex) state = "completed"
                else if (index === currentStepIndex) state = "active"
                else state = "pending"
              }

              const isCurrentActive = state === "active"

              return (
                <div key={step.key} className="flex items-start gap-3 py-2">
                  <div className="mt-0.5">
                    <StepIcon state={state} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${isCurrentActive ? "font-semibold text-foreground" : state === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                      {step.label}
                    </p>
                    {isCurrentActive && sandbox.statusMessage && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{sandbox.statusMessage}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
