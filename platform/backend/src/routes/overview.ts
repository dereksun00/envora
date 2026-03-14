// =============================================================================
// Overview Routes
// =============================================================================
// GET /api/overview — Dashboard stats (counts + recent sandboxes)
// =============================================================================

import { Router } from "express";
import { prisma } from "../lib/db.js";
import { serializeScenario } from "./scenarios.js";

export const overviewRoutes = Router();

// GET /api/overview
overviewRoutes.get("/", async (_req, res) => {
  const [
    projectCount,
    scenarioCount,
    activeSandboxCount,
    failedSandboxCount,
    recentSandboxRows,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.scenario.count(),
    prisma.sandbox.count({
      where: { status: { in: ["running", "provisioning"] } },
    }),
    prisma.sandbox.count({
      where: { status: "failed" },
    }),
    prisma.sandbox.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        project: { select: { name: true } },
        scenario: { select: { name: true } },
      },
    }),
  ]);

  const recentSandboxes = recentSandboxRows.map((sb) => ({
    ...sb,
    projectName: sb.project.name,
    scenarioName: sb.scenario.name,
    project: undefined,
    scenario: undefined,
  }));

  res.json({
    projectCount,
    scenarioCount,
    activeSandboxCount,
    failedSandboxCount,
    recentSandboxes,
  });
});
