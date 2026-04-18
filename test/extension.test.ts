import { describe, expect, it } from "vitest";
import perModelPrompt from "../index.js";

type BeforeAgentStartHandler = (
  event: { systemPrompt: string },
  ctx: { model?: { id?: string } },
) => Promise<{ systemPrompt: string } | undefined> | { systemPrompt: string } | undefined;

type FakePi = {
  on: (eventName: string, handler: BeforeAgentStartHandler) => void;
};

function createFakePi(): {
  pi: FakePi;
  handlers: Map<string, BeforeAgentStartHandler[]>;
} {
  const handlers = new Map<string, BeforeAgentStartHandler[]>();
  const pi: FakePi = {
    on(eventName: string, handler: BeforeAgentStartHandler): void {
      const existing = handlers.get(eventName) ?? [];
      existing.push(handler);
      handlers.set(eventName, existing);
    },
  };

  return { pi, handlers };
}

function countOccurrences(text: string, snippet: string): number {
  return text.split(snippet).length - 1;
}

describe("extension entry", () => {
  it("registers a before_agent_start hook", () => {
    const { pi, handlers } = createFakePi();

    perModelPrompt(pi as never);

    expect(handlers.get("before_agent_start")).toHaveLength(1);
  });

  it("augments the system prompt with the harness core and matching model layers", async () => {
    const { pi, handlers } = createFakePi();
    perModelPrompt(pi as never);

    const handler = handlers.get("before_agent_start")?.[0];
    expect(handler).toBeDefined();

    const result = await handler!(
      { systemPrompt: "BASE" },
      { model: { id: "gpt-5.4-codex" } },
    );

    expect(result).toBeDefined();
    expect(result?.systemPrompt).toContain("## Pi Harness Core Append (Pi)");
    expect(result?.systemPrompt).toContain("## OpenAI GPT-5 Family Base (Pi)");
    expect(result?.systemPrompt).toContain("## GPT-5.4 Delta (Pi)");
  });

  it("augments the system prompt for Claude models", async () => {
    const { pi, handlers } = createFakePi();
    perModelPrompt(pi as never);

    const handler = handlers.get("before_agent_start")?.[0];
    const result = await handler!(
      { systemPrompt: "BASE" },
      { model: { id: "claude-sonnet-4-5-20250514" } },
    );

    expect(result).toBeDefined();
    expect(result?.systemPrompt).toContain("## Pi Harness Core Append (Pi)");
    expect(result?.systemPrompt).toContain("## Anthropic Claude Family Base (Pi)");
    expect(result?.systemPrompt).toContain("## Anthropic Claude Coding Agent (Pi)");
    expect(result?.systemPrompt).not.toContain("## Anthropic Claude Opus Delta (Pi)");
  });

  it("adds the Opus delta for Opus models", async () => {
    const { pi, handlers } = createFakePi();
    perModelPrompt(pi as never);

    const handler = handlers.get("before_agent_start")?.[0];
    const result = await handler!(
      { systemPrompt: "BASE" },
      { model: { id: "claude-opus-4-7" } },
    );

    expect(result).toBeDefined();
    expect(result?.systemPrompt).toContain("## Pi Harness Core Append (Pi)");
    expect(result?.systemPrompt).toContain("## Anthropic Claude Family Base (Pi)");
    expect(result?.systemPrompt).toContain("## Anthropic Claude Coding Agent (Pi)");
    expect(result?.systemPrompt).toContain("## Anthropic Claude Opus Delta (Pi)");
  });

  it("augments the system prompt with the harness core for non-target models", async () => {
    const { pi, handlers } = createFakePi();
    perModelPrompt(pi as never);

    const handler = handlers.get("before_agent_start")?.[0];
    const result = await handler!(
      { systemPrompt: "BASE" },
      { model: { id: "mistral-large" } },
    );

    expect(result).toBeDefined();
    expect(result?.systemPrompt).toContain("## Pi Harness Core Append (Pi)");
  });

  it("remains idempotent when Claude markers already exist", async () => {
    const { pi, handlers } = createFakePi();
    perModelPrompt(pi as never);

    const handler = handlers.get("before_agent_start")?.[0];
    const alreadyLayeredPrompt = [
      "BASE",
      "## Pi Harness Core Append (Pi)",
      "core",
      "## Anthropic Claude Family Base (Pi)",
      "family",
      "## Anthropic Claude Coding Agent (Pi)",
      "coding-agent",
      "## Anthropic Claude Opus Delta (Pi)",
      "opus",
    ].join("\n\n");

    const result = await handler!(
      { systemPrompt: alreadyLayeredPrompt },
      { model: { id: "claude-opus-4-6" } },
    );

    expect(result).toBeUndefined();
    expect(countOccurrences(alreadyLayeredPrompt, "## Pi Harness Core Append (Pi)")).toBe(1);
    expect(countOccurrences(alreadyLayeredPrompt, "## Anthropic Claude Family Base (Pi)")).toBe(1);
    expect(countOccurrences(alreadyLayeredPrompt, "## Anthropic Claude Opus Delta (Pi)")).toBe(1);
  });

  it("remains idempotent when markers already exist", async () => {
    const { pi, handlers } = createFakePi();
    perModelPrompt(pi as never);

    const handler = handlers.get("before_agent_start")?.[0];
    const alreadyLayeredPrompt = [
      "BASE",
      "## Pi Harness Core Append (Pi)",
      "core",
      "## OpenAI GPT-5 Family Base (Pi)",
      "family",
      "## GPT-5.4 Delta (Pi)",
      "delta",
    ].join("\n\n");

    const result = await handler!(
      { systemPrompt: alreadyLayeredPrompt },
      { model: { id: "gpt-5.4-codex" } },
    );

    expect(result).toBeUndefined();
    expect(countOccurrences(alreadyLayeredPrompt, "## Pi Harness Core Append (Pi)")).toBe(1);
    expect(countOccurrences(alreadyLayeredPrompt, "## GPT-5.4 Delta (Pi)")).toBe(1);
  });
});
