export function normalizeText(text: string): string {
  return text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function chunkText(text: string, chunkWords = 500, overlapWords = 100): string[] {
  const words = normalizeText(text).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunks: string[] = [];
  const step = Math.max(1, chunkWords - overlapWords);

  for (let start = 0; start < words.length; start += step) {
    const chunk = words.slice(start, start + chunkWords).join(" ");
    if (chunk.length > 0) chunks.push(chunk);
    if (start + chunkWords >= words.length) break;
  }

  return chunks;
}

export function buildRagPrompt(question: string, contexts: string[]): string {
  const contextBlock = contexts.map((context, index) => `Source ${index + 1}:\n${context}`).join("\n\n");

  return `Use the knowledge sources below to answer the Messenger user.\n\nKnowledge:\n${contextBlock}\n\nUser message:\n${question}\n\nReply in a concise, natural Messenger style.`;
}
