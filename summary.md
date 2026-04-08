# Hyperstack: The Evolution Summary

## 🎯 The Vision
The core objective of this project is to redefine the relationship between a human developer and an AI assistant. Instead of the AI being a simple "autocomplete" or "chat" tool, we have built **Hyperstack**: a unified engineering appliance that transforms an LLM into a disciplined **Senior Staff Engineer** with encyclopedic, deterministic knowledge of modern technology stacks (React Flow, Go, Rust, Motion, etc.).

---

## 🛠️ What We Have Accomplished

### 1. Monorepo Consolidation
We merged two fragmented repositories—`unified-mcp` (the data) and `unified-skill` (the persona)—into a single, high-cohesion repository. This ensures that the "Brain" and the "Body" of the AI are always in sync.

### 2. Radical Architectural Encapsulation
We moved away from a split directory structure. Now, every plugin is a self-contained module.
-   **Old:** Logic in `src/`, snippets in `/snippets`.
-   **New:** Everything (logic, tools, and raw data) lives inside `src/plugins/[name]/`.
-   **Data Integrity:** All snippets were renamed from `.md` to `.txt` to prevent accidental formatting by IDEs or linters, ensuring the AI always receives raw, accurate code.

### 3. Build-Free, Source-First Execution
We ripped out the legacy `tsc` compilation step and the `dist/` directory. 
-   The server now runs directly from `src/index.ts` using `tsx`.
-   This allows for **instant iteration**: any change to a snippet or a tool is immediately reflected in the AI's behavior without needing a build command.

### 4. "Agent-First" Installation Pipeline
We designed the most modern installation flow available for MCP servers:
-   **Zero-Install Docker:** GitHub Actions automatically build and publish the server to `ghcr.io`.
-   **Dynamic Discovery (`install.md`):** We created a dedicated, environment-aware `install.md` file. 
-   **The Raw Prompt:** Users can now simply prompt their AI: *"Fetch and follow instructions from [Raw URL to install.md]"*. The AI then autonomously clones the skill, updates the MCP config, and verifies the environment (Cursor, Claude Code, etc.) without human intervention.

### 5. Integration of Engineering Discipline
We bundled 5 core, custom-built engineering skills as static reference documents:
-   **Engineering Discipline:** Forces architectural reasoning before syntax.
-   **Behaviour Analysis:** Ensures UI/UX and state-machine correctness.
-   **Security Review:** Enforces OWASP-level code auditing.
-   **Design Patterns:** Encourages Clean Code and Pragmatic patterns.
-   **Readme Writer:** Ensures high-signal, evidence-based documentation.

### 6. The Cognitive Bootloader (`SKILL.md`)
The master `SKILL.md` was rebuilt from a passive tool list into an aggressive **cognitive governor**. It mandates:
-   **The Iron Law:** Non-negotiable verification of ground-truth data.
-   **Phase-Gating:** A strict 4-phase state machine (Discovery -> Reasoning -> Execution -> Verification) that the AI must follow for every task.
-   **Negative Doubt:** A requirement for the AI to identify potential failure modes before implementation.

---

## 🧠 The "Why" Behind the Design

-   **Why .txt instead of .md?** To treat code snippets as data, not prose. It prevents "linter-induced hallucinations."
-   **Why no dist/ folder?** In the age of AI agents, speed of context loading is everything. Running from source is the only way to ensure the AI isn't reading stale artifacts.
-   **Why bundled skills?** An AI with data but no discipline is a "Junior with a search engine." An AI with discipline but no data is a "Senior without a keyboard." Hyperstack provides both.
-   **Why install.md?** Every AI "harness" (IDE/CLI) is different. We abstracted the installation logic so the AI can decide *how* to install itself based on the system it detects.

---

## 🚀 Status: v1.0.0 Released
Hyperstack is now a professional, agent-native appliance. It is ready to be used as the definitive foundation for AI-driven software engineering.
