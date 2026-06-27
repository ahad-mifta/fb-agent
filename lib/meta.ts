import { env } from "@/lib/env";

const GRAPH_VERSION = "v21.0";
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

type MetaPage = {
  id: string;
  name: string;
  access_token: string;
};

type MetaPost = {
  id: string;
  message?: string;
  story?: string;
  permalink_url?: string;
  created_time?: string;
};

async function graphFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${GRAPH_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Meta Graph API failed: ${response.status} ${await response.text()}`);
  }

  return response.json() as Promise<T>;
}

export function buildMetaOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.META_APP_ID,
    redirect_uri: env.META_REDIRECT_URI,
    state,
    response_type: "code",
    scope: [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_metadata",
      "pages_messaging"
    ].join(",")
  });

  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
}

export async function exchangeCodeForUserToken(code: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: env.META_APP_ID,
    client_secret: env.META_APP_SECRET,
    redirect_uri: env.META_REDIRECT_URI,
    code
  });

  const data = await graphFetch<{ access_token: string }>(`/oauth/access_token?${params.toString()}`);
  return data.access_token;
}

export async function listUserPages(userAccessToken: string): Promise<MetaPage[]> {
  const params = new URLSearchParams({
    fields: "id,name,access_token",
    access_token: userAccessToken
  });
  const data = await graphFetch<{ data: MetaPage[] }>(`/me/accounts?${params.toString()}`);
  return data.data;
}

export async function fetchLatestPagePosts(pageId: string, pageAccessToken: string, limit = 100): Promise<MetaPost[]> {
  const params = new URLSearchParams({
    fields: "id,message,story,permalink_url,created_time",
    limit: String(limit),
    access_token: pageAccessToken
  });
  const data = await graphFetch<{ data: MetaPost[] }>(`/${pageId}/posts?${params.toString()}`);
  return data.data;
}

export async function sendMessengerReply(pageAccessToken: string, recipientPsid: string, text: string) {
  await graphFetch(`/me/messages?access_token=${encodeURIComponent(pageAccessToken)}`, {
    method: "POST",
    body: JSON.stringify({
      recipient: { id: recipientPsid },
      messaging_type: "RESPONSE",
      message: { text: text.slice(0, 1900) }
    })
  });
}
