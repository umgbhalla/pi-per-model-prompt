import { describe, expect, it } from "vitest";
import { inspectModelIdentity } from "../src/model-identity.js";

describe("inspectModelIdentity", () => {
  it("returns undefined for missing or blank ids", () => {
    expect(inspectModelIdentity()).toBeUndefined();
    expect(inspectModelIdentity("   ")).toBeUndefined();
  });

  it("parses GPT-5 family ids", () => {
    const identity = inspectModelIdentity("gpt-5.4");

    expect(identity).toMatchObject({
      rawId: "gpt-5.4",
      family: "gpt-5",
      version: { major: 5, minor: 4 },
    });
    expect([...identity!.tags]).toEqual([]);
  });

  it("parses codex tags from compound ids", () => {
    const identity = inspectModelIdentity(" GPT-5.3-Codex ");

    expect(identity).toMatchObject({
      rawId: "gpt-5.3-codex",
      family: "gpt-5",
      version: { major: 5, minor: 3 },
    });
    expect([...identity!.tags]).toEqual(["codex"]);
  });

  it("returns a non-family identity for unmatched model ids", () => {
    const identity = inspectModelIdentity("mistral-large");

    expect(identity?.rawId).toBe("mistral-large");
    expect(identity?.family).toBeUndefined();
    expect(identity?.series).toBeUndefined();
    expect([...identity!.tags]).toEqual([]);
  });

  it.each([
    ["claude-opus-4-6", "opus"],
    ["claude-sonnet-4-5-20250514", "sonnet"],
    ["claude-3-5-sonnet-20241022", "sonnet"],
    ["claude-haiku-4-5-20251001", "haiku"],
    ["opus-4-6", "opus"],
  ] as const)("parses Claude model id %s as series %s", (modelId, expectedSeries) => {
    const identity = inspectModelIdentity(modelId);

    expect(identity).toMatchObject({
      family: "claude",
      series: expectedSeries,
    });
    expect([...identity!.tags]).toEqual([]);
  });
});
