import OpenAI from "openai";
import { env } from "@/lib/env";

let client: OpenAI | null = null;

function getOpenAI() {
  client ??= new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return client;
}

export async function embedText(input: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: "text-embedding-3-small",
    input: input.replace(/\s+/g, " ").trim()
  });

  return response.data[0].embedding;
}

export async function generateReply(prompt: string): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
    model: env.OPENAI_CHAT_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful customer support assistant replying in Facebook Messenger. Answer only from the supplied knowledge. If the knowledge is insufficient, say you are not sure and offer to connect them with a human."
      },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content?.trim() ?? "I am not sure about that yet.";
}
