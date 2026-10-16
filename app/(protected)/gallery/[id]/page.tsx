import Link from "next/link";
import { notFound } from "next/navigation";
import { adminFetch, AdminApiError } from "@/lib/adminApi";
import { uploadUrl } from "@/lib/assets";
import { ModuleCard } from "@/components/ModuleCard";
import { FlashBanner } from "@/components/FlashBanner";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";
import { ImageUploadForm } from "@/components/gallery/ImageUploadForm";
import { deleteImage, uploadImages } from "@/lib/actions/gallery";
import type { Gallery, GalleryImage } from "@/types/gallery";
import { CopyCode } from "@/components/gallery/CopyCode";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;");
}

function codigoGaleria(images: GalleryImage[]): string {
  const config = '{"viewerToolbar":{"display":true}, "viewerHideToolsDelay":9999999}';
  return [...images]
    .sort((a, b) => a.id - b.id)
    .map((image) => {
      const src = `/uploads/images-gallery/${image.name}`;
      const caption = escapeHtml(image.caption);
      return `<a><img src='${src}' data-ngsrc='${src}' data-nanogallery2-lightbox='${config}' alt='${caption}'><p>${caption}</p></a>`;
    })
    .join("\n");
}

export default async function GalleryImagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const { ok, error } = await searchParams;

  let gallery: Gallery;
  try {
    gallery = await adminFetch<Gallery>(`/api/admin/galleries/${id}`);
  } catch (err) {
    if (err instanceof AdminApiError && err.status === 404) notFound();
    throw err;
  }

  const images = await adminFetch<GalleryImage[]>(`/api/admin/galleries/${gallery.id}/images`);

  return (
    <ModuleCard
      title={`Galería: ${gallery.name}`}
      subtitle={`${images.length} ${images.length === 1 ? "imagen" : "imágenes"}`}
      actions={
        <Link
          href="/gallery"
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold border cursor-pointer"
          style={{ borderColor: "var(--color-line)" }}
        >
          Volver
        </Link>
      }
    >
      <FlashBanner ok={ok} error={error} />

      <ImageUploadForm action={uploadImages.bind(null, gallery.id)} />

      {images.length > 0 && (
        <div className="border-t px-4 sm:px-6 py-6" style={{ borderColor: "var(--color-line)" }}>
          <h2 className="text-sm font-semibold text-[var(--color-ink)] mb-1">Código para la noticia</h2>
          <p className="text-sm text-[var(--color-ink-soft)] mb-3">
            Cópialo y pégalo en el editor de la noticia con el botón «Insertar HTML».
          </p>
          <CopyCode code={codigoGaleria(images)} />
        </div>
      )}

      <div className="border-t px-4 sm:px-6 py-6" style={{ borderColor: "var(--color-line)" }}>
        {images.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Esta galería todavía no tiene imágenes.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {images.map((image) => {
              const src = uploadUrl("images-gallery", image.name);
              return (
                <li
                  key={image.id}
                  className="rounded-lg border overflow-hidden"
                  style={{ borderColor: "var(--color-line)" }}
                >
                  {src ? (
                    <img className="w-full aspect-video object-cover" src={src} alt={image.caption} />
                  ) : (
                    <div className="w-full aspect-video" style={{ background: "var(--color-line)" }} aria-hidden="true" />
                  )}

                  <div className="p-3 grid gap-2">
                    <p className="text-sm text-[var(--color-ink)] line-clamp-2">{image.caption}</p>

                    {src && (
                      <input
                        readOnly
                        value={src}
                        aria-label="URL de la imagen"
                        className="w-full text-xs px-2 py-1.5 rounded border bg-transparent text-[var(--color-ink-soft)]"
                        style={{ borderColor: "var(--color-line)" }}
                      />
                    )}

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/gallery/${gallery.id}/images/${image.id}/edit`}
                        className="px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-[var(--color-line)] cursor-pointer"
                      >
                        Editar pie de foto
                      </Link>
                      <ConfirmDeleteForm
                        action={deleteImage.bind(null, gallery.id, image.id)}
                        confirmMessage="¿Borrar esta imagen? Esta acción no se puede deshacer."
                      >
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-[var(--color-danger-tint)] cursor-pointer"
                          style={{ color: "var(--color-danger)" }}
                        >
                          Borrar
                        </button>
                      </ConfirmDeleteForm>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </ModuleCard>
  );
}