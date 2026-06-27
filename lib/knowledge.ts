import * as cheerio from "cheerio";
import pdf from "pdf-parse";
import { KnowledgeSourceStatus, KnowledgeSourceType } from "@prisma/client";
import { fetchLatestPagePosts } from "@/lib/meta";
import { embedText } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { chunkText, normalizeText } from "@/lib/text";
import { saveChunkEmbedding } from "@/lib/vector";

export async function processKnowledgeSource(sourceId: string, text: string) {
  await prisma.knowledgeSource.update({
    where: { id: sourceId },
    data: { status: KnowledgeSourceStatus.PROCESSING, text: normalizeText(text), error: null }
  });

  try {
    await prisma.knowledgeChunk.deleteMany({ where: { sourceId } });
    const chunks = chunkText(text);

    for (const [position, content] of chunks.entries()) {
      const chunk = await prisma.knowledgeChunk.create({
        data: { sourceId, content, position }
      });
      const embedding = await embedText(content);
      await saveChunkEmbedding(chunk.id, embedding);
    }

    await prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: { status: KnowledgeSourceStatus.READY }
    });
  } catch (error) {
    await prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: {
        status: KnowledgeSourceStatus.FAILED,
        error: error instanceof Error ? error.message : "Unknown processing error"
      }
    });
    throw error;
  }
}

export async function importWebsite(url: string) {
  const response = await fetch(url, { headers: { "user-agent": "MessengerAIAgent/1.0" } });
  if (!response.ok) throw new Error(`Could not fetch website: ${response.status}`);

  const html = await response.text();
  const $ = cheerio.load(html);
  $("script, style, noscript, svg, nav, footer").remove();
  const title = $("title").first().text().trim() || url;
  const text = normalizeText($("body").text());

  const source = await prisma.knowledgeSource.create({
    data: { type: KnowledgeSourceType.WEBSITE, title, url, status: KnowledgeSourceStatus.PENDING }
  });

  await processKnowledgeSource(source.id, text);
  return source.id;
}

export async function importPdf(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = await pdf(buffer);
  const source = await prisma.knowledgeSource.create({
    data: {
      type: KnowledgeSourceType.PDF,
      title: file.name,
      fileName: file.name,
      status: KnowledgeSourceStatus.PENDING
    }
  });

  await processKnowledgeSource(source.id, parsed.text);
  return source.id;
}

export async function syncFacebookPosts(facebookPageId: string) {
  const page = await prisma.facebookPage.findUniqueOrThrow({ where: { id: facebookPageId } });
  const posts = await fetchLatestPagePosts(page.pageId, page.pageAccessToken, 100);
  let imported = 0;

  for (const post of posts) {
    const message = normalizeText(post.message ?? post.story ?? "");
    if (!message) continue;

    const exists = await prisma.facebookPost.findUnique({ where: { pagePostId: post.id } });
    if (exists) continue;

    const source = await prisma.knowledgeSource.create({
      data: {
        type: KnowledgeSourceType.FACEBOOK_POST,
        title: `Facebook post ${post.id}`,
        url: post.permalink_url,
        facebookPageId: page.id,
        status: KnowledgeSourceStatus.PENDING
      }
    });

    await prisma.facebookPost.create({
      data: {
        pagePostId: post.id,
        message,
        permalinkUrl: post.permalink_url,
        publishedAt: post.created_time ? new Date(post.created_time) : null,
        facebookPageId: page.id,
        sourceId: source.id
      }
    });

    await processKnowledgeSource(source.id, message);
    imported += 1;
  }

  await prisma.facebookPage.update({
    where: { id: facebookPageId },
    data: { lastPostSyncAt: new Date() }
  });

  return imported;
}
