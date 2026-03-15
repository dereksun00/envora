// =============================================================================
// Scenario Routes
// =============================================================================
// POST   /api/projects/:projectId/scenarios                      — Create
// PUT    /api/projects/:projectId/scenarios/:scenarioId           — Update
// DELETE /api/projects/:projectId/scenarios/:scenarioId           — Delete
// POST   /api/projects/:projectId/scenarios/:scenarioId/duplicate — Duplicate
// =============================================================================

import { Router, Request } from "express";
import { prisma } from "../lib/db.js";
import type {
  CreateScenarioRequest,
  UpdateScenarioRequest,
} from "../../../shared/types.js";

export const scenarioRoutes = Router({ mergeParams: true });

type ProjectParams = { projectId: string };
type ScenarioParams = { projectId: string; scenarioId: string };

/** Parse JSON string fields on a scenario row so the API returns objects, not strings */
export function serializeScenario(row: any) {
  return {
    ...row,
    demoUsers:
      typeof row.demoUsers === "string"
        ? JSON.parse(row.demoUsers)
        : row.demoUsers,
    featureFlags:
      typeof row.featureFlags === "string"
        ? JSON.parse(row.featureFlags)
        : row.featureFlags,
  };
}

// POST /api/projects/:projectId/scenarios
scenarioRoutes.post("/", async (req: Request<ProjectParams>, res) => {
  const { projectId } = req.params;
  const { name, prompt, demoUsers, featureFlags } =
    req.body as CreateScenarioRequest;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (!name || !prompt) {
    res.status(400).json({ error: "name and prompt are required" });
    return;
  }

  const scenario = await prisma.scenario.create({
    data: {
      projectId,
      name,
      prompt,
      demoUsers: JSON.stringify(demoUsers ?? []),
      featureFlags: JSON.stringify(featureFlags ?? {}),
    },
  });

  res.status(201).json(serializeScenario(scenario));
});

// PUT /api/projects/:projectId/scenarios/:scenarioId
scenarioRoutes.put("/:scenarioId", async (req: Request<ScenarioParams>, res) => {
  const { projectId, scenarioId } = req.params;
  const { name, prompt, demoUsers, featureFlags } =
    req.body as UpdateScenarioRequest;

  const scenario = await prisma.scenario.findFirst({
    where: { id: scenarioId, projectId },
  });

  if (!scenario) {
    res.status(404).json({ error: "Scenario not found" });
    return;
  }

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (prompt !== undefined) {
    data.prompt = prompt;
    // Clear cached SQL so the next sandbox regenerates data from the new prompt
    if (prompt !== scenario.prompt) data.generatedSQL = null;
  }
  if (demoUsers !== undefined) {
    data.demoUsers = JSON.stringify(demoUsers);
    // Clear cache if demo users changed too
    if (JSON.stringify(demoUsers) !== scenario.demoUsers) data.generatedSQL = null;
  }
  if (featureFlags !== undefined)
    data.featureFlags = JSON.stringify(featureFlags);

  const updated = await prisma.scenario.update({
    where: { id: scenarioId },
    data,
  });

  res.json(serializeScenario(updated));
});

// DELETE /api/projects/:projectId/scenarios/:scenarioId
scenarioRoutes.delete("/:scenarioId", async (req: Request<ScenarioParams>, res) => {
  const { projectId, scenarioId } = req.params;

  const scenario = await prisma.scenario.findFirst({
    where: { id: scenarioId, projectId },
  });

  if (!scenario) {
    res.status(404).json({ error: "Scenario not found" });
    return;
  }

  await prisma.scenario.delete({ where: { id: scenarioId } });
  res.status(204).send();
});

// POST /api/projects/:projectId/scenarios/:scenarioId/duplicate
scenarioRoutes.post("/:scenarioId/duplicate", async (req: Request<ScenarioParams>, res) => {
  const { projectId, scenarioId } = req.params;

  const scenario = await prisma.scenario.findFirst({
    where: { id: scenarioId, projectId },
  });

  if (!scenario) {
    res.status(404).json({ error: "Scenario not found" });
    return;
  }

  const duplicate = await prisma.scenario.create({
    data: {
      projectId,
      name: `${scenario.name} (copy)`,
      prompt: scenario.prompt,
      demoUsers: scenario.demoUsers,
      featureFlags: scenario.featureFlags,
    },
  });

  res.status(201).json(serializeScenario(duplicate));
});
