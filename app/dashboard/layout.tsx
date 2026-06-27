import type { ReactNode } from "react";
import Link from "next/link";
import { Bot, FileText, GalleryVerticalEnd, MessageSquareText, Plug, Settings, Newspaper } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: Bot },
  { href: "/dashboard/pages", label: "Connected Pages", icon: Plug },
  { href: "/dashboard/sources", label: "Knowledge Sources", icon: GalleryVerticalEnd },
  { href: "/dashboard/pdfs", label: "Uploaded PDFs", icon: FileText },
  { href: "/dashboard/posts", label: "Imported Posts", icon: Newspaper },
  { href: "/dashboard/conversations", label: "Conversations", icon: MessageSquareText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white px-4 py-5 lg:block">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="grid size-10 place-items-center rounded-md bg-brand text-white">
            <Bot size={20} />
          </div>
          <div>
            <div className="font-semibold">Messenger AI</div>
            <div className="text-xs text-slate-500">Auto Reply Agent</div>
          </div>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-700 hover:bg-panel hover:text-ink"
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
