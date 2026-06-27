import { Panel } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function PostsPage() {
  const posts = await prisma.facebookPost.findMany({
    orderBy: { publishedAt: "desc" },
    include: { facebookPage: true, source: { include: { chunks: { select: { id: true } } } } }
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Imported Posts</h1>
        <p className="mt-1 text-sm text-slate-600">Facebook posts imported from connected pages and embedded as knowledge.</p>
      </header>
      <Panel className="overflow-hidden">
        <div className="divide-y divide-line">
          {posts.map((post) => (
            <article key={post.id} className="grid gap-3 px-4 py-4 md:grid-cols-[180px_1fr_100px]">
              <div>
                <div className="font-medium">{post.facebookPage.pageName}</div>
                <div className="text-xs text-slate-500">{post.publishedAt ? post.publishedAt.toLocaleString() : "No publish date"}</div>
              </div>
              <div className="text-sm leading-6 text-slate-700">{post.message}</div>
              <div className="text-sm text-slate-600">{post.source.chunks.length} chunks</div>
            </article>
          ))}
          {posts.length === 0 && <div className="px-4 py-8 text-sm text-slate-500">No posts imported yet.</div>}
        </div>
      </Panel>
    </div>
  );
}
