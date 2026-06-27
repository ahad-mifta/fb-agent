import { Code2 } from "lucide-react";
import { Panel } from "@/components/ui";

export default function SettingsPage() {
  const webhookUrl = `${process.env.APP_URL ?? "https://your-domain.com"}/api/webhooks/messenger`;
  const cronUrl = `${process.env.APP_URL ?? "https://your-domain.com"}/api/cron/sync-posts`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Operational URLs and environment configuration for Meta and cron.</p>
      </header>
      <Panel className="p-4">
        <div className="mb-3 flex items-center gap-2 font-medium"><Code2 size={16} /> Meta Webhook</div>
        <dl className="grid gap-3 text-sm md:grid-cols-[180px_1fr]">
          <dt className="text-slate-500">Callback URL</dt>
          <dd className="font-mono text-xs">{webhookUrl}</dd>
          <dt className="text-slate-500">Verify token</dt>
          <dd className="font-mono text-xs">{process.env.META_WEBHOOK_VERIFY_TOKEN ?? "META_WEBHOOK_VERIFY_TOKEN"}</dd>
          <dt className="text-slate-500">Cron URL</dt>
          <dd className="font-mono text-xs">{cronUrl}</dd>
          <dt className="text-slate-500">OpenAI model</dt>
          <dd className="font-mono text-xs">{process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini"}</dd>
        </dl>
      </Panel>
      <Panel className="p-4 text-sm leading-6 text-slate-700">
        Set the cron request header to <span className="font-mono text-xs">Authorization: Bearer CRON_SECRET</span>. Meta webhook events are verified with the token above and then handled by the RAG reply pipeline.
      </Panel>
    </div>
  );
}
