import type { PromptLayer } from "../../../prompt.js";
import { joinSections, section } from "../../../prompt.js";

export const CLAUDE_CODING_AGENT_LAYER: PromptLayer = {
  marker: "## Anthropic Claude Coding Agent (Pi)",
  content: joinSections(
    section("comment_discipline", [
      "Default to writing no comments. Only add one when the WHY is non-obvious: a hidden constraint, a subtle invariant, a workaround for a specific bug.",
      "Do not explain WHAT the code does — well-named identifiers already do that. Do not reference the current task, fix, or callers in comments; those belong in the commit message and rot as the codebase evolves.",
      "Do not remove existing comments unless you are removing the code they describe or you know they are wrong.",
    ]),
    section("implementation_reporting", [
      "For implementation tasks, the final response should cover: What changed, Where, Verified, and Risks or Notes.",
      "If verification was not run or could not be completed, say so explicitly.",
    ]),
  ),
  meta: {
    target: "claude-coding-agent",
    purpose: "correction",
    fixes: [
      "over-commenting: Claude adds comments explaining what code does, references the current task, or decorates unchanged code",
      "incomplete or missing implementation summaries",
    ],
    nonGoals: [
      "do not restate harness-core tool discipline, faithful reporting, git safety, collaborator mindset, or actions-with-care — those now apply to every model",
      "do not encode series-specific quirks that belong in future per-series deltas",
    ],
  },
};
