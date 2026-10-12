import { notFound } from "next/navigation";
import { adminFetch, AdminApiError } from "@/lib/adminApi";
import { ModuleCard } from "@/components/ModuleCard";
import { GalleryForm } from "@/components/gallery/GalleryForm";
import { updateGallery } from "@/lib/actions/gallery";
import type { Gallery } from "@/types/gallery";

export default async function EditGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let gallery: Gallery;
  try {
    gallery = await adminFetch<Gallery>(`/api/admin/galleries/${id}`);
  } catch (err) {
    if (err instanceof AdminApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <ModuleCard title={`Renombrar galería: ${gallery.name}`}>
      <GalleryForm
        gallery={gallery}
        action={updateGallery.bind(null, gallery.id)}
        buttonLabel="Actualizar"
      />
    </ModuleCard>
  );
}