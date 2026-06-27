import { prisma } from "@/lib/prisma";
import { Panel, StatusBadge } from "@/components/ui";

export default async function DashboardPage() {
  const [pages, sources, posts, conversations] = await Promise.all([
    prisma.facebookPage.count(),
    prisma.knowledgeSource.count(),
    prisma.facebookPost.count(),
    prisma.conversation.count()
  ]);

  const stats = [
    ["Connected Pages", pages],
    ["Knowledge Sources", sources],
    ["Imported Posts", posts],
    ["Conversations", conversations]
  ] as const;

  const recentMessages = await prisma.conversationMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { conversation: { include: { facebookPage: true } } }
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-normal">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Monitor your Messenger agent, connected pages, and knowledge base.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <Panel key={label} className="p-4">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-3xl font-semibold">{value}</div>
          </Panel>
        ))}
      </section>
      <Panel className="overflow-hidden">
        <div className="border-b border-line px-4 py-3 font-medium">Recent Messages</div>
        <div className="divide-y divide-line">
          {recentMessages.map((message) => (
            <div key={message.id} className="grid gap-2 px-4 py-3 md:grid-cols-[150px_1fr_160px]">
              <StatusBadge>{message.role.toLowerCase()}</StatusBadge>
              <div className="text-sm">{message.content}</div>
              <div className="text-xs text-slate-500">{message.conversation.facebookPage.pageName}</div>
            </div>
          ))}
          {recentMessages.length === 0 && <div className="px-4 py-8 text-sm text-slate-500">No messages yet.</div>}
        </div>
      </Panel>
    </div>
  );
}
