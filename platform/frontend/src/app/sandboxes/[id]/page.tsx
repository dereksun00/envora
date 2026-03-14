// =============================================================================
// Page 5 — Sandbox Status (Most Important UI Page)
// =============================================================================
// Polls: GET /api/sandboxes/:id every 2 seconds
//
// Provisioning Step Indicator (the most visually impressive UI element):
//   1. "Creating database..."
//   2. "Applying schema..."
//   3. "Generating synthetic data..."
//   4. "Seeding database..."
//   5. "Launching application..."
//   6. "Waiting for app to be ready..."
//   7. "Ready!"
//
// Visual states per step:
//   - Spinner (animated) on the current step
//   - Checkmark (green) on completed steps
//   - Gray/dimmed on future steps
//
// When status === "running":
//   - Large, prominently clickable URL (opens in new tab)
//   - "Copy URL" button
//
// When status === "failed":
//   - Error message in red
//
// Always show:
//   - "Destroy Sandbox" button → DELETE /api/sandboxes/:id
//
// API spec: see platform/api-spec.yaml — GET /sandboxes/:id
// Types: see platform/shared/types.ts — Sandbox, ProvisioningStep
// =============================================================================

export default function SandboxStatusPage({
  params,
}: {
  params: { id: string };
}) {
  // TODO: Implement
  // 1. Poll GET /api/sandboxes/:id every 2 seconds
  // 2. Map sandbox.currentStep to the step indicator
  // 3. Show URL when running, error when failed
  // 4. Destroy button
  return (
    <div>
      <h1>Sandbox: {params.id}</h1>
      <p>TODO: Implement — see comments above</p>
    </div>
  );
}
