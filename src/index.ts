import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { applyLayers } from "./prompt.js";
import { resolveLayers } from "./resolve.js";

export default function perModelPrompt(pi: ExtensionAPI): void {
  pi.on("before_agent_start", async (event, ctx) => {
    const layers = resolveLayers(ctx);
    if (layers.length === 0) {
      return undefined;
    }

    const systemPrompt = applyLayers(event.systemPrompt, layers);
    if (systemPrompt === event.systemPrompt) {
      return undefined;
    }

    return { systemPrompt };
  });
}
