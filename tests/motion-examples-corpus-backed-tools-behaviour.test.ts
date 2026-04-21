import { expect, test } from "bun:test";
import { captureTool, extractTextContent } from "./helpers";
import { register as registerMotionExamples } from "../src/plugins/motion/tools/get-examples.ts";

const motionGetExamples = captureTool(registerMotionExamples);

test("motion_get_examples prefers corpus metadata for scroll", async () => {
  const result = await motionGetExamples.invoke({ category: "scroll" });
  const text = extractTextContent(result);

  expect(text).toContain("# Scroll Examples");
  expect(text).toContain("Scroll progress rail");
  expect(text).toContain("**Corpus Source:** frontend.motion");
  expect(text).toContain('import { motion, useScroll, useSpring } from "motion/react"');
});

test("motion_get_examples falls back to in-file data for layout", async () => {
  const result = await motionGetExamples.invoke({ category: "layout" });
  const text = extractTextContent(result);

  expect(text).toContain("# Layout Examples");
  expect(text).toContain("Layout animation");
  expect(text).not.toContain("**Corpus Source:** frontend.motion");
});
