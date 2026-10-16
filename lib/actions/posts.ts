"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminFetch, AdminApiError } from "@/lib/adminApi";
import type { PostDetail } from "@/types/post";

export interface PostActionState {
  error?: string;
}

export async function createPost(
  _prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  let created: PostDetail;
  try {
    created = await adminFetch<PostDetail>("/api/admin/posts", { method: "POST", body: formData });
  } catch (err) {
    return { error: err instanceof AdminApiError ? err.message : "No se pudo guardar la noticia" };
  }

  revalidatePath("/posts");
  revalidatePath("/posts/mine");
  redirect(`/posts/${created.id}?ok=` + encodeURIComponent("Noticia creada correctamente"));
}

export async function updatePost(
  id: number,
  _prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  try {
    await adminFetch(`/api/admin/posts/${id}`, { method: "PUT", body: formData });
  } catch (err) {
    return { error: err instanceof AdminApiError ? err.message : "No se pudo actualizar la noticia" };
  }

  revalidatePath("/posts");
  revalidatePath("/posts/mine");
  revalidatePath(`/posts/${id}`);
  redirect(`/posts/${id}?ok=` + encodeURIComponent("Noticia actualizada correctamente"));
}

export async function deletePost(id: number, returnTo: string) {
  try {
    await adminFetch(`/api/admin/posts/${id}`, { method: "DELETE" });
  } catch (err) {
    const message = err instanceof AdminApiError ? err.message : "No se pudo eliminar la noticia";
    redirect(`${returnTo}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/posts");
  revalidatePath("/posts/mine");
  redirect(`${returnTo}?ok=${encodeURIComponent("Noticia eliminada")}`);
}
