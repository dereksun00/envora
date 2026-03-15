// =============================================================================
// Sandbox Routes
// =============================================================================
// GET    /api/sandboxes        — List all sandboxes (with filters)
// POST   /api/sandboxes        — Create sandbox + start provisioning (async)
// GET    /api/sandboxes/:id    — Get sandbox status (poll every 2s)
// PATCH  /api/sandboxes/:id    — Lifecycle actions (stop/start/reset/extend)
// DELETE /api/sandboxes/:id    — Destroy sandbox (stop container, drop DB)
// =============================================================================

import { Router } from "express";
import { customAlphabet } from "nanoid";
import { Client } from "pg";
import { prisma } from "../lib/db.js";
import { provision } from "../lib/provision.js";
import {
  destroyContainer,
  stopContainer,
  startContainer,
} from "../lib/docker.js";
import type {
  CreateSandboxRequest,
  UpdateSandboxRequest,
} from "../../../shared/types.js";

export const sandboxRoutes = Router();

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

const ADMIN_DB_URL =
  process.env.ADMIN_DATABASE_URL ||
  "postgresql://crm:crm_password@localhost:5432/postgres";

// ---- Lazy expiry check ----
async function checkExpiry(sandbox: any) {
  if (
    sandbox.status === "running" &&
    new Date(sandbox.expiresAt) < new Date()
  ) {
    // Auto-stop expired sandbox
    if (sandbox.containerId) {
      await stopContainer(sandbox.containerId).catch(console.error);
    }
    return prisma.sandbox.update({
      where: { id: sandbox.id },
      data: { status: "expired", statusMessage: "Sandbox expired" },
    });
  }
  return sandbox;
}

// GET /api/sandboxes
sandboxRoutes.get("/", async (req, res) => {
  const { status, projectId } = req.query as {
    status?: string;
    projectId?: string;
  };

  const where: any = {};
  if (status) where.status = status;
  if (projectId) where.projectId = projectId;

  const sandboxes = await prisma.sandbox.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { name: true } },
      scenario: { select: { name: true } },
    },
  });

  const result = sandboxes.map((sb) => ({
    ...sb,
    projectName: sb.project.name,
    scenarioName: sb.scenario.name,
    project: undefined,
    scenario: undefined,
  }));

  res.json(result);
});

// POST /api/sandboxes
sandboxRoutes.post("/", async (req, res) => {
  const { projectId, scenarioId } = req.body as CreateSandboxRequest;

  if (!projectId || !scenarioId) {
    res.status(400).json({ error: "projectId and scenarioId are required" });
    return;
  }

  const subdomain = nanoid();
  const databaseName = "sandbox_" + nanoid();

  const sandbox = await prisma.sandbox.create({
    data: {
      projectId,
      scenarioId,
      subdomain,
      databaseName,
      status: "provisioning",
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
  });

  // Fire-and-forget — do NOT await
  provision(sandbox.id).catch(console.error);

  res.status(201).json(sandbox);
});

// GET /api/sandboxes
sandboxRoutes.get("/", async (req, res) => {
  const sandboxes = await prisma.sandbox.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(sandboxes);
});

// GET /api/sandboxes/:id
sandboxRoutes.get("/:id", async (req, res) => {
  let sandbox = await prisma.sandbox.findUnique({
    where: { id: req.params.id },
  });

  if (!sandbox) {
    res.status(404).json({ error: "Sandbox not found" });
    return;
  }

  sandbox = await checkExpiry(sandbox);
  res.json(sandbox);
});

// PATCH /api/sandboxes/:id — Lifecycle actions
sandboxRoutes.patch("/:id", async (req, res) => {
  const { action, extendMinutes } = req.body as UpdateSandboxRequest;

  if (!action) {
    res.status(400).json({ error: "action is required" });
    return;
  }

  const sandbox = await prisma.sandbox.findUnique({
    where: { id: req.params.id },
  });

  if (!sandbox) {
    res.status(404).json({ error: "Sandbox not found" });
    return;
  }

  try {
    switch (action) {
      case "stop": {
        if (sandbox.status !== "running") {
          res
            .status(400)
            .json({ error: "Can only stop a running sandbox" });
          return;
        }
        if (sandbox.containerId) {
          await stopContainer(sandbox.containerId);
        }
        const stopped = await prisma.sandbox.update({
          where: { id: sandbox.id },
          data: { status: "stopped", statusMessage: "Stopped by user" },
        });
        res.json(stopped);
        return;
      }

      case "start": {
        if (sandbox.status !== "stopped" && sandbox.status !== "expired") {
          res
            .status(400)
            .json({ error: "Can only start a stopped or expired sandbox" });
          return;
        }
        let newPort = sandbox.hostPort;
        if (sandbox.containerId) {
          newPort = await startContainer(sandbox.containerId);
        }
        // Re-extend expiry by 2 hours on start, update port/url in case Docker reassigned
        const started = await prisma.sandbox.update({
          where: { id: sandbox.id },
          data: {
            status: "running",
            statusMessage: "Sandbox is running",
            hostPort: newPort,
            url: newPort ? `http://localhost:${newPort}` : sandbox.url,
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
          },
        });
        res.json(started);
        return;
      }

      case "reset": {
        if (
          sandbox.status !== "running" &&
          sandbox.status !== "stopped" &&
          sandbox.status !== "failed"
        ) {
          res
            .status(400)
            .json({ error: "Cannot reset a sandbox in this state" });
          return;
        }

        // Destroy existing container
        if (sandbox.containerId) {
          await destroyContainer(sandbox.containerId).catch(console.error);
        }

        // Drop existing database
        const adminClient = new Client({ connectionString: ADMIN_DB_URL });
        await adminClient.connect();
        await adminClient.query(
          `DROP DATABASE IF EXISTS "${sandbox.databaseName}"`
        );
        try {
          await adminClient.end();
        } catch {}

        // Create new database name and reset
        const newDbName = "sandbox_" + nanoid();
        const reset = await prisma.sandbox.update({
          where: { id: sandbox.id },
          data: {
            status: "provisioning",
            statusMessage: "Initializing...",
            currentStep: null,
            containerId: null,
            hostPort: null,
            url: null,
            databaseName: newDbName,
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
          },
        });

        // Re-provision fire-and-forget
        provision(sandbox.id).catch(console.error);

        res.json(reset);
        return;
      }

      case "extend": {
        if (sandbox.status !== "running" && sandbox.status !== "stopped") {
          res
            .status(400)
            .json({ error: "Can only extend running or stopped sandboxes" });
          return;
        }
        const minutes = extendMinutes || 120;
        const newExpiry = new Date(
          new Date(sandbox.expiresAt).getTime() + minutes * 60 * 1000
        );
        const extended = await prisma.sandbox.update({
          where: { id: sandbox.id },
          data: { expiresAt: newExpiry },
        });
        res.json(extended);
        return;
      }

      default:
        res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Lifecycle action failed", details: err.message });
  }
});

// DELETE /api/sandboxes/:id
sandboxRoutes.delete("/:id", async (req, res) => {
  const sandbox = await prisma.sandbox.findUnique({
    where: { id: req.params.id },
  });

  if (!sandbox) {
    res.status(404).json({ error: "Sandbox not found" });
    return;
  }

  // Stop and remove container if one exists
  if (sandbox.containerId) {
    await destroyContainer(sandbox.containerId).catch(console.error);
  }

  // Drop the sandbox Postgres database
  const adminClient = new Client({ connectionString: ADMIN_DB_URL });
  await adminClient.connect();
  await adminClient.query(
    `DROP DATABASE IF EXISTS "${sandbox.databaseName}"`
  );
  try {
    await adminClient.end();
  } catch {}

  const updated = await prisma.sandbox.update({
    where: { id: req.params.id },
    data: { status: "destroyed" },
  });

  res.json(updated);
});
