import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import YAML from "yaml";
import { loadCorpusIndex, loadCorpusDocument } from "../../../engine/corpus-loader.js";
import { getNamespaceRoot } from "../../../engine/corpus-registry.js";
import { PERSONALITY_CLUSTERS, getPersonality } from "../data.js";

type CorpusPersonality = {
  cluster: string;
  description: string;
  exemplars: Array<{ name: string; signature: string }>;
  vocabulary: {
    colors: string;
    typography: string;
    radius: string;
    shadows: string;
    motion: string;
    density: string;
  };
  defaultMode: string;
};

function loadCorpusPersonality(repoRoot: string, cluster: string): CorpusPersonality | null {
  const index = loadCorpusIndex(repoRoot);
  const root = getNamespaceRoot(index, "frontend.designer");
  const registry = YAML.parse(readFileSync(join(repoRoot, root, "index.yaml"), "utf8")) as {
    personalities: Record<string, string>;
  };

  const path = registry.personalities[cluster];
  return path ? loadCorpusDocument<CorpusPersonality>(repoRoot, path) : null;
}

export function register(server: McpServer): void {
  server.tool(
    "designer_get_personality",
    "Get full personality profile: description, exemplars, visual vocabulary, mode, and CSS example",
    {
      cluster: z.enum(PERSONALITY_CLUSTERS).describe("Personality cluster name"),
    },
    async ({ cluster }) => {
      const corpusPersonality = loadCorpusPersonality(process.cwd(), cluster);
      const p = getPersonality(cluster);

      if (!corpusPersonality && !p) {
        return {
          content: [{ type: "text", text: `Not found. Available: ${PERSONALITY_CLUSTERS.join(", ")}` }],
          isError: true,
        };
      }

      const source = corpusPersonality ?? p!;

      let text = `# ${source.cluster}\n\n`;
      text += `${source.description}\n\n`;
      if (corpusPersonality) text += `**Corpus Source:** frontend.designer\n\n`;

      text += `## Exemplars\n`;
      for (const e of source.exemplars) {
        text += `- **${e.name}** - ${e.signature}\n`;
      }

      text += `\n## Visual Vocabulary\n`;
      text += `- **Colors:** ${source.vocabulary.colors}\n`;
      text += `- **Typography:** ${source.vocabulary.typography}\n`;
      text += `- **Radius:** ${source.vocabulary.radius}\n`;
      text += `- **Shadows:** ${source.vocabulary.shadows}\n`;
      text += `- **Motion:** ${source.vocabulary.motion}\n`;
      text += `- **Density:** ${source.vocabulary.density}\n`;

      text += `\n**Default mode:** ${source.defaultMode}\n`;

      if (p?.cssExample) {
        text += `\n## CSS Example\n\`\`\`css\n${p.cssExample}\n\`\`\`\n`;
      }

      return { content: [{ type: "text", text }] };
    }
  );
}
