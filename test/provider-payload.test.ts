import { describe, expect, it } from "vitest";
import perModelPrompt from "../index.js";

type EventHandler = (event: unknown, ctx: { model?: { id?: string; api?: string } }) => unknown;

type FakePi = {
  on: (eventName: string, handler: EventHandler) => void;
};

function createFakePi(): {
  pi: FakePi;
  handlers: Map<string, EventHandler[]>;
} {
  const handlers = new Map<string, EventHandler[]>();
  const pi: FakePi = {
    on(eventName: string, handler: EventHandler): void {
      const existing = handlers.get(eventName) ?? [];
      existing.push(handler);
      handlers.set(eventName, existing);
    },
  };

  return { pi, handlers };
}

describe("provider payload overrides", () => {
  it("registers a before_provider_request hook", () => {
    const { pi, handlers } = createFakePi();

    perModelPrompt(pi as never);

    expect(handlers.get("before_provider_request")).toHaveLength(1);
  });

  it.each([
    "openai-responses",
    "openai-codex-responses",
    "azure-openai-responses",
  ] as const)("sets text.verbosity to low for gpt-5.4 %s payloads", (api) => {
    const { pi, handlers } = createFakePi();
    perModelPrompt(pi as never);

    const handler = handlers.get("before_provider_request")?.[0];
    expect(handler).toBeDefined();

    const result = handler!(
      {
        payload: {
          model: "gpt-5.4",
          input: [],
          text: {
            format: { type: "text" },
          },
        },
      },
      { model: { id: "gpt-5.4", api } },
    ) as { model: string; input: unknown[]; text: { format: { type: string }; verbosity: string } };

    expect(result).toEqual({
      model: "gpt-5.4",
      input: [],
      text: {
        format: { type: "text" },
        verbosity: "low",
      },
    });
  });

  it("rewrites existing verbosity values to low for exact gpt-5.4", () => {
    const { pi, handlers } = createFakePi();
    perModelPrompt(pi as never);

    const handler = handlers.get("before_provider_request")?.[0];
    const result = handler!(
      {
        payload: {
          model: "gpt-5.4",
          input: [],
          text: { verbosity: "medium" },
        },
      },
      { model: { id: "gpt-5.4", api: "openai-responses" } },
    ) as { text: { verbosity: string } };

    expect(result.text.verbosity).toBe("low");
  });

  it("does not touch payloads for other models", () => {
    const { pi, handlers } = createFakePi();
    perModelPrompt(pi as never);

    const handler = handlers.get("before_provider_request")?.[0];
    const payload = {
      model: "gpt-5.3-codex",
      input: [],
      text: { verbosity: "medium" },
    };

    const result = handler!(
      { payload },
      { model: { id: "gpt-5.3-codex" } },
    );

    expect(result).toBeUndefined();
    expect(payload).toEqual({
      model: "gpt-5.3-codex",
      input: [],
      text: { verbosity: "medium" },
    });
  });

  it("does not touch payloads for gpt-5.4-codex", () => {
    const { pi, handlers } = createFakePi();
    perModelPrompt(pi as never);

    const handler = handlers.get("before_provider_request")?.[0];
    const payload = {
      model: "gpt-5.4-codex",
      input: [],
      text: { verbosity: "medium" },
    };

    const result = handler!(
      { payload },
      { model: { id: "gpt-5.4-codex" } },
    );

    expect(result).toBeUndefined();
    expect(payload.text.verbosity).toBe("medium");
  });

  it("does not touch non-Responses-style payloads even for gpt-5.4", () => {
    const { pi, handlers } = createFakePi();
    perModelPrompt(pi as never);

    const handler = handlers.get("before_provider_request")?.[0];
    const payload = {
      prompt: "hello",
      max_tokens: 32,
    };

    const result = handler!(
      { payload },
      { model: { id: "gpt-5.4", api: "openai-responses" } },
    );

    expect(result).toBeUndefined();
    expect(payload).toEqual({
      prompt: "hello",
      max_tokens: 32,
    });
  });

  it("does not touch Responses-style payloads for non-Responses APIs", () => {
    const { pi, handlers } = createFakePi();
    perModelPrompt(pi as never);

    const handler = handlers.get("before_provider_request")?.[0];
    const payload = {
      model: "gpt-5.4",
      input: [],
      text: { verbosity: "medium" },
    };

    const result = handler!(
      { payload },
      { model: { id: "gpt-5.4", api: "openai-completions" } },
    );

    expect(result).toBeUndefined();
    expect(payload.text.verbosity).toBe("medium");
  });

  it("still sets verbosity to low for Azure deployment aliases of gpt-5.4", () => {
    const { pi, handlers } = createFakePi();
    perModelPrompt(pi as never);

    const handler = handlers.get("before_provider_request")?.[0];
    const result = handler!(
      {
        payload: {
          model: "my-gpt54-deployment",
          input: [],
          text: { verbosity: "medium" },
        },
      },
      { model: { id: "gpt-5.4", api: "azure-openai-responses" } },
    ) as { model: string; text: { verbosity: string } };

    expect(result).toEqual({
      model: "my-gpt54-deployment",
      input: [],
      text: { verbosity: "low" },
    });
  });
});
