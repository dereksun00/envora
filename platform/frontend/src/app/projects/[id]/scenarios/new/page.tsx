// =============================================================================
// Page 4 — Create Scenario
// =============================================================================
// Form fields:
//   - Scenario name (text)
//   - Prompt (textarea — natural language describing what data to generate)
//   - Demo users: add/remove list with fields: name, email, role
//
// On submit: POST /api/projects/:id/scenarios → navigate to /projects/[id]
//
// API spec: see platform/api-spec.yaml — POST /projects/:id/scenarios
// Types: see platform/shared/types.ts — CreateScenarioRequest, DemoUser
// =============================================================================

export default function CreateScenarioPage({
  params,
}: {
  params: { id: string };
}) {
  // TODO: Implement form with shadcn/ui components
  // The demo users section needs an "Add User" button that appends
  // a row with name/email/role inputs, and a remove button per row.
  return (
    <div>
      <h1>Create Scenario for Project: {params.id}</h1>
      <p>TODO: Implement — see comments above</p>
    </div>
  );
}
