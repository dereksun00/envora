// =============================================================================
// Sandbox Routes
// =============================================================================
// POST   /api/sandboxes      — Create sandbox + start provisioning (async)
// GET    /api/sandboxes/:id  — Get sandbox status (poll every 2s)
// DELETE /api/sandboxes/:id  — Destroy sandbox (stop container, drop DB)
// =============================================================================
// Request/response shapes: see ../../shared/types.ts
// API spec: see ../api-spec.yaml
// =============================================================================

import { Router } from "express";

export const sandboxRoutes = Router();

// POST /api/sandboxes
sandboxRoutes.post("/", async (req, res) => {
  // TODO: Implement
  // 1. Validate CreateSandboxRequest body
  // 2. Generate unique subdomain + databaseName via nanoid
  // 3. Create Sandbox record in Prisma with status "provisioning"
  // 4. Set expiresAt = now + 2 hours
  // 5. Kick off provision(sandbox.id) WITHOUT awaiting (fire-and-forget)
  // 6. Return 201 + Sandbox immediately
  res.status(501).json({ error: "Not implemented" });
});

// GET /api/sandboxes/:id
sandboxRoutes.get("/:id", async (req, res) => {
  // TODO: Implement — fetch sandbox by ID from Prisma
  // Return: Sandbox (frontend polls this every 2s for provisioning updates)
  res.status(501).json({ error: "Not implemented" });
});

// DELETE /api/sandboxes/:id
sandboxRoutes.delete("/:id", async (req, res) => {
  // TODO: Implement
  // 1. Fetch sandbox
  // 2. If containerId exists: call destroyContainer(containerId) from lib/docker.ts
  // 3. Drop the sandbox database from Postgres
  // 4. Update sandbox status to "destroyed"
  // Return: 200 + updated Sandbox
  res.status(501).json({ error: "Not implemented" });
});
