export type PromptLayerMeta = {
  target: string;
  purpose: "correction";
  fixes: string[];
  nonGoals?: string[];
};
export type PromptLayer = {
  marker: string;
  content: string;
  meta?: PromptLayerMeta;
};

export function section(tag: string, lines: string[]): string {
  return [
    `<${tag}>`,
    ...lines.map((line) => `- ${line}`),
    `</${tag}>`,
  ].join("\n");
}

export function prose(tag: string, text: string): string {
  return `<${tag}>\n${text}\n</${tag}>`;
}

export function joinSections(...sections: Array<string | undefined>): string {
  return sections.filter(Boolean).join("\n\n");
}

export function appendOnce(systemPrompt: string, layer: PromptLayer): string {
  if (systemPrompt.includes(layer.marker)) return systemPrompt;
  return `${systemPrompt}\n\n${layer.marker}\n\n${layer.content}`;
}

export function applyLayers(systemPrompt: string, layers: PromptLayer[]): string {
  return layers.reduce((prompt, layer) => appendOnce(prompt, layer), systemPrompt);
}
