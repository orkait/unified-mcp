import { expect, test } from "bun:test";
import { invokeRegisteredTool } from "../src/engine/tool-bridge.ts";
import { register as registerGetPractice } from "../src/plugins/golang/tools/get-practice.ts";
import { register as registerGetPrinciple } from "../src/plugins/ui-ux/tools/get-principle.ts";

test("golang_get_practice reads corpus-backed practice documents first", async () => {
  const result = await invokeRegisteredTool(registerGetPractice, {
    name: "error-wrapping",
  });

  expect(result.content?.[0]?.text).toMatch(/Always wrap errors with context/);
  expect(result.content?.[0]?.text).toMatch(/\*\*Corpus Source:\*\* backend\.golang/);
});

test("ui_ux_get_principle reads corpus-backed frontend knowledge first", async () => {
  const result = await invokeRegisteredTool(registerGetPrinciple, {
    name: "wcag-contrast",
  });

  expect(result.content?.[0]?.text).toMatch(/Body text: 4\.5:1/);
  expect(result.content?.[0]?.text).toMatch(/\*\*Corpus Source:\*\* frontend\.ui-ux/);
});
