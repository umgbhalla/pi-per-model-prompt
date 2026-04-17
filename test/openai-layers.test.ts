import { describe, expect, it } from "vitest";
import { resolveLayersForModelId } from "../src/resolve.js";

function combinedLayerContent(modelId: string): string {
  return resolveLayersForModelId(modelId)
    .map((layer) => `${layer.marker}\n${layer.content}`)
    .join("\n\n");
}

describe("OpenAI GPT-5 prompt layers", () => {
  it("GPT-5.4 includes conciseness and response-opener corrections", () => {
    const prompt = combinedLayerContent("gpt-5.4-codex");

    expect(prompt).toContain("No cheerleading, motivational language, fluff, or filler.");
    expect(prompt).toContain("Use lists only when the content is inherently list-shaped");
    expect(prompt).toContain("Do not begin responses with conversational interjections, acknowledgements, or framing phrases.");
  });

  it("GPT-5.3-codex includes compactness and ambiguity handling", () => {
    const prompt = combinedLayerContent("gpt-5.3-codex");

    expect(prompt).toContain("When given a simple task, just provide the outcome in a short answer without strong formatting.");
    expect(prompt).toContain("When you make big or complex changes, state the solution first, then walk the user through what you did and why.");
    expect(prompt).toContain("Do not begin responses with conversational interjections, acknowledgements, or framing phrases.");
  });
});
