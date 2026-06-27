import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { syncFacebookPosts } from "@/lib/knowledge";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await prisma.facebookPage.findMany({ where: { isActive: true } });
  const results = await Promise.allSettled(pages.map((page) => syncFacebookPosts(page.id)));

  return NextResponse.json({
    syncedPages: pages.length,
    importedPosts: results.reduce((total, result) => total + (result.status === "fulfilled" ? result.value : 0), 0),
    failures: results.filter((result) => result.status === "rejected").length
  });
}
