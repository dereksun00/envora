// =============================================================================
// AI Data Generation Module
// =============================================================================
// Calls Claude API to generate SQL INSERT statements for sandbox seeding.
// Input: schema + scenario prompt + demo users
// Output: SQL INSERT statements (dependency-ordered, FK-correct)
//
// Type refs: GenerateDataParams, GenerateDataResult from shared/types.ts
// =============================================================================

import type { GenerateDataParams, GenerateDataResult } from "../../../shared/types.js";

/**
 * Generate SQL INSERT statements using Claude API.
 *
 * System prompt must enforce:
 * - Dependency-ordered inserts (parent tables first)
 * - Foreign key correctness
 * - Realistic narrative-coherent data
 * - ISO timestamps spread across the last 6 months
 * - ~30% NULLs in nullable columns
 * - Proper enum casing (matching Prisma enums exactly)
 * - Raw SQL output with NO markdown fences
 *
 * Strip any accidental markdown fences from Claude's response.
 * Validate that output contains INSERT statements.
 */
export async function generateSeedData(
  _params: GenerateDataParams
): Promise<GenerateDataResult> {
  // TODO: Implement
  // 1. Construct system prompt with rules above
  // 2. Construct user prompt from params.scenarioPrompt + schema + demoUsers
  // 3. Call Anthropic SDK (Claude Sonnet) — direct function call, NOT via HTTP
  // 4. Strip markdown fences if present
  // 5. Validate output contains INSERT statements
  // 6. Return { sql, tokenCount }
  throw new Error("Not implemented");
}
