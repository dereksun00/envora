// =============================================================================
// Page 2 — Create Project
// =============================================================================
// Form fields:
//   - Project name (text)
//   - Docker image URL (text, e.g. "yourname/demo-crm:latest")
//   - Schema (textarea, monospace, tall — this is where you paste the Prisma schema)
//   - Schema format toggle: Prisma / SQL
//   - App port (number, default 3000)
//
// On submit: POST /api/projects → navigate to /projects/[id]
//
// During the demo, pre-fill with CRM values from clipboard.
//
// API spec: see platform/api-spec.yaml — POST /projects
// Types: see platform/shared/types.ts — CreateProjectRequest
// =============================================================================

export default function CreateProjectPage() {
  // TODO: Implement form with shadcn/ui components
  return (
    <div>
      <h1>Create Project</h1>
      <p>TODO: Implement — see comments above</p>
    </div>
  );
}
