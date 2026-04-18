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

    expect(prompt).toContain("When given a simple task, answer inline in 1–2 short paragraphs without strong formatting.");
    expect(prompt).toContain("When you make big or complex changes, state the solution first, then walk the user through what you did and why.");
    expect(prompt).toContain("Do not begin responses with conversational interjections, acknowledgements, or framing phrases.");
    expect(prompt).toContain("When uncertain about specifics (IDs, line numbers, file paths, references), say so rather than fabricating plausible-looking values.");
  });

  it("GPT-5.3-codex no longer asks clarifying questions (conflicts with family follow_through_policy)", () => {
    const prompt = combinedLayerContent("gpt-5.3-codex");

    expect(prompt).not.toContain("ask 1-2 precise questions or present 2-3 interpretations");
  });

  it("codex-line layer adds reasoning-to-action, artifact-vs-inline, and code-search-routing rules for codex variants", () => {
    const prompt = combinedLayerContent("gpt-5.3-codex");

    expect(prompt).toContain("## OpenAI GPT-5 Codex Line (Pi)");
    expect(prompt).toContain("Do not burn long inference rounds preparing one large output.");
    expect(prompt).toContain("Use write_artifact only when the material is explicitly asked to be saved");
    expect(prompt).toContain("Use tff-fff_find for filename/path search and tff-fff_grep for content search.");
  });

  it("GPT-5 family adds parallel tool use, bash discipline, edit preconditions, edit shape, loop stop, and subagent concurrency", () => {
    const prompt = combinedLayerContent("gpt-5.4");

    expect(prompt).toContain("<parallel_tool_use>");
    expect(prompt).toContain("<bash_discipline>");
    expect(prompt).toContain("<edit_preconditions>");
    expect(prompt).toContain("<edit_shape>");
    expect(prompt).toContain("<loop_stop_rule>");
    expect(prompt).toContain("<subagent_concurrency>");
    expect(prompt).toContain("exit code 1 with empty stdout means 'no match'");
  });

  it("GPT-5.4 closing_brevity and split tool_persistence phrasing", () => {
    const prompt = combinedLayerContent("gpt-5.4");

    expect(prompt).toContain("<closing_brevity>");
    expect(prompt).toContain("Continue working until the task is complete or a blocker requires user input.");
    expect(prompt).not.toContain("Keep calling tools until the task is complete and final checks pass.");
  });
});
