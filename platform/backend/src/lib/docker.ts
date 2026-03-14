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

import type { ContainerInfo } from "../../../shared/types.js";

/**
 * Launch a Docker container for a sandbox.
 *
 * @param dockerImage - Image to run (e.g., "yourname/demo-crm:latest")
 * @param databaseUrl - DATABASE_URL using Docker DNS (sandbox-postgres, not localhost)
 * @param appPort - Port the app listens on inside the container (default 3000)
 * @returns ContainerInfo with containerId and discovered hostPort
 */
export async function launchContainer(
  _dockerImage: string,
  _databaseUrl: string,
  _appPort: number
): Promise<ContainerInfo> {
  // TODO: Implement
  // 1. Create container via dockerode:
  //    - Image: dockerImage
  //    - Env: DATABASE_URL=databaseUrl, PORT=appPort
  //    - ExposedPorts: { `${appPort}/tcp`: {} }
  //    - HostConfig.PortBindings: { `${appPort}/tcp`: [{ HostPort: "0" }] } (random port)
  //    - HostConfig.NetworkMode: process.env.SANDBOX_NETWORK || "sandbox-net"
  // 2. Start the container
  // 3. Inspect to discover the assigned host port
  // 4. Return { containerId, hostPort }
  throw new Error("Not implemented");
}

/**
 * Destroy a Docker container. Swallows errors.
 */
export async function destroyContainer(
  _containerId: string
): Promise<void> {
  // TODO: Implement
  // 1. docker.getContainer(containerId).stop()
  // 2. docker.getContainer(containerId).remove()
  // 3. Swallow all errors (container may already be gone)
}
