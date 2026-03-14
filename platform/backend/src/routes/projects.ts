// =============================================================================
// Project Routes
// =============================================================================
// GET  /api/projects          — List all projects
// POST /api/projects          — Create a project
// GET  /api/projects/:id      — Get project with scenarios + sandboxes
// POST /api/projects/:id/scenarios — Create scenario (delegated)
// =============================================================================
// Request/response shapes: see ../../shared/types.ts
// API spec: see ../api-spec.yaml
// =============================================================================

import { Router } from "express";
import { scenarioRoutes } from "./scenarios.js";

export const projectRoutes = Router();

// Nest scenario routes under projects
projectRoutes.use("/:projectId/scenarios", scenarioRoutes);

// GET /api/projects
projectRoutes.get("/", async (_req, res) => {
  // TODO: Implement — fetch all projects from Prisma (SQLite)
  // Return: Project[]
  res.json([]);
});

// POST /api/projects
projectRoutes.post("/", async (req, res) => {
  // TODO: Implement — validate CreateProjectRequest, create via Prisma
  // Return: 201 + Project
  res.status(501).json({ error: "Not implemented" });
});

// GET /api/projects/:id
projectRoutes.get("/:id", async (req, res) => {
  // TODO: Implement — fetch project by ID with include: { scenarios, sandboxes }
  // Return: ProjectWithDetails
  res.status(501).json({ error: "Not implemented" });
});
