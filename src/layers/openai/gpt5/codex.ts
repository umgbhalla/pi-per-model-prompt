import type { PromptLayer } from "../../../prompt.js";
import { joinSections, section } from "../../../prompt.js";

export const GPT5_CODEX_LAYER: PromptLayer = {
  marker: "## OpenAI GPT-5 Codex Line (Pi)",
  content: joinSections(
    section("reasoning_to_action_ratio", [
      "Do not burn long inference rounds preparing one large output. If the next action is a write or edit, plan in one sentence and execute — do not hold a fully composed document in-head and stream it out at the end of a 60–100s turn.",
      "Prefer several small writes/edits over one megawrite. The user wants iteration over polish on first attempt; stream progress so subsequent turns can react.",
    ]),
    section("artifact_vs_inline", [
      "Use write_artifact only when the material is explicitly asked to be saved, handed off to another agent, or persisted across sessions.",
      "For short answers that fit in the chat reply, answer inline. Do not stage short answers via write_artifact. If your body is under ~200 words, a brief inline response is correct; a separate artifact is overhead.",
    ]),
    section("code_search_routing", [
      "Use tff-fff_find for filename/path search and tff-fff_grep for content search. These are pre-truncated, frecency-ranked, and cheaper than bash.",
      "Reach for bash grep/find/ls/rg/fd only when piping into another process the dedicated tools cannot express (for example, xargs into a runner, test-output filtering). Not for plain recon.",
    ]),
  ),
  meta: {
    target: "gpt-5-codex-line",
    purpose: "correction",
    fixes: [
      "60–100s single-turn reasoning rounds before one-shot document writes (observed 6/14 slow-request instances)",
      "artifact-first default when an inline reply would serve better (observed in multiple short traces)",
      "bash grep/find/ls reconnaissance instead of dedicated search tools",
    ],
    nonGoals: [
      "do not restate parallel tool_use, bash discipline, edit preconditions, or loop stop rules from GPT5_FAMILY_LAYER",
      "do not duplicate harness-core scope, verbosity, or verification rules",
      "do not encode exact-version behavior (5.3-codex vs 5.4-codex) — those stay in per-version layers",
    ],
  },
};
