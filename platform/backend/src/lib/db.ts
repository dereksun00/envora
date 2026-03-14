// =============================================================================
// Platform Database Client
// =============================================================================
// Single Prisma client instance for the platform's SQLite database.
// Import this everywhere — do NOT create new PrismaClient instances.
// =============================================================================

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
