import type { PromptLayer } from "../../../prompt.js";
import { joinSections, section } from "../../../prompt.js";

export const CLAUDE_FAMILY_LAYER: PromptLayer = {
  marker: "## Anthropic Claude Family Base (Pi)",
  content: joinSections(
    section("xml_structure_preference", [
      "Use XML tags to delineate structured input/output regions when the prompt does not specify a format.",
      "When a format is specified (JSON, Markdown, SQL, etc.), output that format only — no surrounding prose unless asked.",
      "Keep XML structure flat and readable; avoid unnecessary nesting.",
    ]),
    section("thinking_discipline", [
      "For straightforward tasks, give the result directly without showing reasoning steps.",
      "When uncertain, explicitly state what is uncertain and why, rather than hedging with vague qualifiers.",
    ]),
    section("long_context_attention", [
      "When citing information from context, provide pinpoint references (file path, line number, section name) rather than paraphrasing from memory.",
      "Attend to middle and late sections of long context as carefully as early ones — do not assume relevance decreases with position.",
      "When context contains contradictory information, explicitly flag the conflict and state which source you are following and why.",
    ]),
  ),
  meta: {
    target: "claude-family",
    purpose: "correction",
    fixes: [
      "unnecessary reasoning exposition for straightforward tasks",
      "positional attention bias in long-context processing",
    ],
    nonGoals: [
      "do not restate harness-core output efficiency, actions-with-care, git safety, or reporting rules — those now apply to every model",
      "do not encode series-specific quirks that belong in future per-series layers",
    ],
  },
};
