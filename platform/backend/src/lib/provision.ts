// =============================================================================
// Provisioning Orchestrator
// =============================================================================
// Ties together: database creation, schema application, AI data generation,
// seed-with-retry, and Docker container launch.
//
// Called asynchronously from POST /api/sandboxes (fire-and-forget).
// Updates sandbox status in the platform DB at each step.
//
// IMPORTANT: Calls generate.ts DIRECTLY (as a function import), NOT via HTTP.
// =============================================================================

/**
 * Provision a sandbox end-to-end.
 *
 * Steps (each updates sandbox.status + sandbox.currentStep in the DB):
 *
 * 1. "Creating database..."     → Create a new Postgres DB via admin connection
 * 2. "Applying schema..."       → If Prisma: write schema to temp file, run
 *                                  `prisma db push`, delete temp. If SQL: execute DDL.
 * 3. "Generating synthetic data..." → Check scenario.generatedSQL cache first.
 *                                      If null, call generateSeedData() directly.
 *                                      Cache the result on the scenario.
 * 4. "Seeding database..."      → Call seedWithRetry(). Update cached SQL if
 *                                  retries modified it.
 * 5. "Launching application..." → Call launchContainer() with DATABASE_URL using
 *                                  Docker DNS hostname "sandbox-postgres" (NOT localhost).
 * 6. "Waiting for ready..."     → Poll http://localhost:{hostPort} every 1s for 30s.
 *                                  Don't throw on timeout.
 * 7. Set status "running" with URL http://localhost:{hostPort}.
 *
 * On any error: set status "failed" with the error message.
 *
 * @param sandboxId - ID of the Sandbox record to provision
 */
export async function provision(
  _sandboxId: string
): Promise<void> {
  // TODO: Implement
  // 1. Fetch sandbox with project + scenario from Prisma
  // 2. Execute steps 1-7 above, updating DB at each step
  // 3. Wrap everything in try-catch, set "failed" on error
  throw new Error("Not implemented");
}
