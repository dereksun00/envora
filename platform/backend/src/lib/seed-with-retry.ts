// =============================================================================
// Seed with Retry Module
// =============================================================================
// Executes SQL against a sandbox Postgres database.
// On failure, sends the SQL + schema + Postgres error back to Claude to fix.
// Retries up to 3 times. This is the most important reliability feature.
//
// Type refs: SeedResult from shared/types.ts
// =============================================================================

import type { SeedResult } from "../../../shared/types.js";

/**
 * Execute SQL against the sandbox database with AI-powered retry.
 *
 * @param databaseUrl - Postgres connection string for the sandbox DB
 * @param sql - SQL INSERT statements to execute
 * @param schema - Original schema text (sent to Claude on retry for context)
 * @param schemaFormat - "prisma" or "sql"
 * @returns SeedResult with success status, final SQL, and attempt count
 */
export async function seedWithRetry(
  _databaseUrl: string,
  _sql: string,
  _schema: string,
  _schemaFormat: string
): Promise<SeedResult> {
  // TODO: Implement
  // 1. Connect to sandbox DB via pg client
  // 2. Execute SQL in a transaction
  // 3. On success: return { success: true, finalSQL: sql, attempts: 1 }
  // 4. On failure:
  //    a. Send { sql, schema, error } to Claude API asking for fixed SQL
  //    b. Retry with the corrected SQL
  //    c. Repeat up to 3 times
  // 5. On final failure: return { success: false, finalSQL, attempts, lastError }
  throw new Error("Not implemented");
}
