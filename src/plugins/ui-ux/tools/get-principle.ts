import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import YAML from "yaml";
import { loadCorpusIndex, loadCorpusDocument } from "../../../engine/corpus-loader.js";
import { getNamespaceRoot } from "../../../engine/corpus-registry.js";
import { PRINCIPLES } from "../data.js";

type CorpusPrinciple = {
  name: string;
  domain: string;
  rule: string;
  detail: string;
  examples?: string[];
  antiPatterns?: string[];
};

function loadCorpusPrinciple(repoRoot: string, name: string): CorpusPrinciple | null {
  const index = loadCorpusIndex(repoRoot);
  const root = getNamespaceRoot(index, "frontend.ui-ux");
  const registry = YAML.parse(readFileSync(join(repoRoot, root, "index.yaml"), "utf8")) as {
    principles: Record<string, string>;
  };

  const path = registry.principles[name];
  return path ? loadCorpusDocument<CorpusPrinciple>(repoRoot, path) : null;
}

export function register(server: McpServer): void {
  server.tool(
    "ui_ux_get_principle",
    "Get full details for a UI/UX principle including examples, anti-patterns, and CSS examples",
    {
      name: z.string().describe("Principle name (e.g. 'type-scale', 'wcag-contrast', 'dark-mode-principles', 'touch-targets', 'easing-rules')"),
    },
    async ({ name }) => {
      const corpusPrinciple = loadCorpusPrinciple(process.cwd(), name.toLowerCase());
      const principle = PRINCIPLES.find(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      );

      if (!corpusPrinciple && !principle) {
        const available = PRINCIPLES.map((p) => p.name).join(", ");
        return {
          content: [{ type: "text", text: `Principle "${name}" not found.\n\nAvailable: ${available}` }],
          isError: true,
        };
      }

      const source = corpusPrinciple ?? principle!;
      let text = `# ${source.name} [${source.domain}]\n\n`;
      text += `**Rule:** ${source.rule}\n\n`;
      text += `${source.detail}\n\n`;
      if (corpusPrinciple) text += `**Corpus Source:** frontend.ui-ux\n\n`;

      if (!corpusPrinciple && principle?.cssExample) {
        text += `## CSS Example\n\`\`\`css\n${principle.cssExample}\n\`\`\`\n\n`;
      }

      if (source.examples?.length) {
        text += `## Examples\n`;
        for (const ex of source.examples) text += `- ${ex}\n`;
        text += "\n";
      }

      if (source.antiPatterns?.length) {
        text += `## Anti-patterns (avoid)\n`;
        for (const ap of source.antiPatterns) text += `- ❌ ${ap}\n`;
      }

      return { content: [{ type: "text", text }] };
    }
  );
}
