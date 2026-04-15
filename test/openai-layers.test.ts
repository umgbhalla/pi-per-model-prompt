import { describe, expect, it } from "vitest";
import { resolveLayersForModelId } from "../src/resolve.js";

function combinedLayerContent(modelId: string): string {
  return resolveLayersForModelId(modelId)
    .map((layer) => `${layer.marker}\n${layer.content}`)
    .join("\n\n");
}

describe("OpenAI GPT-5 prompt layers", () => {
  it("matches the GPT-5.4 official answer-shape guidance more closely", () => {
    const prompt = combinedLayerContent("gpt-5.4-codex");

    expect(prompt).toContain("Always favor conciseness in your final answer");
    expect(prompt).toContain("Do not default to bullets.");
    expect(prompt).toContain("Do not begin responses with conversational interjections or meta commentary.");
    expect(prompt).not.toContain("What changed, Where, Verified, and Risks or Notes.");
  });

  it("matches the GPT-5.3-codex official compactness guidance more closely", () => {
    const prompt = combinedLayerContent("gpt-5.3-codex");

    expect(prompt).toContain("When given a simple task, just provide the outcome in a short answer without strong formatting.");
    expect(prompt).toContain("When you make big or complex changes, state the solution first, then walk the user through what you did and why.");
    expect(prompt).toContain("Do not begin responses with conversational interjections or meta commentary.");
    expect(prompt).not.toContain("Default to 3-6 sentences or at most 5 bullets.");
    expect(prompt).not.toContain("What changed, Where, Verified, and Risks or Notes.");
  });
});
