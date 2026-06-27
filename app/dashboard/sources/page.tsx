import { UploadCloud } from "lucide-react";
import { Button, Input, Panel, StatusBadge } from "@/components/ui";
import { importWebsiteAction } from "@/lib/actions/knowledge";
import { prisma } from "@/lib/prisma";

export default async function SourcesPage() {
  const sources = await prisma.knowledgeSource.findMany({
    orderBy: { createdAt: "desc" },
    include: { chunks: { select: { id: true } } }
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Knowledge Sources</h1>
        <p className="mt-1 text-sm text-slate-600">Import website content and review processing status.</p>
      </header>
      <Panel className="p-4">
        <form action={importWebsiteAction} className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input name="url" type="url" placeholder="https://example.com/help" required />
          <Button><UploadCloud size={16} /> Import URL</Button>
        </form>
      </Panel>
      <Panel className="overflow-hidden">
        <div className="divide-y divide-line">
          {sources.map((source) => (
            <div key={source.id} className="grid gap-3 px-4 py-4 md:grid-cols-[120px_1fr_100px_100px] md:items-center">
              <StatusBadge>{source.type.toLowerCase()}</StatusBadge>
              <div>
                <div className="font-medium">{source.title}</div>
                <div className="truncate text-xs text-slate-500">{source.url ?? source.fileName ?? source.error ?? "No URL"}</div>
              </div>
              <StatusBadge>{source.status.toLowerCase()}</StatusBadge>
              <div className="text-sm text-slate-600">{source.chunks.length} chunks</div>
            </div>
          ))}
          {sources.length === 0 && <div className="px-4 py-8 text-sm text-slate-500">No knowledge sources yet.</div>}
        </div>
      </Panel>
    </div>
  );
}
