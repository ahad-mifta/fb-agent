import { prisma } from "@/lib/prisma";

export type RetrievedChunk = {
  id: string;
  content: string;
  sourceTitle: string;
  distance: number;
};

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

export async function saveChunkEmbedding(chunkId: string, embedding: number[]) {
  await prisma.$executeRaw`
    UPDATE "KnowledgeChunk"
    SET embedding = ${toVectorLiteral(embedding)}::vector
    WHERE id = ${chunkId}
  `;
}

export async function retrieveRelevantChunks(embedding: number[], limit = 5): Promise<RetrievedChunk[]> {
  return prisma.$queryRaw<RetrievedChunk[]>`
    SELECT
      c.id,
      c.content,
      s.title AS "sourceTitle",
      c.embedding <=> ${toVectorLiteral(embedding)}::vector AS distance
    FROM "KnowledgeChunk" c
    JOIN "KnowledgeSource" s ON s.id = c."sourceId"
    WHERE c.embedding IS NOT NULL AND s.status = 'READY'
    ORDER BY c.embedding <=> ${toVectorLiteral(embedding)}::vector
    LIMIT ${limit}
  `;
}
