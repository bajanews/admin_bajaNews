"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminFetch, AdminApiError } from "@/lib/adminApi";
import type { Gallery } from "@/types/gallery";

export interface GalleryActionState {
  error?: string;
}

const MAX_BYTES = 1 * 1024 * 1024; 
const EXTENSIONES = [".jpg", ".jpeg", ".png"];

function mensaje(err: unknown, fallback: string) {
  return err instanceof AdminApiError ? err.message : fallback;
}

export async function createGallery(
  _prev: GalleryActionState,
  formData: FormData
): Promise<GalleryActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre es obligatorio" };

  let creada: Gallery;
  try {
    creada = await adminFetch<Gallery>("/api/admin/galleries", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  } catch (err) {
    return { error: mensaje(err, "No se pudo crear la galería") };
  }

  revalidatePath("/gallery");
  redirect(`/gallery/${creada.id}?ok=` + encodeURIComponent("Galería creada, ahora sube las imágenes"));
}

export async function updateGallery(
  id: number,
  _prev: GalleryActionState,
  formData: FormData
): Promise<GalleryActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre es obligatorio" };

  try {
    await adminFetch(`/api/admin/galleries/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  } catch (err) {
    return { error: mensaje(err, "No se pudo actualizar la galería") };
  }

  revalidatePath("/gallery");
  redirect("/gallery?ok=" + encodeURIComponent("Galería actualizada correctamente"));
}

export async function deleteGallery(id: number) {
  try {
    await adminFetch(`/api/admin/galleries/${id}`, { method: "DELETE" });
  } catch (err) {
    redirect("/gallery?error=" + encodeURIComponent(mensaje(err, "No se pudo eliminar la galería")));
  }

  revalidatePath("/gallery");
  redirect("/gallery?ok=" + encodeURIComponent("Galería eliminada"));
}

// ---------- Imágenes ----------

export async function uploadImages(
  galleryId: number,
  _prev: GalleryActionState,
  formData: FormData
): Promise<GalleryActionState> {
  const archivos = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  if (archivos.length === 0) return { error: "Selecciona al menos una imagen" };

  for (const archivo of archivos) {
    const nombre = archivo.name.toLowerCase();
    if (!EXTENSIONES.some((ext) => nombre.endsWith(ext))) {
      return { error: `"${archivo.name}" no es JPG o PNG` };
    }
    if (archivo.size > MAX_BYTES) {
      return { error: `"${archivo.name}" pesa más de 1 MB` };
    }
  }

  try {
    await adminFetch(`/api/admin/galleries/${galleryId}/images`, { method: "POST", body: formData });
  } catch (err) {
    return { error: mensaje(err, "No se pudieron subir las imágenes") };
  }

  revalidatePath(`/gallery/${galleryId}`);
  redirect(`/gallery/${galleryId}?ok=` + encodeURIComponent("Imágenes subidas correctamente"));
}

export async function updateImageCaption(
  galleryId: number,
  imageId: number,
  _prev: GalleryActionState,
  formData: FormData
): Promise<GalleryActionState> {
  const caption = String(formData.get("caption") ?? "").trim();
  if (!caption) return { error: "El pie de foto es obligatorio" };

  try {
    await adminFetch(`/api/admin/galleries/${galleryId}/images/${imageId}`, {
      method: "PUT",
      body: JSON.stringify({ caption }),
    });
  } catch (err) {
    return { error: mensaje(err, "No se pudo actualizar el pie de foto") };
  }

  revalidatePath(`/gallery/${galleryId}`);
  redirect(`/gallery/${galleryId}?ok=` + encodeURIComponent("Pie de foto actualizado"));
}

export async function deleteImage(galleryId: number, imageId: number) {
  try {
    await adminFetch(`/api/admin/galleries/${galleryId}/images/${imageId}`, { method: "DELETE" });
  } catch (err) {
    redirect(`/gallery/${galleryId}?error=` + encodeURIComponent(mensaje(err, "No se pudo eliminar la imagen")));
  }

  revalidatePath(`/gallery/${galleryId}`);
  redirect(`/gallery/${galleryId}?ok=` + encodeURIComponent("Imagen eliminada"));
}