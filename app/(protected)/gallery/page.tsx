import Link from "next/link";
import { adminFetch } from "@/lib/adminApi";
import { ModuleCard } from "@/components/ModuleCard";
import { FlashBanner } from "@/components/FlashBanner";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";
import { deleteGallery } from "@/lib/actions/gallery";
import type { Gallery } from "@/types/gallery";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const galleries = await adminFetch<Gallery[]>("/api/admin/galleries");

  return (
    <ModuleCard
      title="Galerías de imágenes"
      subtitle="Administra las galerías y sus imágenes"
      actions={
        <Link
          href="/gallery/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-semibold cursor-pointer"
          style={{ background: "var(--color-cta)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nueva galería
        </Link>
      }
    >
      <FlashBanner ok={ok} error={error} />

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
          <caption className="sr-only">Lista de galerías</caption>
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--color-line)" }}>
              <th scope="col" className="w-[8%] px-4 sm:px-6 py-3 text-left font-semibold text-[var(--color-ink-soft)]">#</th>
              <th scope="col" className="w-[37%] px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Nombre</th>
              <th scope="col" className="w-[15%] px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Imágenes</th>
              <th scope="col" className="w-[18%] px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Creada</th>
              <th scope="col" className="w-[22%] px-4 sm:px-6 py-3 text-left font-semibold text-[var(--color-ink-soft)]">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {galleries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-[var(--color-ink-soft)]">
                  No hay galerías todavía.
                </td>
              </tr>
            )}
            {galleries.map((gallery) => (
              <tr key={gallery.id} className="border-b last:border-0" style={{ borderColor: "var(--color-line)" }}>
                <td className="px-4 sm:px-6 py-3 font-tabular text-[var(--color-ink-soft)]">{gallery.id}</td>
                <td className="px-4 py-3 text-[var(--color-ink)]">
                  <Link href={`/gallery/${gallery.id}`} className="font-semibold hover:underline">
                    {gallery.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-tabular text-[var(--color-ink)]">{gallery.imageCount}</td>
                <td className="px-4 py-3 font-tabular text-[var(--color-ink-soft)]">
                  {gallery.createdAt ? gallery.createdAt.slice(0, 10) : ""}
                </td>
                <td className="px-4 sm:px-6 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/gallery/${gallery.id}`}
                      aria-label={`Ver imágenes de ${gallery.name}`}
                      className="p-2 rounded-md hover:bg-[var(--color-line)] cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/gallery/${gallery.id}/edit`}
                      aria-label={`Renombrar ${gallery.name}`}
                      className="p-2 rounded-md hover:bg-[var(--color-line)] cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </Link>
                    <ConfirmDeleteForm
                      action={deleteGallery.bind(null, gallery.id)}
                      confirmMessage={`¿Borrar la galería "${gallery.name}" y todas sus imágenes? Esta acción no se puede deshacer.`}
                    >
                      <button
                        type="submit"
                        aria-label={`Borrar ${gallery.name}`}
                        className="p-2 rounded-md hover:bg-[var(--color-danger-tint)] cursor-pointer"
                        style={{ color: "var(--color-danger)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </ConfirmDeleteForm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModuleCard>
  );
}