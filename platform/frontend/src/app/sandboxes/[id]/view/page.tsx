"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button, ButtonGroup, Spinner, Alert } from "@blueprintjs/core"
import { getSandbox, updateSandbox, destroySandbox } from "@/lib/api"
import type { Sandbox } from "@shared/types"

function timeRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return "expired"
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m remaining`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m remaining`
}

export default function SandboxViewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [sandbox, setSandbox] = useState<Sandbox | null>(null)
  const [loading, setLoading] = useState(true)
  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDestroy, setConfirmDestroy] = useState(false)
  const [, setTick] = useState(0)
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(() => {
    getSandbox(params.id).then((data) => {
      setSandbox(data)
      if (data.status !== "running") {
        router.replace(`/sandboxes/${params.id}`)
      }
    }).finally(() => setLoading(false))
  }, [params.id, router])

  useEffect(() => {
    load()
    // Poll status every 10s
    pollRef.current = setInterval(() => {
      getSandbox(params.id).then((data) => {
        setSandbox(data)
        if (data.status !== "running") {
          router.replace(`/sandboxes/${params.id}`)
        }
      })
    }, 10000)
    // Update timer every 30s
    timerRef.current = setInterval(() => setTick((t) => t + 1), 30000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [params.id, load, router])

  function showToolbar() {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current)
      hideTimeout.current = null
    }
    setToolbarVisible(true)
  }

  function scheduleHide() {
    hideTimeout.current = setTimeout(() => setToolbarVisible(false), 300)
  }

  async function doAction(action: string) {
    setActionLoading(action)
    try {
      if (action === "destroy") {
        await destroySandbox(params.id)
        router.replace(`/sandboxes/${params.id}`)
      } else {
        await updateSandbox(params.id, { action: action as any })
        load()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
      setConfirmDestroy(false)
    }
  }

  if (loading) {
    return (
      <div className="sandbox-viewer-loading">
        <Spinner size={30} />
      </div>
    )
  }

  if (!sandbox || !sandbox.url) {
    return null // redirect handled in load()
  }

  const isExpired = new Date(sandbox.expiresAt).getTime() <= Date.now()

  return (
    <div className="sandbox-viewer">
      {/* Blue border frame */}
      <div className="sandbox-viewer-frame">
        <iframe
          src={sandbox.url}
          className="sandbox-viewer-iframe"
          title="Sandbox"
        />
      </div>

      {/* Hover trigger zone + toolbar */}
      <div
        className={`sandbox-toolbar-wrapper ${toolbarVisible ? "visible" : ""}`}
        onMouseEnter={showToolbar}
        onMouseLeave={scheduleHide}
      >
        {/* Invisible trigger zone */}
        <div className="sandbox-toolbar-trigger" />

        {/* Toolbar */}
        <div className="sandbox-toolbar">
          <div className="sandbox-toolbar-content">
            <ButtonGroup minimal>
              <Button
                icon="arrow-left"
                onClick={() => router.push(`/sandboxes/${params.id}`)}
              >
                Back
              </Button>
            </ButtonGroup>

            <div className="sandbox-toolbar-separator" />

            <ButtonGroup minimal>
              <Button
                icon="stop"
                loading={actionLoading === "stop"}
                onClick={() => doAction("stop")}
              >
                Stop
              </Button>
              <Button
                icon="refresh"
                loading={actionLoading === "reset"}
                onClick={() => doAction("reset")}
              >
                Reset
              </Button>
              <Button
                icon="time"
                loading={actionLoading === "extend"}
                onClick={() => doAction("extend")}
                disabled={isExpired}
              >
                Extend
              </Button>
            </ButtonGroup>

            <div className="sandbox-toolbar-separator" />

            <span className="sandbox-toolbar-timer">
              {timeRemaining(sandbox.expiresAt)}
            </span>

            <div className="sandbox-toolbar-separator" />

            <ButtonGroup minimal>
              <Button
                icon="share"
                onClick={() => window.open(sandbox.url!, "_blank")}
              >
                New Tab
              </Button>
              <Button
                icon="trash"
                intent="danger"
                loading={actionLoading === "destroy"}
                onClick={() => setConfirmDestroy(true)}
              >
                Destroy
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </div>

      <Alert
        isOpen={confirmDestroy}
        onConfirm={() => doAction("destroy")}
        onCancel={() => setConfirmDestroy(false)}
        intent="danger"
        icon="trash"
        confirmButtonText="Destroy"
        cancelButtonText="Cancel"
      >
        <p>This will stop the container and delete the database. This cannot be undone.</p>
      </Alert>
    </div>
  )
}
