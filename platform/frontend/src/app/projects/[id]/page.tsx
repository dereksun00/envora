// =============================================================================
// Page 3 — Project Detail
// =============================================================================
// Fetches: GET /api/projects/:id (returns ProjectWithDetails)
//
// Displays:
//   - Project name + Docker image
//   - Schema preview in monospace code block
//   - Scenario list, each with a "Launch Sandbox" button
//   - "New Scenario" button → /projects/[id]/scenarios/new
//   - List of sandboxes with status badges
//
// "Launch Sandbox" button: POST /api/sandboxes { projectId, scenarioId }
//   → navigate to /sandboxes/[id] (the status page)
//
// API spec: see platform/api-spec.yaml — GET /projects/:id
// Types: see platform/shared/types.ts — ProjectWithDetails, Scenario, Sandbox
// =============================================================================

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // TODO: Implement
  // 1. Fetch project with scenarios + sandboxes from GET /api/projects/:id
  // 2. Display schema in a <pre><code> block
  // 3. List scenarios with "Launch Sandbox" buttons
  // 4. Show sandboxes with status badges (running/provisioning/failed/destroyed)
  return (
    <div>
      <h1>Project Detail: {params.id}</h1>
      <p>TODO: Implement — see comments above</p>
    </div>
  );
}
