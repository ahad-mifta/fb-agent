"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buildMetaOAuthUrl } from "@/lib/meta";
import { prisma } from "@/lib/prisma";
import { syncFacebookPosts } from "@/lib/knowledge";

export async function connectFacebookPageAction() {
  const state = crypto.randomUUID();
  await prisma.appSetting.upsert({
    where: { key: `oauth_state:${state}` },
    update: { value: state },
    create: {
      key: `oauth_state:${state}`,
      value: state,
      description: "Short-lived Meta OAuth CSRF state"
    }
  });

  redirect(buildMetaOAuthUrl(state));
}

export async function syncPagePostsAction(formData: FormData) {
  const facebookPageId = String(formData.get("facebookPageId") ?? "");
  if (!facebookPageId) throw new Error("Missing page id");
  await syncFacebookPosts(facebookPageId);
  revalidatePath("/dashboard/pages");
  revalidatePath("/dashboard/posts");
}

export async function togglePageActiveAction(formData: FormData) {
  const id = String(formData.get("facebookPageId") ?? "");
  const isActive = String(formData.get("isActive")) === "true";
  if (!id) throw new Error("Missing page id");

  await prisma.facebookPage.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath("/dashboard/pages");
}
