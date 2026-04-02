import type { PromptLayer } from "../../../prompt.js";
import { joinSections, section } from "../../../prompt.js";

export const GPT5_CODEX_LAYER: PromptLayer = {
  marker: "## OpenAI GPT-5 Codex Base (Pi)",
  content: joinSections(
    section("implementation_reporting", [
      "For implementation tasks, the final response should cover: What changed, Where, Verified, and Risks or Notes.",
      "Run the fastest relevant checks when feasible.",
      "If verification was not run or could not be completed, say so explicitly.",
    ]),
    section("codex_scope_reinforcement", [
      "Minimal diff does not mean incomplete — finish the job across all affected files, but do not go beyond the request.",
      "Follow existing repository conventions unless the local code clearly requires a different fix.",
    ]),
  ),
  meta: {
    target: "gpt-5-codex-line",
    purpose: "correction",
    fixes: [
      "overly literal or over-narrow code changes that stop at the first local edit",
      "incomplete or missing implementation summaries",
    ],
    nonGoals: [
      "do not restate harness-core scope, grounding, or safety rules — those apply to every model",
      "do not encode exact-model quirks that belong in gpt-5.3-codex or future model-specific deltas",
    ],
  },
};
