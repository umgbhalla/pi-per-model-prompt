import { describe, expect, it } from "vitest";
import { resolveLayersForModelId } from "../src/resolve.js";

describe("resolveLayersForModelId", () => {
  it("returns the harness core layer for unsupported models", () => {
    const markers = resolveLayersForModelId("mistral-large").map((layer) => layer.marker);

    expect(markers).toEqual([
      "## Pi Harness Core Append (Pi)",
    ]);
  });

  it("returns the harness core layer when model id is missing", () => {
    const markers = resolveLayersForModelId().map((layer) => layer.marker);

    expect(markers).toEqual([
      "## Pi Harness Core Append (Pi)",
    ]);
  });

  it("resolves the Claude layer stack", () => {
    const markers = resolveLayersForModelId("claude-sonnet-4-5-20250514").map((layer) => layer.marker);

    expect(markers).toEqual([
      "## Pi Harness Core Append (Pi)",
      "## Anthropic Claude Family Base (Pi)",
      "## Anthropic Claude Coding Agent (Pi)",
    ]);
  });

  it("resolves Claude for all series variants", () => {
    for (const id of ["claude-opus-4-6", "claude-haiku-4-5-20251001", "opus-4-6"]) {
      const markers = resolveLayersForModelId(id).map((layer) => layer.marker);
      expect(markers).toEqual([
        "## Pi Harness Core Append (Pi)",
        "## Anthropic Claude Family Base (Pi)",
        "## Anthropic Claude Coding Agent (Pi)",
      ]);
    }
  });

  it("resolves the GPT-5.4 baseline stack", () => {
    const markers = resolveLayersForModelId("gpt-5.4").map((layer) => layer.marker);

    expect(markers).toEqual([
      "## Pi Harness Core Append (Pi)",
      "## OpenAI GPT-5 Family Base (Pi)",
      "## GPT-5.4 Delta (Pi)",
    ]);
  });

  it("resolves codex layers in deterministic order", () => {
    const markers = resolveLayersForModelId("gpt-5.4-codex").map((layer) => layer.marker);

    expect(markers).toEqual([
      "## Pi Harness Core Append (Pi)",
      "## OpenAI GPT-5 Family Base (Pi)",
      "## OpenAI GPT-5 Codex Base (Pi)",
      "## GPT-5.4 Delta (Pi)",
    ]);
  });

  it("adds the exact-model delta for gpt-5.3-codex", () => {
    const markers = resolveLayersForModelId("gpt-5.3-codex").map((layer) => layer.marker);

    expect(markers).toEqual([
      "## Pi Harness Core Append (Pi)",
      "## OpenAI GPT-5 Family Base (Pi)",
      "## OpenAI GPT-5 Codex Base (Pi)",
      "## GPT-5.3 Codex Delta (Pi)",
    ]);
  });
});
