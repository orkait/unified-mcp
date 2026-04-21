import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { z } from "zod";
import { ALL_APIS, searchApis, getApiByName, formatApiReference } from "../data.js";

type CorpusIndex = {
  namespaces?: {
    "frontend.motion"?: {
      index?: string;
    };
  };
};

type CorpusNamespaceIndex = {
  namespace?: string;
  apis?: {
    motion?: {
      file?: string;
    };
  };
};

type CorpusApiEntry = {
  name?: string;
  kind?: string;
  description?: string;
  importPath?: string;
  props?: Array<{ name: string; type: string; description: string; default?: string }>;
  returns?: string;
  usage?: string;
  examples?: Array<{ title: string; code: string; description?: string; category: string }>;
  tips?: string[];
  relatedApis?: string[];
  source?: string;
};

const moduleDir = dirname(fileURLToPath(import.meta.url));
const corpusRoot = join(moduleDir, "../../../../corpus");
const corpusNamespace = "frontend.motion";

let cachedCorpusMotionApi: { api: CorpusApiEntry; source: string } | null | undefined;

function loadCorpusMotionApi(): { api: CorpusApiEntry; source: string } | null {
  if (cachedCorpusMotionApi !== undefined) {
    return cachedCorpusMotionApi;
  }

  try {
    const indexRaw = readFileSync(join(corpusRoot, "index.yaml"), "utf8");
    const index = YAML.parse(indexRaw) as CorpusIndex | null;
    const namespaceIndexPath = index?.namespaces?.[corpusNamespace]?.index;
    if (!namespaceIndexPath) {
      cachedCorpusMotionApi = null;
      return cachedCorpusMotionApi;
    }

    const namespaceRaw = readFileSync(join(corpusRoot, namespaceIndexPath), "utf8");
    const namespaceIndex = YAML.parse(namespaceRaw) as CorpusNamespaceIndex | null;
    const apiPath = namespaceIndex?.apis?.motion?.file;
    if (!apiPath) {
      cachedCorpusMotionApi = null;
      return cachedCorpusMotionApi;
    }

    const apiRaw = readFileSync(join(corpusRoot, "frontend/motion", apiPath), "utf8");
    const api = YAML.parse(apiRaw) as CorpusApiEntry | null;
    if (!api || api.name?.toLowerCase() !== "motion" || !api.usage || !api.importPath || !api.description || !api.kind) {
      cachedCorpusMotionApi = null;
      return cachedCorpusMotionApi;
    }

    cachedCorpusMotionApi = { api, source: corpusNamespace };
    return cachedCorpusMotionApi;
  } catch {
    cachedCorpusMotionApi = null;
    return cachedCorpusMotionApi;
  }
}

function getMotionApi(name: string) {
  if (name.toLowerCase() !== "motion") {
    return getApiByName(name);
  }

  const corpusEntry = loadCorpusMotionApi();
  if (corpusEntry) {
    return corpusEntry.api as Parameters<typeof formatApiReference>[0];
  }

  return getApiByName(name);
}

export function register(server: McpServer): void {
  server.tool(
    "motion_get_api",
    "Get detailed API reference for a specific Motion for React component, hook, or utility. Includes props, usage, examples, and tips.",
    {
      name: z.string().describe("API name (e.g., 'motion', 'AnimatePresence', 'useAnimate', 'useScroll', 'stagger', 'Reorder.Group')"),
    },
    async ({ name }) => {
      const corpusEntry = name.toLowerCase() === "motion" ? loadCorpusMotionApi() : null;
      const api = getMotionApi(name);
      if (!api) {
        const suggestions = searchApis(name).map((r) => r.api.name);
        return {
          content: [{ type: "text", text: `API "${name}" not found.${suggestions.length ? ` Did you mean: ${suggestions.join(", ")}?` : ""}\n\nAvailable APIs: ${ALL_APIS.map((a) => a.name).join(", ")}` }],
          isError: true,
        };
      }
      const rendered = formatApiReference(api);
      return {
        content: [
          {
            type: "text",
            text: corpusEntry ? `${rendered}\n**Corpus Source:** ${corpusEntry.source}` : rendered,
          },
        ],
      };
    },
  );
}
