import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import YAML from "yaml";
import { loadCorpusIndex, loadCorpusDocument } from "../../../engine/corpus-loader.js";
import { getNamespaceRoot } from "../../../engine/corpus-registry.js";
import { INDUSTRY_CATEGORIES, getIndustryRule } from "../data.js";

type CorpusIndustryRule = {
  industry: string;
  primaryStyle: string;
  secondaryStyle: string;
  mustHave: string[];
  neverUse: string[];
  colorMood: string;
  emotionalTarget: string;
};

function loadCorpusIndustryRule(repoRoot: string, industry: string): CorpusIndustryRule | null {
  const index = loadCorpusIndex(repoRoot);
  const root = getNamespaceRoot(index, "frontend.designer");
  const registry = YAML.parse(readFileSync(join(repoRoot, root, "index.yaml"), "utf8")) as {
    industryRules?: Record<string, string>;
  };

  const path = registry.industryRules?.[industry];
  return path ? loadCorpusDocument<CorpusIndustryRule>(repoRoot, path) : null;
}

export function register(server: McpServer): void {
  server.tool(
    "designer_get_industry_rules",
    "Get design rules for an industry: primary/secondary style, must-have features, never-use patterns, color mood, emotional target",
    {
      industry: z.enum(INDUSTRY_CATEGORIES).describe("Industry category"),
    },
    async ({ industry }) => {
      const corpusRule = loadCorpusIndustryRule(process.cwd(), industry);
      const rule = getIndustryRule(industry);

      if (!corpusRule && !rule) {
        return {
          content: [{ type: "text", text: `Not found. Available: ${INDUSTRY_CATEGORIES.join(", ")}` }],
          isError: true,
        };
      }

      const source = corpusRule ?? rule!;

      let text = `# Industry Rules: ${source.industry}\n\n`;
      text += `**Primary style:** ${source.primaryStyle}\n`;
      text += `**Secondary style:** ${source.secondaryStyle}\n`;
      text += `**Color mood:** ${source.colorMood}\n`;
      text += `**Emotional target:** ${source.emotionalTarget}\n\n`;
      if (corpusRule) text += `**Corpus Source:** frontend.designer\n\n`;

      text += `## Must Have\n`;
      for (const item of source.mustHave) text += `- ${item}\n`;

      text += `\n## Never Use\n`;
      for (const item of source.neverUse) text += `- ${item}\n`;

      return { content: [{ type: "text", text }] };
    }
  );
}
