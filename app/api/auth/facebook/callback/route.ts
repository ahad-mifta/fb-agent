import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForUserToken, listUserPages } from "@/lib/meta";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(new URL("/dashboard/pages?error=missing_oauth_params", request.url));
  }

  const storedState = await prisma.appSetting.findUnique({ where: { key: `oauth_state:${state}` } });
  if (!storedState) {
    return NextResponse.redirect(new URL("/dashboard/pages?error=invalid_state", request.url));
  }

  await prisma.appSetting.delete({ where: { key: storedState.key } });
  const userToken = await exchangeCodeForUserToken(code);
  const pages = await listUserPages(userToken);

  for (const page of pages) {
    await prisma.facebookPage.upsert({
      where: { pageId: page.id },
      update: {
        pageName: page.name,
        pageAccessToken: page.access_token,
        isActive: true
      },
      create: {
        pageId: page.id,
        pageName: page.name,
        pageAccessToken: page.access_token
      }
    });
  }

  return NextResponse.redirect(new URL("/dashboard/pages?connected=1", request.url));
}
