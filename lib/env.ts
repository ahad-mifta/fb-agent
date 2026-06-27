import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  META_APP_ID: z.string().min(1),
  META_APP_SECRET: z.string().min(1),
  META_REDIRECT_URI: z.string().url(),
  META_WEBHOOK_VERIFY_TOKEN: z.string().min(1),
  APP_URL: z.string().url(),
  CRON_SECRET: z.string().min(24),
  OPENAI_CHAT_MODEL: z.string().default("gpt-4o-mini")
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

function loadEnv(): Env {
  cachedEnv ??= envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    META_APP_ID: process.env.META_APP_ID,
    META_APP_SECRET: process.env.META_APP_SECRET,
    META_REDIRECT_URI: process.env.META_REDIRECT_URI,
    META_WEBHOOK_VERIFY_TOKEN: process.env.META_WEBHOOK_VERIFY_TOKEN,
    APP_URL: process.env.APP_URL,
    CRON_SECRET: process.env.CRON_SECRET,
    OPENAI_CHAT_MODEL: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini"
  });

  return cachedEnv;
}

export const env = new Proxy({} as Env, {
  get(_target, prop: string | symbol) {
    if (typeof prop !== "string") return undefined;
    return loadEnv()[prop as keyof Env];
  }
});
