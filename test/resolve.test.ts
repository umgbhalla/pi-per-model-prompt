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

  it("resolves the Claude layer stack for non-opus series", () => {
    for (const id of ["claude-sonnet-4-5-20250514", "claude-haiku-4-5-20251001"]) {
      const markers = resolveLayersForModelId(id).map((layer) => layer.marker);
      expect(markers).toEqual([
        "## Pi Harness Core Append (Pi)",
        "## Anthropic Claude Family Base (Pi)",
        "## Anthropic Claude Coding Agent (Pi)",
      ]);
      expect(markers).not.toContain("## Anthropic Claude Opus Delta (Pi)");
    }
  });

  it("adds the Opus delta for every Opus id form", () => {
    for (const id of [
      "claude-opus-4-6",
      "claude-opus-4-7",
      "opus-4-6",
      "anthropic/claude-opus-4.7",
    ]) {
      const markers = resolveLayersForModelId(id).map((layer) => layer.marker);
      expect(markers).toEqual([
        "## Pi Harness Core Append (Pi)",
        "## Anthropic Claude Family Base (Pi)",
        "## Anthropic Claude Coding Agent (Pi)",
        "## Anthropic Claude Opus Delta (Pi)",
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

  it("resolves the GPT-5.4-codex stack without separate codex layer", () => {
    const markers = resolveLayersForModelId("gpt-5.4-codex").map((layer) => layer.marker);

    expect(markers).toEqual([
      "## Pi Harness Core Append (Pi)",
      "## OpenAI GPT-5 Family Base (Pi)",
      "## GPT-5.4 Delta (Pi)",
    ]);
  });

  it("adds the exact-model delta for gpt-5.3-codex", () => {
    const markers = resolveLayersForModelId("gpt-5.3-codex").map((layer) => layer.marker);

    expect(markers).toEqual([
      "## Pi Harness Core Append (Pi)",
      "## OpenAI GPT-5 Family Base (Pi)",
      "## GPT-5.3 Codex Delta (Pi)",
    ]);
  });
});
