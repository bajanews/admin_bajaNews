"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminFetch, AdminApiError } from "@/lib/adminApi";

export async function saveSitemapNow() {
  try {
    await adminFetch("/api/admin/sitemaps/save", { method: "POST" });
  } catch (err) {
    const message = err instanceof AdminApiError ? err.message : "No se pudo guardar el sitemap";
    redirect("/sitemaps?error=" + encodeURIComponent(message));
  }

  revalidatePath("/sitemaps");
  redirect("/sitemaps?ok=" + encodeURIComponent("Copia del sitemap guardada en el servidor"));
}