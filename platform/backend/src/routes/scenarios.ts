// =============================================================================
// Scenario Routes
// =============================================================================
// POST /api/projects/:projectId/scenarios — Create a scenario
// =============================================================================
// Request/response shapes: see ../../shared/types.ts
// API spec: see ../api-spec.yaml
// =============================================================================

import { Router } from "express";

export const scenarioRoutes = Router({ mergeParams: true });

// POST /api/projects/:projectId/scenarios
scenarioRoutes.post("/", async (req, res) => {
  // TODO: Implement
  // 1. Verify project exists (req.params.projectId)
  // 2. Validate CreateScenarioRequest body
  // 3. Create scenario via Prisma (store demoUsers/featureFlags as JSON strings)
  // Return: 201 + Scenario
  res.status(501).json({ error: "Not implemented" });
});
