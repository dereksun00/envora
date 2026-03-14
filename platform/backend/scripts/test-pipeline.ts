// =============================================================================
// Pipeline End-to-End Test Script
// =============================================================================
// Run with: npm run test:pipeline
//
// Creates a project + scenario + sandbox, calls the provisioner,
// and opens the result in a browser.
//
// Use this BEFORE writing any UI code to verify the pipeline works.
// The CRM should load with realistic data and support full CRUD.
// =============================================================================

async function main() {
  // TODO: Implement
  // 1. Create a project record with:
  //    - name: "Demo CRM"
  //    - dockerImage: "yourname/demo-crm:latest"
  //    - schema: contents of test-fixtures/demo-crm-schema.prisma
  //    - schemaFormat: "prisma"
  //    - appPort: 3000
  //
  // 2. Create a scenario with:
  //    - name: "Enterprise Demo"
  //    - prompt: from test-fixtures/demo-scenario.json
  //    - demoUsers: from test-fixtures/demo-scenario.json
  //
  // 3. Create a sandbox record
  //
  // 4. Call provision(sandbox.id)
  //
  // 5. Wait for completion, print sandbox URL
  //
  // 6. Open URL in browser (optional: use `open` command)

  console.log("Pipeline test not yet implemented");
}

main().catch(console.error);
