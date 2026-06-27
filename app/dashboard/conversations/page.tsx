import { Panel, StatusBadge } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function ConversationsPage() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      facebookPage: true,
      messages: { orderBy: { createdAt: "asc" }, take: 12 }
    }
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Conversations</h1>
        <p className="mt-1 text-sm text-slate-600">Messenger conversations handled by the AI reply agent.</p>
      </header>
      <div className="space-y-4">
        {conversations.map((conversation) => (
          <Panel key={conversation.id} className="overflow-hidden">
            <div className="flex flex-col justify-between gap-2 border-b border-line px-4 py-3 sm:flex-row sm:items-center">
              <div>
                <div className="font-medium">{conversation.facebookPage.pageName}</div>
                <div className="text-xs text-slate-500">PSID {conversation.senderPsid}</div>
              </div>
              <div className="text-xs text-slate-500">Updated {conversation.updatedAt.toLocaleString()}</div>
            </div>
            <div className="divide-y divide-line">
              {conversation.messages.map((message) => (
                <div key={message.id} className="grid gap-3 px-4 py-3 md:grid-cols-[110px_1fr]">
                  <StatusBadge>{message.role.toLowerCase()}</StatusBadge>
                  <p className="text-sm leading-6 text-slate-700">{message.content}</p>
                </div>
              ))}
            </div>
          </Panel>
        ))}
        {conversations.length === 0 && <Panel className="px-4 py-8 text-sm text-slate-500">No conversations yet.</Panel>}
      </div>
    </div>
  );
}
