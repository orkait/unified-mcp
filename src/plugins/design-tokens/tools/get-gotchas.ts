import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";
import { loadCorpusIndex, loadCorpusDocument } from "../../../engine/corpus-loader.js";
import { getNamespaceRoot } from "../../../engine/corpus-registry.js";
import { getAllGotchas } from "../data.js";

type CorpusTokenCategory = {
  name: string;
  gotchas: string[];
};

function loadCorpusGotchas(repoRoot: string): { source: string; gotcha: string }[] {
  const index = loadCorpusIndex(repoRoot);
  const root = getNamespaceRoot(index, "frontend.design-tokens");
  const registry = YAML.parse(readFileSync(join(repoRoot, root, "index.yaml"), "utf8")) as {
    categories: Record<string, string>;
  };

  const gotchas: { source: string; gotcha: string }[] = [];
  for (const path of Object.values(registry.categories)) {
    const category = loadCorpusDocument<CorpusTokenCategory>(repoRoot, path);
    for (const gotcha of category.gotchas) {
      gotchas.push({ source: "frontend.design-tokens", gotcha });
    }
  }

  return gotchas;
}

export function register(server: McpServer): void {
  server.tool(
    "design_tokens_get_gotchas",
    "List all common design token mistakes and fixes across all categories",
    {},
    async () => {
      const gotchas = [...loadCorpusGotchas(process.cwd()), ...getAllGotchas()];

      let text = "# Design Token Gotchas\n\nCommon mistakes that break token systems:\n\n";

      const bySource: Record<string, string[]> = {};
      for (const { source, gotcha } of gotchas) {
        if (!bySource[source]) bySource[source] = [];
        bySource[source].push(gotcha);
      }

      for (const [source, items] of Object.entries(bySource)) {
        text += `## ${source}\n`;
        for (const item of items) text += `- ${item}\n`;
        text += "\n";
      }

      return { content: [{ type: "text", text }] };
    }
  );
}
