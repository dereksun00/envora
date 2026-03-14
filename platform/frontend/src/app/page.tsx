// =============================================================================
// Page 1 — Dashboard
// =============================================================================
// THE REFERENCE IMPLEMENTATION — all other pages copy this data-fetching pattern.
//
// Fetches: GET /api/projects
// Displays:
//   - Project list (probably just one during demo)
//   - Active sandbox count
//   - "New Project" button → /projects/new
//
// Build this against the REAL backend endpoint, NOT mock data.
// This establishes the data-fetching pattern (fetch/SWR/React Query)
// that every subsequent page should follow.
//
// API spec: see platform/api-spec.yaml — GET /projects
// Types: see platform/shared/types.ts — Project
// =============================================================================

export default function DashboardPage() {
  // TODO: Implement
  // 1. Fetch projects from GET /api/projects
  // 2. Display project cards with name, docker image, sandbox count
  // 3. Show total active sandboxes across all projects
  // 4. "New Project" button linking to /projects/new
  return (
    <div>
      <h1>Dashboard</h1>
      <p>TODO: Implement — see comments above</p>
    </div>
  );
}
