"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Redirect to project detail — scenario creation now uses a dialog
export default function CreateScenarioRedirect({ params }: { params: { id: string } }) {
  const router = useRouter()
  useEffect(() => { router.replace(`/projects/${params.id}`) }, [params.id, router])
  return null
}
