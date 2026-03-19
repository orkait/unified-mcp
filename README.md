<div align="center">

# unified-mcp

**One MCP server. All frontend libraries. No conflicts.**

<p>
  <a href="https://github.com/orkait/unified-mcp/actions/workflows/ci.yml"><img src="https://github.com/orkait/unified-mcp/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/orkait/unified-mcp/blob/main/LICENSE"><img src="https://img.shields.io/github/license/orkait/unified-mcp?color=blue" alt="License" /></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-6366f1?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMSAxNEg5VjhIMTF2OHptNCAwaC0yVjhoMnY4eiIvPjwvc3ZnPg==" alt="MCP" /></a>
  <a href="https://www.npmjs.com/package/@xyflow/react"><img src="https://img.shields.io/badge/@xyflow%2Freact-v12-22c55e?logo=npm" alt="React Flow v12" /></a>
  <a href="https://motion.dev"><img src="https://img.shields.io/badge/motion%2Freact-v12-f59e0b?logo=framer" alt="Motion v12" /></a>
  <a href="https://github.com/orkait/unified-mcp/stargazers"><img src="https://img.shields.io/github/stars/orkait/unified-mcp?style=social" alt="Stars" /></a>
</p>

<br/>

> Plugin-based MCP server that gives your AI assistant deep knowledge of frontend libraries -
> API refs, patterns, code generation - all through a single process with namespaced tools.

</div>

---

## 🧩 Plugins

| Plugin | Library | Tools | What's included |
|--------|---------|:-----:|-----------------|
| **reactflow** | [@xyflow/react](https://reactflow.dev) v12 | 8 | 56 APIs · 17 patterns · 3 templates · migration guide |
| **motion** | [Motion for React](https://motion.dev) v12 | 6 | 33 APIs · 14 example categories · transition reference |

---

## 🛠️ Tools

### ⚛️ React Flow - `reactflow_*`

| Tool | What it does |
|------|-------------|
| `reactflow_list_apis` | Browse all 56 APIs grouped by kind - components, hooks, utilities, types |
| `reactflow_get_api` | Full reference for any API: props table, usage snippet, examples, tips |
| `reactflow_search_docs` | Full-text search across all docs and code examples |
| `reactflow_get_examples` | Curated code examples by category |
| `reactflow_get_pattern` | Complete enterprise patterns with full implementation code |
| `reactflow_get_template` | Production-ready starters: `custom-node`, `custom-edge`, `zustand-store` |
| `reactflow_get_migration_guide` | v11 → v12 breaking changes with before/after diffs |
| `reactflow_generate_flow` | Generate a complete flow component from a plain English description |

<details>
<summary>17 available patterns</summary>

`zustand-store` · `undo-redo` · `drag-and-drop` · `auto-layout-dagre` · `auto-layout-elk` · `context-menu` · `copy-paste` · `save-restore` · `prevent-cycles` · `keyboard-shortcuts` · `performance` · `dark-mode` · `ssr` · `subflows` · `edge-reconnection` · `custom-connection-line` · `auto-layout-on-mount`

</details>

---

### 🎬 Motion for React - `motion_*`

| Tool | What it does |
|------|-------------|
| `motion_list_apis` | Browse all 33 APIs grouped by kind - components, hooks, functions |
| `motion_get_api` | Full reference for any API: props table, usage snippet, examples, tips |
| `motion_search_docs` | Full-text search across all docs and code examples |
| `motion_get_examples` | Curated animation examples by category |
| `motion_get_transitions` | Complete transition reference: tween, spring, inertia, orchestration |
| `motion_generate_animation` | Generate a Motion animation snippet from a plain English description |

<details>
<summary>14 example categories</summary>

`animation` · `gestures` · `scroll` · `layout` · `exit` · `drag` · `hover` · `svg` · `transitions` · `variants` · `keyframes` · `spring` · `reorder` · `performance`

</details>

---

### 📄 Resources

| Resource | URI | Description |
|----------|-----|-------------|
| React Flow cheatsheet | `reactflow://cheatsheet` | Quick reference for @xyflow/react v12 |
| Motion cheatsheet | `motion://react/cheatsheet` | Quick reference for motion/react v12 |

---

## 🚀 Install

### 🐳 Docker (recommended)

Build once, reuse forever. The wrapper script keeps **one** named container alive and runs each MCP session inside it via `docker exec` - no duplicate containers, no matter how many AI sessions are open.

```bash
git clone https://github.com/orkait/unified-mcp.git
cd unified-mcp
npm install && npm run build
docker build -t frontend-mcp .
```

Add to your MCP config:

<details>
<summary><strong>Claude Code</strong> - <code>~/.claude.json</code></summary>

```json
{
  "mcpServers": {
    "frontend-mcp": {
      "command": "/absolute/path/to/unified-mcp/scripts/start-mcp.sh"
    }
  }
}
```

</details>

<details>
<summary><strong>Claude Desktop / Cursor / Windsurf</strong> - their respective config files</summary>

```json
{
  "mcpServers": {
    "frontend-mcp": {
      "command": "/absolute/path/to/unified-mcp/scripts/start-mcp.sh"
    }
  }
}
```

</details>

---

### 📦 Without Docker (Node directly)

```bash
git clone https://github.com/orkait/unified-mcp.git
cd unified-mcp
npm install && npm run build
```

```json
{
  "mcpServers": {
    "frontend-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/unified-mcp/dist/index.js"]
    }
  }
}
```

---

## 💡 Why unified?

Running separate MCP servers per library means one Docker container per server at startup.
Two libraries = two containers. Ten libraries = ten containers - every session.

`unified-mcp` runs everything in **one process**. All plugins share the same server, same connection, same container.

Tool names are namespaced per plugin (`reactflow_list_apis` vs `motion_list_apis`) so there are zero naming conflicts - the LLM always knows which library a tool belongs to.

---

## 🔌 Adding a Plugin

1. Create `src/plugins/<name>/` with:
   - `data.ts` or `data/` - your library's reference data (keep code examples in `snippets/<name>/`)
   - `tools/<tool-name>.ts` - one file per tool, each exporting `register(server)`; prefix all tool names with `<name>_`
   - `index.ts` - export `const <name>Plugin: Plugin = { name: "<name>", register }`

2. Register in `src/index.ts`:
   ```typescript
   import { shadcnPlugin } from "./plugins/shadcn/index.js";
   loadPlugins(server, [reactflowPlugin, motionPlugin, shadcnPlugin]);
   ```

3. Rebuild and redeploy:
   ```bash
   npm run build
   docker build -t frontend-mcp .
   docker rm -f frontend-mcp-daemon   # next session recreates it
   ```

No changes to your MCP config required.

---

## 🏗️ Architecture

```
src/
├── index.ts               # Entry - creates McpServer, loads plugins, starts StdioTransport
├── registry.ts            # Plugin interface + loadPlugins()
└── plugins/
    ├── reactflow/
    │   ├── index.ts       # Exports reactflowPlugin
    │   ├── tools/         # One file per tool, all prefixed reactflow_*
    │   └── data/          # React Flow v12 API reference data
    └── motion/
        ├── index.ts       # Exports motionPlugin
        ├── tools/         # One file per tool, all prefixed motion_*
        └── data.ts        # Motion for React v12 API reference data

snippets/
├── reactflow/             # .md files loaded at runtime via snippet()
│   ├── examples/          # Per-API example code
│   ├── patterns/          # Enterprise pattern implementations
│   ├── templates/         # Production-ready starter templates
│   └── usage/             # Per-API usage snippets
└── motion/
    ├── examples/          # Per-API animation examples
    └── usage/             # Per-API usage snippets

scripts/
└── start-mcp.sh           # Single-container Docker wrapper
```

**Plugin interface:**
```typescript
export interface Plugin {
  name: string;
  register: (server: McpServer) => void;
}
```

---

## 🛠 Development

```bash
npm install
npm run build     # compile TypeScript → dist/
npm run dev       # watch mode
npm start         # run server directly
```

```bash
# Verify all tools are registered with correct prefixes
node --input-type=module <<'EOF'
import { reactflowPlugin } from './dist/plugins/reactflow/index.js';
import { motionPlugin } from './dist/plugins/motion/index.js';
const tools = [];
const fake = { tool: (n) => tools.push(n), resource: () => {} };
reactflowPlugin.register(fake);
motionPlugin.register(fake);
console.log('Tools:', tools);
EOF
```

---

## 📄 License

MIT © [Orkait](https://github.com/orkait)
