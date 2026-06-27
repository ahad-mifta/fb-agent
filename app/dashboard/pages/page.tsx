import { Plug, RefreshCcw } from "lucide-react";
import { Button, Panel, StatusBadge } from "@/components/ui";
import { connectFacebookPageAction, syncPagePostsAction, togglePageActiveAction } from "@/lib/actions/facebook";
import { prisma } from "@/lib/prisma";

export default async function ConnectedPagesPage() {
  const pages = await prisma.facebookPage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Connected Pages</h1>
          <p className="mt-1 text-sm text-slate-600">Connect Meta pages and sync their latest posts into your knowledge base.</p>
        </div>
        <form action={connectFacebookPageAction}>
          <Button><Plug size={16} /> Connect Page</Button>
        </form>
      </header>
      <Panel className="overflow-hidden">
        <div className="divide-y divide-line">
          {pages.map((page) => (
            <div key={page.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_120px_180px_120px] md:items-center">
              <div>
                <div className="font-medium">{page.pageName}</div>
                <div className="text-xs text-slate-500">{page.pageId}</div>
              </div>
              <StatusBadge>{page.isActive ? "active" : "paused"}</StatusBadge>
              <div className="text-xs text-slate-500">
                Last sync: {page.lastPostSyncAt ? page.lastPostSyncAt.toLocaleString() : "never"}
              </div>
              <div className="flex gap-2">
                <form action={syncPagePostsAction}>
                  <input type="hidden" name="facebookPageId" value={page.id} />
                  <Button className="size-10 px-0" title="Sync posts"><RefreshCcw size={16} /></Button>
                </form>
                <form action={togglePageActiveAction}>
                  <input type="hidden" name="facebookPageId" value={page.id} />
                  <input type="hidden" name="isActive" value={String(!page.isActive)} />
                  <Button className="bg-slate-800 hover:bg-slate-900">{page.isActive ? "Pause" : "Enable"}</Button>
                </form>
              </div>
            </div>
          ))}
          {pages.length === 0 && <div className="px-4 py-8 text-sm text-slate-500">No pages connected yet.</div>}
        </div>
      </Panel>
    </div>
  );
}
