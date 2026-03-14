// =============================================================================
// Sandbox Platform — Backend Entry Point
// =============================================================================
// Express server exposing the platform API.
// See ../api-spec.yaml for the full OpenAPI specification.
// See ../../shared/types.ts for all request/response shapes.
// =============================================================================

import express from "express";
import cors from "cors";
import { projectRoutes } from "./routes/projects.js";
import { scenarioRoutes } from "./routes/scenarios.js";
import { sandboxRoutes } from "./routes/sandboxes.js";
import { overviewRoutes } from "./routes/overview.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/overview", overviewRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sandboxes", sandboxRoutes);
// Scenario routes are nested: /api/projects/:id/scenarios
// Mounted inside projectRoutes

app.listen(PORT, () => {
  console.log(`Sandbox Platform API running on http://localhost:${PORT}`);
});
