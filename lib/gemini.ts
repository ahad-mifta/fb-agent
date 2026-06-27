import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { env } from "@/lib/env";

let genAI: GoogleGenerativeAI | null = null;

function getGoogleAI() {
  genAI ??= new GoogleGenerativeAI(env.GEMINI_API_KEY);
  return genAI;
}

export async function embedText(input: string): Promise<number[]> {
  const model = getGoogleAI().getGenerativeModel({
    model: env.GEMINI_EMBEDDING_MODEL
  });

  const response = await model.embedContent({
    content: input.replace(/\s+/g, " ").trim(),
    taskType: TaskType.RETRIEVAL_DOCUMENT
  });

  return response.embedding.values;
}

export async function generateReply(prompt: string): Promise<string> {
  const model = getGoogleAI().getGenerativeModel({
    model: env.GEMINI_CHAT_MODEL,
    systemInstruction:
      "You are a helpful customer support assistant replying in Facebook Messenger. Answer only from the supplied knowledge. If the knowledge is insufficient, say you are not sure and offer to connect them with a human."
  });

  const chat = model.startChat({
    history: [],
    generationConfig: {
      temperature: 0.2
    }
  });

  const result = await chat.sendMessage(prompt);
  const response = result.response;
  const text = response.text();

  return text.trim() ?? "I am not sure about that yet.";
}