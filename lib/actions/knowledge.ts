"use server";

import { revalidatePath } from "next/cache";
import { importPdf, importWebsite } from "@/lib/knowledge";

export async function importWebsiteAction(formData: FormData) {
  const url = String(formData.get("url") ?? "").trim();
  if (!url) throw new Error("Enter a URL to import");

  await importWebsite(url);
  revalidatePath("/dashboard/sources");
}

export async function uploadPdfAction(formData: FormData) {
  const file = formData.get("pdf");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose a PDF file");
  if (file.type !== "application/pdf") throw new Error("Only PDF files are supported");

  await importPdf(file);
  revalidatePath("/dashboard/pdfs");
}
