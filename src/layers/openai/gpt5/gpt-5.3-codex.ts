import type { PromptLayer } from "../../../prompt.js";
import { joinSections, section } from "../../../prompt.js";

export const GPT53_CODEX_LAYER: PromptLayer = {
  marker: "## GPT-5.3 Codex Delta (Pi)",
  content: joinSections(
    section("output_verbosity_spec", [
      "Default to 3-6 sentences or at most 5 bullets.",
      "For multi-file tasks: 1 overview sentence, then up to 5 bullets (What changed / Where / Risks / Next steps / Open questions).",
    ]),
    section("uncertainty_and_ambiguity", [
      "If the task is underspecified, ask 1-2 precise questions or present 2-3 interpretations with labeled assumptions — do not guess silently.",
      "When uncertain about specifics (IDs, line numbers, references), say so rather than fabricating plausible-looking values.",
    ]),
  ),
  meta: {
    target: "gpt-5.3-codex",
    purpose: "correction",
    fixes: [
      "over-verbose or overly templated final responses in coding tasks",
      "fabricating specifics when the task is underspecified",
    ],
    nonGoals: [
      "do not duplicate codex-line rules that already apply across the whole codex family",
    ],
  },
};
