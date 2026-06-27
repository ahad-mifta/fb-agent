# AI Facebook Messenger Auto Reply Agent

A full-stack SaaS starter built with Next.js 15 App Router, TypeScript, PostgreSQL, Prisma, pgvector, Tailwind CSS, Meta Graph API, and OpenAI.

The app connects Facebook Pages, imports knowledge from websites, PDFs, and recent Facebook posts, embeds the knowledge with `text-embedding-3-small`, retrieves relevant chunks for incoming Messenger messages, and sends automatic AI replies through the Messenger Send API.

## What Is Included

- Meta OAuth page connection.
- Storage for `page_id`, `page_name`, and `page_access_token`.
- Website content importer.
- PDF uploader with text extraction.
- Latest 100 Facebook Page posts importer.
- 500-word chunking with 100-word overlap.
- OpenAI embedding generation.
- pgvector storage and top-5 similarity search.
- Messenger webhook verification and event handler.
- RAG prompt construction and GPT reply generation.
- Messenger auto reply sender.
- Six-hour cron endpoint for post sync.
- Dashboard sections for pages, sources, PDFs, posts, conversations, and settings.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- PostgreSQL
- Prisma ORM
- pgvector
- Tailwind CSS
- OpenAI API
- Meta Graph API and Messenger Platform

## Project Structure

```txt
app/
  api/
    auth/facebook/callback/route.ts   Meta OAuth callback
    cron/sync-posts/route.ts          Protected cron endpoint
    webhooks/messenger/route.ts       Messenger webhook
  dashboard/                          SaaS dashboard pages
components/
  ui.tsx                              Shared UI primitives
lib/
  actions/                            Server Actions
  env.ts                              Runtime environment validation
  knowledge.ts                        Website, PDF, and post ingestion
  messenger.ts                        Incoming message RAG flow
  meta.ts                             Meta Graph API helpers
  openai.ts                           OpenAI embeddings and chat
  prisma.ts                           Prisma client singleton
  text.ts                             Text normalization, chunking, prompt
  vector.ts                           pgvector write and similarity search
prisma/
  schema.prisma                       Database schema
  migration.sql                       pgvector baseline note
```

## How It Works

1. A user clicks **Connect Page** in the dashboard.
2. The app redirects to Meta OAuth with the required page permissions.
3. Meta redirects back to `/api/auth/facebook/callback`.
4. The callback exchanges the code for a user token, lists pages, and stores each page with its page access token.
5. Knowledge can be imported from a website URL, uploaded PDF, or latest Facebook posts.
6. Imported text is normalized and split into chunks of about 500 words with 100 words of overlap.
7. Each chunk is embedded with OpenAI `text-embedding-3-small`.
8. Embeddings are stored in PostgreSQL using pgvector.
9. Meta sends Messenger messages to `/api/webhooks/messenger`.
10. The webhook embeds the incoming message and retrieves the top 5 nearest chunks.
11. The app builds a RAG prompt and generates a concise reply with the configured GPT model.
12. The reply is sent back to the user through the Messenger Send API.
13. Conversations and messages are stored for dashboard review.
14. `/api/cron/sync-posts` can be called every 6 hours to import new Facebook posts.

## Environment Variables

Copy `.env.example` to `.env` and fill in real values.

```bash
cp .env.example .env
```

Required variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/messenger_ai_agent?schema=public"
OPENAI_API_KEY="sk-your-openai-key"
OPENAI_CHAT_MODEL="gpt-4o-mini"
META_APP_ID="your-meta-app-id"
META_APP_SECRET="your-meta-app-secret"
META_REDIRECT_URI="http://localhost:3000/api/auth/facebook/callback"
META_WEBHOOK_VERIFY_TOKEN="make-a-long-random-token"
APP_URL="http://localhost:3000"
CRON_SECRET="make-a-long-random-cron-secret-32-chars"
```

## Database Setup

PostgreSQL must have the pgvector extension available.

Using Docker:

```bash
docker run --name messenger-ai-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=messenger_ai_agent \
  -p 5432:5432 \
  -d pgvector/pgvector:pg16
```

Then run:

```bash
npm install
npx prisma migrate dev --name init
npx prisma generate
```

The Prisma schema enables:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Knowledge embeddings are stored as `vector(1536)` because `text-embedding-3-small` returns 1536 dimensions.

## Run Locally

```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

Open:

```txt
http://localhost:3000/dashboard
```

## Meta App Setup

Create a Meta app at the Meta Developers portal and add Messenger.

Configure OAuth:

- Valid OAuth Redirect URI: `http://localhost:3000/api/auth/facebook/callback`
- For production, use `https://your-domain.com/api/auth/facebook/callback`

Required permissions:

- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_metadata`
- `pages_messaging`

Configure Messenger webhook:

- Callback URL: `${APP_URL}/api/webhooks/messenger`
- Verify token: `META_WEBHOOK_VERIFY_TOKEN`
- Subscribe to page messaging events.

For local webhook testing, expose your local app with a tunnel such as ngrok:

```bash
ngrok http 3000
```

Then set:

```env
APP_URL="https://your-ngrok-domain.ngrok-free.app"
META_REDIRECT_URI="https://your-ngrok-domain.ngrok-free.app/api/auth/facebook/callback"
```

## Cron Setup

The cron endpoint is:

```txt
GET /api/cron/sync-posts
```

It requires:

```txt
Authorization: Bearer CRON_SECRET
```

Example with curl:

```bash
curl -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/cron/sync-posts
```

Vercel `vercel.json` example for every 6 hours:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-posts",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Vercel Cron cannot send custom authorization headers by default. For Vercel, either call the endpoint from an external scheduler that supports headers, or adapt the route to accept a secret query parameter and keep that URL private.

## Main Code Paths

### Page Connection

- Server Action: `lib/actions/facebook.ts`
- OAuth URL: `lib/meta.ts`
- Callback: `app/api/auth/facebook/callback/route.ts`
- Database model: `FacebookPage`

### Knowledge Import

- Website importer: `importWebsite` in `lib/knowledge.ts`
- PDF importer: `importPdf` in `lib/knowledge.ts`
- Facebook post sync: `syncFacebookPosts` in `lib/knowledge.ts`
- Chunking: `chunkText` in `lib/text.ts`
- Embeddings: `embedText` in `lib/openai.ts`
- Vector persistence: `saveChunkEmbedding` in `lib/vector.ts`

### Messenger Auto Reply

- Webhook route: `app/api/webhooks/messenger/route.ts`
- Message handler: `handleIncomingMessengerMessage` in `lib/messenger.ts`
- Vector retrieval: `retrieveRelevantChunks` in `lib/vector.ts`
- Prompt builder: `buildRagPrompt` in `lib/text.ts`
- Reply sender: `sendMessengerReply` in `lib/meta.ts`

## Production Notes

- Store Meta page access tokens securely. For a real multi-tenant SaaS, encrypt tokens at rest.
- Add authentication before exposing the dashboard to customers.
- Move long ingestion jobs to a queue for large PDFs or large websites.
- Add rate limiting to webhook and import endpoints.
- Add tenant and user models if multiple businesses will use one deployment.
- Configure Meta App Review before going live with real customer pages.
- Use HTTPS in production for Meta webhooks and OAuth.

## Useful Commands

```bash
npm run dev
npm run build
npx prisma studio
npx prisma migrate dev --name init
npx prisma migrate deploy
```

## Troubleshooting

- If Prisma migration fails with pgvector errors, confirm your PostgreSQL server has pgvector installed.
- If Meta webhook verification fails, check `META_WEBHOOK_VERIFY_TOKEN`.
- If OAuth callback fails, check `META_REDIRECT_URI` exactly matches the Meta app setting.
- If replies are not sent, confirm the page has `pages_messaging` permission and a valid page access token.
- If no relevant answers are generated, import knowledge sources first and confirm chunks show as `ready`.
#   f b - a g e n t  
 