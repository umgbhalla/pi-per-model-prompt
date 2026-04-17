# Changelog

## [0.3.1] — 2026-04-17

### Refactors
- simplify shared harness, GPT-5, GPT-5.4, and Claude prompt layers by collapsing redundant guidance and tightening wording
- remove the separate `OpenAI GPT-5 Codex Base` layer and resolve GPT-5 codex variants through family plus version-specific layers only

### Tests
- update resolver and extension coverage to reflect the new GPT-5 layer stack and prompt expectations

### Other
- bump package version from `0.3.0` to `0.3.1`

## [0.3.0] — 2026-04-15

### Features
- add `before_provider_request` hook for `gpt-5.4` verbosity override
- promote shared rules to the all-model harness core layer

### Bug Fixes
- add no meta-commentary openers to the GPT-5 family layer
- remove `implementation_reporting` from the codex layer

### Refactors
- update `gpt5.3-codex` with official compactness guidance
- align `gpt5.4` with official answer-shape and interaction guidance

### Documentation
- update README and architecture docs for the harness core model
- update README and architecture docs for the `gpt-5.4` runtime verbosity override

### Other
- include the prior `release: v0.2.0` commit in release history because the existing tag layout is inconsistent
