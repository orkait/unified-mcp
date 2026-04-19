# Topology Routing And Artifact Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make topology the active runtime authority for agent routing, skill enforcement, and typed artifact handoffs instead of passive configuration.

**Architecture:** Extend the current topology manifest with artifact contract definitions and route policies, then build a runtime layer that can validate artifacts, choose the right agent for a request, enforce allowed skills/bundles, and expose those capabilities through new CLI commands. Keep existing local tool execution intact and layer routing on top of it rather than rewriting the tool bridge.

**Tech Stack:** TypeScript, Bun, Zod, YAML, existing `src/engine/*`, existing `src/cli.ts`, generated topology/runtime artifacts, Bun test

---

## File Structure Lock-In

### New Files

- `topology/artifacts/task_handoff.yaml`
- `topology/artifacts/design_contract.yaml`
- `topology/artifacts/build_result.yaml`
- `topology/artifacts/verification_report.yaml`
- `topology/routes/defaults.yaml`
- `src/engine/artifact-loader.ts`
- `src/engine/artifact-validator.ts`
- `src/engine/router.ts`
- `src/engine/skill-enforcer.ts`
- `tests/artifact-contracts-behaviour.test.ts`
- `tests/router-behaviour.test.ts`
- `tests/local-cli-routing-behaviour.test.ts`

### Files To Modify

- `topology/manifest.yaml`
- `src/engine/contracts.ts`
- `src/engine/topology-loader.ts`
- `src/engine/policy.ts`
- `src/engine/resolver.ts`
- `src/engine/navigation.ts`
- `src/cli.ts`
- `scripts/generate-topology-artifacts.ts`
- `generated/routing/allow-deny.md`
- `generated/runtime-context/topology.bootstrap.md`
- `tests/topology-artifacts-behaviour.test.ts`

### Responsibility Boundaries

- `topology/artifacts/` defines handoff schemas and proof expectations.
- `topology/routes/` defines request-to-agent defaults and domain preference rules.
- `src/engine/artifact-*` owns schema loading and validation only.
- `src/engine/router.ts` owns agent selection and strictest-proof computation.
- `src/engine/skill-enforcer.ts` owns allowed-skill checks for an already-routed agent.
- `src/cli.ts` remains a thin transport layer over engine functions.

---

### Task 1: Add Artifact Definitions To Topology And Load Them

**Files:**
- Modify: `topology/manifest.yaml`
- Create: `topology/artifacts/task_handoff.yaml`
- Create: `topology/artifacts/design_contract.yaml`
- Create: `topology/artifacts/build_result.yaml`
- Create: `topology/artifacts/verification_report.yaml`
- Create: `topology/routes/defaults.yaml`
- Modify: `src/engine/contracts.ts`
- Modify: `src/engine/topology-loader.ts`
- Test: `tests/topology-manifest-behaviour.test.ts`

- [ ] **Step 1: Extend the failing topology test with artifact and route expectations**

```ts
import { expect, test } from "bun:test";
import { loadTopology } from "../src/engine/topology-loader.ts";

test("loadTopology reads artifact contracts and route defaults", () => {
  const topology = loadTopology(process.cwd());

  expect(topology.artifacts.map((a) => a.id)).toEqual([
    "task_handoff",
    "design_contract",
    "build_result",
    "verification_report",
  ]);
  expect(topology.routeDefaults.defaultAgent).toBe("hyper");
  expect(topology.routeDefaults.domainPreference.frontend).toBe("frontend-builder");
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `bun test tests/topology-manifest-behaviour.test.ts`
Expected: FAIL with `Cannot read properties of undefined` for `topology.artifacts` or `topology.routeDefaults`

- [ ] **Step 3: Add artifact and route files**

```yaml
# topology/artifacts/task_handoff.yaml
id: task_handoff
required_fields:
  - request_id
  - domain_targets
  - capability_targets
  - success_criteria
proof_mode: routing_only
```

```yaml
# topology/artifacts/design_contract.yaml
id: design_contract
required_fields:
  - visual_theme
  - color_system
  - typography
  - spacing
  - component_states
  - motion_rules
proof_mode: visual_contract
```

```yaml
# topology/routes/defaults.yaml
default_agent: hyper
domain_preference:
  frontend: frontend-builder
  backend: backend-builder
  shared: hyper
cross_domain_agent: fullstack-builder
strictest_proof_order:
  - routing_and_verification
  - executable
  - visual_and_behavioral
```

- [ ] **Step 4: Extend topology contracts**

```ts
// src/engine/contracts.ts
export interface ArtifactContract {
  id: string;
  requiredFields: string[];
  proofMode: string;
}

export interface RouteDefaults {
  defaultAgent: string;
  domainPreference: Record<string, string>;
  crossDomainAgent: string;
  strictestProofOrder: string[];
}

export interface LoadedTopology {
  version: 1;
  defaultTransport: "local-tools";
  entryAgent: string;
  domains: DomainPolicy[];
  agents: AgentPolicy[];
  bundles: BundlePolicy[];
  artifacts: ArtifactContract[];
  routeDefaults: RouteDefaults;
}
```

- [ ] **Step 5: Extend the loader to read artifacts and route defaults**

```ts
// src/engine/topology-loader.ts
interface ArtifactDocument {
  id: string;
  required_fields: string[];
  proof_mode: string;
}

interface RouteDefaultsDocument {
  default_agent: string;
  domain_preference: Record<string, string>;
  cross_domain_agent: string;
  strictest_proof_order: string[];
}

function mapArtifactDocument(doc: ArtifactDocument): ArtifactContract {
  return {
    id: doc.id,
    requiredFields: doc.required_fields,
    proofMode: doc.proof_mode,
  };
}

function mapRouteDefaultsDocument(doc: RouteDefaultsDocument): RouteDefaults {
  return {
    defaultAgent: doc.default_agent,
    domainPreference: doc.domain_preference,
    crossDomainAgent: doc.cross_domain_agent,
    strictestProofOrder: doc.strictest_proof_order,
  };
}

const artifacts = ["task_handoff", "design_contract", "build_result", "verification_report"].map((id) =>
  mapArtifactDocument(readYaml<ArtifactDocument>(join(repoRoot, "topology", "artifacts", `${id}.yaml`))),
);
const routeDefaults = mapRouteDefaultsDocument(
  readYaml<RouteDefaultsDocument>(join(repoRoot, "topology", "routes", "defaults.yaml")),
);
```

- [ ] **Step 6: Run the topology test and typecheck**

Run: `bun test tests/topology-manifest-behaviour.test.ts && bun run build`
Expected: PASS, with artifact and route-default assertions green

- [ ] **Step 7: Commit**

```bash
git add topology/manifest.yaml topology/artifacts topology/routes src/engine/contracts.ts src/engine/topology-loader.ts tests/topology-manifest-behaviour.test.ts
git commit -m "feat: add topology artifact contracts and route defaults"
```

---

### Task 2: Implement Typed Artifact Validation

**Files:**
- Create: `src/engine/artifact-loader.ts`
- Create: `src/engine/artifact-validator.ts`
- Test: `tests/artifact-contracts-behaviour.test.ts`

- [ ] **Step 1: Write the failing artifact validation test**

```ts
import { expect, test } from "bun:test";
import { loadTopology } from "../src/engine/topology-loader.ts";
import { validateArtifactPayload } from "../src/engine/artifact-validator.ts";

test("validateArtifactPayload accepts a complete task_handoff", () => {
  const topology = loadTopology(process.cwd());
  const result = validateArtifactPayload(topology, "task_handoff", {
    request_id: "req-1",
    domain_targets: ["frontend"],
    capability_targets: ["design.intent"],
    success_criteria: ["produce design contract"],
  });

  expect(result.ok).toBe(true);
});

test("validateArtifactPayload rejects missing design_contract fields", () => {
  const topology = loadTopology(process.cwd());
  const result = validateArtifactPayload(topology, "design_contract", {
    visual_theme: "dark",
    color_system: "brand + neutral",
  });

  expect(result.ok).toBe(false);
  expect(result.missingFields).toContain("typography");
  expect(result.missingFields).toContain("component_states");
});
```

- [ ] **Step 2: Run the artifact test to verify it fails**

Run: `bun test tests/artifact-contracts-behaviour.test.ts`
Expected: FAIL with `Cannot find module "../src/engine/artifact-validator.ts"`

- [ ] **Step 3: Add the artifact loader**

```ts
// src/engine/artifact-loader.ts
import type { ArtifactContract, LoadedTopology } from "./contracts.js";

export function getArtifactContract(topology: LoadedTopology, artifactId: string): ArtifactContract {
  const artifact = topology.artifacts.find((entry) => entry.id === artifactId);
  if (!artifact) {
    throw new Error(`Unknown artifact contract: ${artifactId}`);
  }
  return artifact;
}
```

- [ ] **Step 4: Implement payload validation**

```ts
// src/engine/artifact-validator.ts
import { getArtifactContract } from "./artifact-loader.js";
import type { LoadedTopology } from "./contracts.js";

export function validateArtifactPayload(
  topology: LoadedTopology,
  artifactId: string,
  payload: Record<string, unknown>,
) {
  const contract = getArtifactContract(topology, artifactId);
  const missingFields = contract.requiredFields.filter((field) => !(field in payload));

  return {
    ok: missingFields.length === 0,
    artifactId,
    proofMode: contract.proofMode,
    missingFields,
  };
}
```

- [ ] **Step 5: Run artifact validation tests and build**

Run: `bun test tests/artifact-contracts-behaviour.test.ts && bun run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/engine/artifact-loader.ts src/engine/artifact-validator.ts tests/artifact-contracts-behaviour.test.ts
git commit -m "feat: add typed artifact validation"
```

---

### Task 3: Add Topology Router With Strictest-Proof Resolution

**Files:**
- Create: `src/engine/router.ts`
- Modify: `src/engine/policy.ts`
- Test: `tests/router-behaviour.test.ts`

- [ ] **Step 1: Write the failing router test**

```ts
import { expect, test } from "bun:test";
import { loadTopology } from "../src/engine/topology-loader.ts";
import { routeRequest } from "../src/engine/router.ts";

test("routeRequest sends frontend-only work to frontend-builder", () => {
  const topology = loadTopology(process.cwd());
  const route = routeRequest(topology, {
    requestId: "req-1",
    domainTargets: ["frontend"],
    capabilityTargets: ["design.intent"],
  });

  expect(route.agent.id).toBe("frontend-builder");
  expect(route.proofMode).toBe("visual_and_behavioral");
});

test("routeRequest sends mixed frontend+backend work to fullstack-builder", () => {
  const topology = loadTopology(process.cwd());
  const route = routeRequest(topology, {
    requestId: "req-2",
    domainTargets: ["frontend", "backend"],
    capabilityTargets: ["design.intent", "backend.http.patterns"],
  });

  expect(route.agent.id).toBe("fullstack-builder");
  expect(route.proofMode).toBe("visual_and_behavioral");
});
```

- [ ] **Step 2: Run the router test to verify it fails**

Run: `bun test tests/router-behaviour.test.ts`
Expected: FAIL with `Cannot find module "../src/engine/router.ts"`

- [ ] **Step 3: Add proof-order helper to policy**

```ts
// src/engine/policy.ts
export function getStrictestProofMode(order: string[], proofModes: string[]): string {
  const ranked = proofModes
    .map((mode) => ({ mode, index: order.indexOf(mode) }))
    .filter((entry) => entry.index >= 0)
    .sort((left, right) => right.index - left.index);

  if (ranked.length === 0) {
    throw new Error(`No proof mode could be ranked from: ${proofModes.join(", ")}`);
  }

  return ranked[0].mode;
}
```

- [ ] **Step 4: Implement route resolution**

```ts
// src/engine/router.ts
import type { LoadedTopology } from "./contracts.js";
import { getAgent, getDomain, getStrictestProofMode } from "./policy.js";

export function routeRequest(
  topology: LoadedTopology,
  input: {
    requestId: string;
    domainTargets: string[];
    capabilityTargets: string[];
  },
) {
  const uniqueDomains = [...new Set(input.domainTargets)];
  const routeAgentId =
    uniqueDomains.length > 1
      ? topology.routeDefaults.crossDomainAgent
      : topology.routeDefaults.domainPreference[uniqueDomains[0] ?? "shared"] ?? topology.routeDefaults.defaultAgent;

  const agent = getAgent(topology, routeAgentId);
  const proofMode = getStrictestProofMode(
    topology.routeDefaults.strictestProofOrder,
    uniqueDomains.map((domainId) => getDomain(topology, domainId).completionProof),
  );

  return {
    requestId: input.requestId,
    agent,
    proofMode,
    domains: uniqueDomains,
    capabilityTargets: input.capabilityTargets,
  };
}
```

- [ ] **Step 5: Run routing tests and build**

Run: `bun test tests/router-behaviour.test.ts && bun run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/engine/policy.ts src/engine/router.ts tests/router-behaviour.test.ts
git commit -m "feat: add topology router with strictest proof resolution"
```

---

### Task 4: Enforce Allowed Skills For Routed Agents

**Files:**
- Create: `src/engine/skill-enforcer.ts`
- Modify: `src/engine/router.ts`
- Test: `tests/router-behaviour.test.ts`

- [ ] **Step 1: Extend the router test with skill enforcement**

```ts
import { expect, test } from "bun:test";
import { loadTopology } from "../src/engine/topology-loader.ts";
import { assertSkillAllowedForAgent } from "../src/engine/skill-enforcer.ts";
import { routeRequest } from "../src/engine/router.ts";

test("assertSkillAllowedForAgent rejects backend-only review skill on frontend-builder", () => {
  const topology = loadTopology(process.cwd());
  const route = routeRequest(topology, {
    requestId: "req-3",
    domainTargets: ["frontend"],
    capabilityTargets: ["design.intent"],
  });

  expect(() => assertSkillAllowedForAgent(route.agent, "security-review")).toThrow(/not allowed/i);
});

test("assertSkillAllowedForAgent accepts designer for frontend-builder", () => {
  const topology = loadTopology(process.cwd());
  const route = routeRequest(topology, {
    requestId: "req-4",
    domainTargets: ["frontend"],
    capabilityTargets: ["design.intent"],
  });

  expect(() => assertSkillAllowedForAgent(route.agent, "designer")).not.toThrow();
});
```

- [ ] **Step 2: Run the router test to verify it fails**

Run: `bun test tests/router-behaviour.test.ts`
Expected: FAIL with `Cannot find module "../src/engine/skill-enforcer.ts"`

- [ ] **Step 3: Add the skill enforcer**

```ts
// src/engine/skill-enforcer.ts
import type { AgentPolicy } from "./contracts.js";

export function assertSkillAllowedForAgent(agent: AgentPolicy, skillName: string): void {
  if (!agent.allowedSkills.includes(skillName)) {
    throw new Error(`Skill ${skillName} is not allowed for agent ${agent.id}`);
  }
}
```

- [ ] **Step 4: Run tests and build**

Run: `bun test tests/router-behaviour.test.ts && bun run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/skill-enforcer.ts tests/router-behaviour.test.ts
git commit -m "feat: enforce allowed skills for routed agents"
```

---

### Task 5: Expose Routing And Artifact Validation Through CLI

**Files:**
- Modify: `src/cli.ts`
- Test: `tests/local-cli-routing-behaviour.test.ts`

- [ ] **Step 1: Write the failing CLI routing test**

```ts
import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

test("CLI route command returns the routed agent and proof mode", () => {
  const result = spawnSync(
    process.execPath,
    [
      resolve("bin/hyperstack.mjs"),
      "route",
      "--json",
      '{"requestId":"req-1","domainTargets":["frontend"],"capabilityTargets":["design.intent"]}',
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );

  expect(result.status).toBe(0);
  expect(result.stdout).toMatch(/frontend-builder/);
  expect(result.stdout).toMatch(/visual_and_behavioral/);
});

test("CLI artifact validate command reports missing fields", () => {
  const result = spawnSync(
    process.execPath,
    [
      resolve("bin/hyperstack.mjs"),
      "artifact",
      "validate",
      "design_contract",
      "--json",
      '{"visual_theme":"dark"}',
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );

  expect(result.status).toBe(0);
  expect(result.stdout).toMatch(/missingFields/);
  expect(result.stdout).toMatch(/typography/);
});
```

- [ ] **Step 2: Run the CLI test to verify it fails**

Run: `bun test tests/local-cli-routing-behaviour.test.ts`
Expected: FAIL because `src/cli.ts` only supports `tool`

- [ ] **Step 3: Extend `src/cli.ts`**

```ts
// src/cli.ts
import { loadTopology } from "./engine/topology-loader.js";
import { routeRequest } from "./engine/router.js";
import { validateArtifactPayload } from "./engine/artifact-validator.js";
import { invokeLocalTool } from "./adapters/local-tools/index.js";

const topology = loadTopology(process.cwd());

if (command === "tool") {
  // existing path unchanged
}

if (command === "route" && flag === "--json" && json) {
  const input = JSON.parse(json) as {
    requestId: string;
    domainTargets: string[];
    capabilityTargets: string[];
  };
  process.stdout.write(`${JSON.stringify(routeRequest(topology, input), null, 2)}\n`);
  process.exit(0);
}

if (command === "artifact" && process.argv[3] === "validate") {
  const artifactId = process.argv[4];
  const jsonFlag = process.argv[5];
  const jsonPayload = process.argv[6];
  const payload = JSON.parse(jsonPayload) as Record<string, unknown>;
  process.stdout.write(
    `${JSON.stringify(validateArtifactPayload(topology, artifactId, payload), null, 2)}\n`,
  );
  process.exit(0);
}
```

- [ ] **Step 4: Run CLI routing tests and build**

Run: `bun test tests/local-cli-routing-behaviour.test.ts && bun run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/cli.ts tests/local-cli-routing-behaviour.test.ts
git commit -m "feat: expose topology routing and artifact validation via cli"
```

---

### Task 6: Regenerate Topology Artifacts To Include Artifacts And Routing Rules

**Files:**
- Modify: `scripts/generate-topology-artifacts.ts`
- Modify: `tests/topology-artifacts-behaviour.test.ts`
- Modify: `generated/routing/allow-deny.md`
- Modify: `generated/runtime-context/topology.bootstrap.md`

- [ ] **Step 1: Extend the failing topology artifact test**

```ts
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("generated topology bootstrap includes artifact and route defaults", () => {
  const bootstrap = readFileSync(resolve("generated/runtime-context/topology.bootstrap.md"), "utf8");
  expect(bootstrap).toMatch(/task_handoff/);
  expect(bootstrap).toMatch(/design_contract/);
  expect(bootstrap).toMatch(/cross-domain agent: fullstack-builder/);
});
```

- [ ] **Step 2: Run the artifact test to verify it fails**

Run: `bun test tests/topology-artifacts-behaviour.test.ts`
Expected: FAIL because the generator does not emit artifact or route sections yet

- [ ] **Step 3: Extend the generator**

```ts
// scripts/generate-topology-artifacts.ts
writeFileSync(
  resolve("generated/runtime-context/topology.bootstrap.md"),
  [
    "# Topology Runtime Bootstrap",
    "",
    `Entry agent: ${topology.entryAgent}`,
    `Cross-domain agent: ${topology.routeDefaults.crossDomainAgent}`,
    "",
    "## Artifacts",
    ...topology.artifacts.map((artifact) => `- ${artifact.id}: ${artifact.proofMode}`),
    "",
    "## Agents",
    ...topology.agents.map((agent) => `- ${agent.id}: ${agent.kind} -> ${agent.domains.join(", ")}`),
    "",
    "## Bundles",
    ...topology.bundles.map((bundle) => `- ${bundle.id}: ${bundle.capabilities.join(", ")}`),
    "",
  ].join("\n"),
);
```

- [ ] **Step 4: Regenerate and verify**

Run: `bun run generate:topology && bun test tests/topology-artifacts-behaviour.test.ts && bun run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-topology-artifacts.ts generated/routing/allow-deny.md generated/runtime-context/topology.bootstrap.md tests/topology-artifacts-behaviour.test.ts
git commit -m "feat: generate topology route and artifact summaries"
```

---

## Spec Coverage Check

- Topology becomes active runtime authority: covered by Tasks 3, 4, and 5.
- Typed artifact contracts: covered by Tasks 1 and 2.
- Strictest touched-domain proof model: covered by Task 3.
- Skill enforcement by routed agent: covered by Task 4.
- CLI/runtime exposure for routing and validation: covered by Task 5.
- Generated topology artifacts expanded to reflect the new runtime semantics: covered by Task 6.

## Placeholder Scan

- No `TBD`, `TODO`, or deferred implementation placeholders are present.
- Every code-touching step contains concrete code.
- Every verification step includes an exact command and expected outcome.

## Type Consistency Check

- Artifact IDs are consistently `task_handoff`, `design_contract`, `build_result`, `verification_report`.
- Agent IDs stay `hyper`, `frontend-builder`, `backend-builder`, `fullstack-builder`.
- Bundle IDs stay `shared.system`, `frontend.design`, `frontend.react`, `backend.http`, `backend.lang.go`, `backend.lang.rust`.
- Proof mode names stay `routing_and_verification`, `executable`, `visual_and_behavioral`.

## Notes For Execution

- Keep using the existing local tool runtime from the previous phase; this plan adds routing/validation above it.
- Do not migrate deep corpus content in this phase; use topology authority first, corpus migration later.
- Keep commits small and phase-aligned exactly as listed.
