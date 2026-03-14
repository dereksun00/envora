// =============================================================================
// API Client
// =============================================================================
// Centralized fetch wrapper for all backend API calls.
// All pages should use these functions instead of raw fetch().
//
// During development, requests to /api/* are proxied to localhost:4000
// via next.config.ts rewrites.
//
// Types: see platform/shared/types.ts
// API spec: see platform/api-spec.yaml
// =============================================================================

import type {
  Project,
  ProjectWithDetails,
  Scenario,
  Sandbox,
  CreateProjectRequest,
  CreateScenarioRequest,
  CreateSandboxRequest,
} from "../../../shared/types";

const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// ---- Projects ----

export function listProjects(): Promise<Project[]> {
  return request("/projects");
}

export function getProject(id: string): Promise<ProjectWithDetails> {
  return request(`/projects/${id}`);
}

export function createProject(data: CreateProjectRequest): Promise<Project> {
  return request("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---- Scenarios ----

export function createScenario(
  projectId: string,
  data: CreateScenarioRequest
): Promise<Scenario> {
  return request(`/projects/${projectId}/scenarios`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---- Sandboxes ----

export function createSandbox(data: CreateSandboxRequest): Promise<Sandbox> {
  return request("/sandboxes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getSandbox(id: string): Promise<Sandbox> {
  return request(`/sandboxes/${id}`);
}

export function destroySandbox(id: string): Promise<Sandbox> {
  return request(`/sandboxes/${id}`, { method: "DELETE" });
}
