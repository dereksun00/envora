// =============================================================================
// Docker Management Module
// =============================================================================
// Manages Docker containers for sandboxed app instances.
// Uses dockerode to interact with the Docker daemon.
//
// Type refs: ContainerInfo from shared/types.ts
//
// Key concepts:
// - All containers attach to the "sandbox-net" bridge network
// - Containers reach Postgres via Docker DNS name "sandbox-postgres" (NOT localhost)
// - Host ports are randomly assigned for localhost access
// =============================================================================

import Docker from "dockerode";
import { execSync } from "child_process";
import type { ContainerInfo } from "../../../shared/types.js";

/**
 * Launch a Docker container for a sandbox.
 */
export async function launchContainer(
  dockerImage: string,
  databaseUrl: string,
  appPort: number
): Promise<ContainerInfo> {
  const docker = new Docker();

  const container = await docker.createContainer({
    Image: dockerImage,
    Env: [`DATABASE_URL=${databaseUrl}`, `PORT=${appPort}`],
    ExposedPorts: { [`${appPort}/tcp`]: {} },
    HostConfig: {
      PortBindings: { [`${appPort}/tcp`]: [{ HostPort: "0" }] },
      NetworkMode: process.env.SANDBOX_NETWORK || "sandbox-net",
    },
  });

  await container.start();

  const info = await container.inspect();
  const portBindings = info.NetworkSettings.Ports[`${appPort}/tcp`];
  const hostPort = parseInt(portBindings?.[0]?.HostPort ?? "0", 10);

  return { containerId: container.id, hostPort };
}

/**
 * Stop a running Docker container (preserves data).
 */
export async function stopContainer(containerId: string): Promise<void> {
  const docker = new Docker();
  const container = docker.getContainer(containerId);
  await container.stop();
}

/**
 * Start a stopped Docker container and return the newly assigned host port.
 */
export async function startContainer(containerId: string): Promise<number> {
  const docker = new Docker();
  const container = docker.getContainer(containerId);
  await container.start();
  const info = await container.inspect();
  const ports = info.NetworkSettings.Ports;
  const firstBinding = Object.values(ports).find((b) => b && b.length > 0);
  return parseInt(firstBinding?.[0]?.HostPort ?? "0", 10);
}

/**
 * Extract source code from a Docker image. Tries the image first,
 * then falls back to reading from the local filesystem if the image
 * is a production build without original source files.
 */
export async function extractSourceFromImage(dockerImage: string): Promise<string> {
  // File extensions to include
  const exts = ["tsx", "ts", "jsx", "js", "vue", "svelte"];
  const extArgs = exts.map(e => `-name '*.${e}'`).join(" -o ");

  // Try extracting from Docker image first
  const dirs = ["/app/src", "/app/app", "/app/pages", "/app/components", "/src"];
  for (const dir of dirs) {
    try {
      const result = execSync(
        `docker run --rm --entrypoint="" ${dockerImage} sh -c "find ${dir} -type f \\( ${extArgs} \\) -not -path '*/node_modules/*' -not -path '*/.next/*' 2>/dev/null | head -50 | while read f; do echo '===FILE:' \\$f '==='; cat \\$f 2>/dev/null; done"`,
        { encoding: "utf8", timeout: 30_000, maxBuffer: 5 * 1024 * 1024 }
      );
      if (result.trim() && result.includes("===FILE:")) {
        return result;
      }
    } catch {
      continue;
    }
  }

  console.log("[docker] No source in image (production build). Trying local filesystem...");

  // Fallback: try to find source locally based on image name
  // e.g., "demo-crm-app:latest" → look in "../demo-crm/src" relative to repo root
  const imageName = dockerImage.split(":")[0].replace(/-app$/, "");
  const fs = await import("fs");
  const path = await import("path");

  // Resolve repo root: backend is at platform/backend/, so go up 2 levels
  const repoRoot = path.resolve(process.cwd(), "..", "..");
  const candidates = [
    path.join(repoRoot, imageName, "src"),
    path.join(repoRoot, imageName, "app"),
    path.join(repoRoot, imageName),
    // Also try from cwd directly
    path.join(process.cwd(), "..", "..", imageName, "src"),
  ];

  console.log("[docker] Trying local paths:", candidates);

  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    console.log(`[docker] Found directory: ${dir}`);
    try {
      // Use node to read files instead of shell find (more portable)
      const source = readSourceDir(dir, exts);
      if (source.trim()) {
        console.log(`[docker] Extracted ${source.length} chars from ${dir}`);
        return source;
      }
    } catch (err) {
      console.error(`[docker] Error reading ${dir}:`, err);
      continue;
    }
  }

  return "";
}

/** Recursively read source files from a directory */
function readSourceDir(dir: string, exts: string[], maxFiles = 50): string {
  const fs = require("fs");
  const path = require("path");
  let result = "";
  let count = 0;

  function walk(d: string) {
    if (count >= maxFiles) return;
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const entry of entries) {
      if (count >= maxFiles) return;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
        walk(full);
      } else if (exts.some((ext: string) => entry.name.endsWith(`.${ext}`))) {
        try {
          const content = fs.readFileSync(full, "utf8");
          result += `===FILE: ${full} ===\n${content}\n\n`;
          count++;
        } catch {}
      }
    }
  }

  walk(dir);
  return result;
}

/**
 * Destroy a Docker container. Swallows errors.
 */
export async function destroyContainer(containerId: string): Promise<void> {
  try {
    const docker = new Docker();
    const container = docker.getContainer(containerId);
    try {
      await container.stop();
    } catch {}
    try {
      await container.remove();
    } catch {}
  } catch {}
}
