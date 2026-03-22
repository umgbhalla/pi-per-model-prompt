import { describe, expect, it } from "vitest";
import { appendOnce, applyLayers, section } from "../src/prompt.js";

describe("prompt helpers", () => {
  it("renders section blocks as bullet lists", () => {
    expect(section("sample", ["a", "b"]))
      .toBe("<sample>\n- a\n- b\n</sample>");
  });

  it("appends a layer only once", () => {
    const layer = {
      marker: "## Marker",
      content: "<sample>\n- rule\n</sample>",
    };
    const first = appendOnce("BASE", layer);
    const second = appendOnce(first, layer);

    expect(first).toContain("## Marker");
    expect(second).toBe(first);
  });

  it("applies multiple layers in order", () => {
    const prompt = applyLayers("BASE", [
      { marker: "## One", content: "one" },
      { marker: "## Two", content: "two" },
    ]);

    expect(prompt).toContain("BASE\n\n## One\n\none\n\n## Two\n\ntwo");
  });
});
