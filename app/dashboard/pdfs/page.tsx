import { FileUp } from "lucide-react";
import { Button, Panel, StatusBadge } from "@/components/ui";
import { uploadPdfAction } from "@/lib/actions/knowledge";
import { prisma } from "@/lib/prisma";

export default async function PdfsPage() {
  const pdfs = await prisma.knowledgeSource.findMany({
    where: { type: "PDF" },
    orderBy: { createdAt: "desc" },
    include: { chunks: { select: { id: true } } }
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Uploaded PDFs</h1>
        <p className="mt-1 text-sm text-slate-600">Extract text from PDFs and embed it for Messenger replies.</p>
      </header>
      <Panel className="p-4">
        <form action={uploadPdfAction} className="grid gap-3 md:grid-cols-[1fr_auto]" encType="multipart/form-data">
          <input name="pdf" type="file" accept="application/pdf" required className="rounded-md border border-line bg-white p-2 text-sm" />
          <Button><FileUp size={16} /> Upload PDF</Button>
        </form>
      </Panel>
      <Panel className="overflow-hidden">
        <div className="divide-y divide-line">
          {pdfs.map((pdf) => (
            <div key={pdf.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_100px_100px] md:items-center">
              <div>
                <div className="font-medium">{pdf.title}</div>
                <div className="text-xs text-slate-500">{pdf.createdAt.toLocaleString()}</div>
              </div>
              <StatusBadge>{pdf.status.toLowerCase()}</StatusBadge>
              <div className="text-sm text-slate-600">{pdf.chunks.length} chunks</div>
            </div>
          ))}
          {pdfs.length === 0 && <div className="px-4 py-8 text-sm text-slate-500">No PDFs uploaded yet.</div>}
        </div>
      </Panel>
    </div>
  );
}
