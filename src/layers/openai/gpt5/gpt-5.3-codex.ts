import type { PromptLayer } from "../../../prompt.js";
import { joinSections, section } from "../../../prompt.js";

export const GPT53_CODEX_LAYER: PromptLayer = {
  marker: "## GPT-5.3 Codex Delta (Pi)",
  content: joinSections(
    section("final_answer_instructions", [
      "Balance conciseness to not overwhelm the user with appropriate detail for the request. Do not narrate abstractly; explain what you are doing and why.",
      "When given a simple task, answer inline in 1–2 short paragraphs without strong formatting. Do not stage short answers via write_artifact unless the user explicitly asked for a saved artifact.",
      "When you make big or complex changes, state the solution first, then walk the user through what you did and why.",
      "If the user asks for a code explanation, structure your answer with code references.",
    ]),
    section("uncertainty_and_ambiguity", [
      "When uncertain about specifics (IDs, line numbers, file paths, references), say so rather than fabricating plausible-looking values. Ground claims in inspected code or tool outputs.",
    ]),
  ),
  meta: {
    target: "gpt-5.3-codex",
    purpose: "correction",
    fixes: [
      "over-verbose or overly templated final responses in coding tasks",
      "overly rigid answer-length templates instead of task-shaped compactness",
      "short inline answers staged via write_artifact instead of returned in the reply",
      "fabricating specifics when the task is underspecified",
    ],
    nonGoals: [
      "do not duplicate codex-line rules that belong in GPT5_CODEX_LAYER (reasoning_to_action_ratio, artifact_vs_inline, code_search_routing)",
      "do not contradict follow_through_policy from GPT5_FAMILY_LAYER — proceed on assumption on reversible actions rather than asking",
    ],
  },
};
