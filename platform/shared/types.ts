// =============================================================================
// Sandbox Platform — Shared Types
// =============================================================================
// This file is the single source of truth for all API shapes.
// CRITICAL: After ANY change to this file, re-feed it to your AI tool.
//   - Claude Code: reference the file
//   - Cursor: @types.ts
//   - Antigravity: mention in next prompt
// =============================================================================

// ---- Enums ----

export type SchemaFormat = "prisma" | "sql";

export type SandboxStatus =
  | "provisioning"
  | "running"
  | "failed"
  | "destroyed";

export type ProvisioningStep =
  | "creating_database"
  | "applying_schema"
  | "generating_data"
  | "seeding_database"
  | "launching_app"
  | "waiting_for_ready"
  | "ready";

// ---- Domain Models ----

export interface Project {
  id: string;
  name: string;
  dockerImage: string;
  schema: string;
  schemaFormat: SchemaFormat;
  appPort: number;
  createdAt: string; // ISO 8601
}

export interface Scenario {
  id: string;
  projectId: string;
  name: string;
  prompt: string;
  generatedSQL: string | null; // cached SQL from AI generation
  demoUsers: DemoUser[];
  featureFlags: Record<string, boolean>;
  createdAt: string;
}

export interface DemoUser {
  name: string;
  email: string;
  role: string;
}

export interface Sandbox {
  id: string;
  projectId: string;
  scenarioId: string;
  subdomain: string;
  containerId: string | null;
  hostPort: number | null;
  databaseName: string;
  status: SandboxStatus;
  statusMessage: string;
  currentStep: ProvisioningStep | null;
  url: string | null;
  expiresAt: string; // ISO 8601
  createdAt: string;
}

// ---- API Request Bodies ----

export interface CreateProjectRequest {
  name: string;
  dockerImage: string;
  schema: string;
  schemaFormat: SchemaFormat;
  appPort?: number; // defaults to 3000
}

export interface CreateScenarioRequest {
  name: string;
  prompt: string;
  demoUsers?: DemoUser[];
  featureFlags?: Record<string, boolean>;
}

export interface CreateSandboxRequest {
  projectId: string;
  scenarioId: string;
  useWarmStart?: boolean; // skip AI generation, use cached SQL
}

// ---- API Response Shapes ----

export interface ProjectWithDetails extends Project {
  scenarios: Scenario[];
  sandboxes: Sandbox[];
}

export interface ApiError {
  error: string;
  details?: string;
}

// ---- Provisioning Pipeline Types ----

export interface GenerateDataParams {
  schema: string;
  schemaFormat: SchemaFormat;
  scenarioPrompt: string;
  demoUsers: DemoUser[];
}

export interface GenerateDataResult {
  sql: string;
  tokenCount?: number;
}

export interface SeedResult {
  success: boolean;
  finalSQL: string;
  attempts: number;
  lastError?: string;
}

export interface ContainerInfo {
  containerId: string;
  hostPort: number;
}
