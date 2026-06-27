import { embedText, generateReply } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { buildRagPrompt } from "@/lib/text";
import { retrieveRelevantChunks } from "@/lib/vector";
import { sendMessengerReply } from "@/lib/meta";

export async function handleIncomingMessengerMessage(pageId: string, senderPsid: string, text: string) {
  const page = await prisma.facebookPage.findUnique({ where: { pageId } });
  if (!page || !page.isActive) return;

  const conversation = await prisma.conversation.upsert({
    where: { facebookPageId_senderPsid: { facebookPageId: page.id, senderPsid } },
    update: { updatedAt: new Date() },
    create: { facebookPageId: page.id, senderPsid }
  });

  await prisma.conversationMessage.create({
    data: { conversationId: conversation.id, role: "USER", content: text }
  });

  const embedding = await embedText(text);
  const chunks = await retrieveRelevantChunks(embedding, 5);
  const prompt = buildRagPrompt(text, chunks.map((chunk) => chunk.content));
  const reply = await generateReply(prompt);

  await sendMessengerReply(page.pageAccessToken, senderPsid, reply);
  await prisma.conversationMessage.create({
    data: { conversationId: conversation.id, role: "ASSISTANT", content: reply }
  });
}
