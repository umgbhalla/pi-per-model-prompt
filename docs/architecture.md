# Architecture

## Goal

`pi-per-model-prompt` packages one Pi extension that applies small, auditable prompt deltas for specific model identities.

The extension exists to correct observed model behavior under Pi's coding harness. It is not a generic prompt registry and it should not duplicate baseline harness policy that already belongs in Pi itself.

## Why this shape

The package follows Pi's extension and package guidance:

- expose one extension entry through `package.json -> pi.extensions`
- keep the runtime as raw TypeScript so Pi can load it through its normal extension loader
- avoid a build pipeline unless packaging requirements actually demand one
- keep correction logic in plain data modules so resolution is easy to test

This keeps the package cheap to audit, easy to publish, and easy to evolve with new model deltas.

## Runtime flow

1. Pi loads `index.ts` from the package manifest.
2. `src/index.ts` registers a `before_agent_start` hook.
3. On each prompt, the hook inspects `ctx.model.id`.
4. `src/resolve.ts` composes matching layers in deterministic order.
5. `src/prompt.ts` appends each layer once by marker.
6. If nothing changes, the hook returns `undefined` and leaves the system prompt untouched.

## Composition model

Resolution is additive rather than branch-based.

### OpenAI GPT-5

Current order:

1. family layer (`GPT5_FAMILY_LAYER`)
2. model-line layer (`GPT5_CODEX_LAYER`, if `codex` tag present)
3. version or exact-model layer (`GPT54_LAYER` or `GPT53_CODEX_LAYER`)

Examples:

- `gpt-5.4` → `GPT5_FAMILY` + `GPT54`
- `gpt-5.4-codex` → `GPT5_FAMILY` + `GPT5_CODEX` + `GPT54`
- `gpt-5.3-codex` → `GPT5_FAMILY` + `GPT5_CODEX` + `GPT53_CODEX`

### Anthropic Claude

All Claude models receive a fixed two-layer stack regardless of series:

1. family layer (`CLAUDE_FAMILY_LAYER`)
2. coding-agent layer (`CLAUDE_CODING_AGENT_LAYER`)

Detection is based on the presence of `opus`, `sonnet`, or `haiku` in the model ID.

This order matters because the broader baseline should land before narrower corrections.

## Source layout

```
index.ts                               # package entry (re-exports src/index.ts)
src/index.ts                           # Pi extension entry; registers before_agent_start hook
src/model-identity.ts                  # parser for gpt-5*, claude-*; produces ModelIdentity
src/resolve.ts                         # deterministic layer resolution by family/version/tags
src/prompt.ts                          # PromptLayer types, section/prose builders, appendOnce
src/layers/openai/gpt5/family.ts       # GPT-5 family baseline (output contract, verbosity, follow-through)
src/layers/openai/gpt5/codex.ts        # GPT-5 Codex line (scope discipline, minimal change, grounding)
src/layers/openai/gpt5/gpt-5.4.ts     # GPT-5.4 delta (autonomy, response economy, tool persistence)
src/layers/openai/gpt5/gpt-5.3-codex.ts # GPT-5.3-Codex delta (verbosity spec, ambiguity handling)
src/layers/anthropic/claude/family.ts  # Claude family baseline (XML structure, thinking discipline, long-context)
src/layers/anthropic/claude/coding-agent.ts # Claude coding-agent layer (scope, minimal change, grounding)
test/model-identity.test.ts            # parser coverage for supported and unsupported ids
test/prompt.test.ts                    # helper behavior and append idempotence
test/resolve.test.ts                   # exact layer ordering and model matching
test/extension.test.ts                 # end-to-end hook behavior for before_agent_start
```

## Model parsing

`inspectModelIdentity` returns a `ModelIdentity` with:

- `family`: `"gpt-5"` | `"claude"` | `undefined`
- `version`: `{ major, minor? }` for GPT models
- `series`: `"opus"` | `"sonnet"` | `"haiku"` for Claude models
- `tags`: `Set<"codex">` for GPT models with a `-codex` suffix

Unknown model IDs return `{ rawId, tags: new Set() }` with no family; `resolveLayers` returns `[]` for these.

## Rules for adding a new layer

Add a new layer only if all of the following are true:

1. There is a measured model-specific failure mode.
2. The issue is not already corrected by an existing broader layer.
3. The new behavior can be described as a narrow correction, not a new policy center.
4. The layer can be identified by a unique marker.
5. The expected resolution order is deterministic.

When adding a layer:

1. create a file under the relevant family directory (`src/layers/<provider>/<family>/`)
2. give it a unique `marker`
3. include concise `meta` with target, fixes, and non-goals
4. update `src/resolve.ts`
5. add or extend tests for model parsing and composition order
6. update `README.md` if externally visible behavior changed

## Test strategy

The package tests four paths:

- `model-identity`: parser coverage for supported and unsupported ids
- `prompt`: helper behavior and append idempotence
- `resolve`: exact layer ordering and model matching
- `extension`: end-to-end hook behavior for `before_agent_start`

The tests intentionally avoid depending on a running Pi process; they validate the extension as a pure TypeScript module with mocked hook registration.
