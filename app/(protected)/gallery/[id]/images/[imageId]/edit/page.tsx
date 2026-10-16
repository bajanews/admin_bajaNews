import { notFound } from "next/navigation";
import { adminFetch, AdminApiError } from "@/lib/adminApi";
import { uploadUrl } from "@/lib/assets";
import { ModuleCard } from "@/components/ModuleCard";
import { ImageCaptionForm } from "@/components/gallery/ImageCaptionForm";
import { updateImageCaption } from "@/lib/actions/gallery";
import type { GalleryImage } from "@/types/gallery";

export default async function EditImagePage({
  params,
}: {
  params: Promise<{ id: string; imageId: string }>;
}) {
  const { id, imageId } = await params;

  let images: GalleryImage[];
  try {
    images = await adminFetch<GalleryImage[]>(`/api/admin/galleries/${id}/images`);
  } catch (err) {
    if (err instanceof AdminApiError && err.status === 404) notFound();
    throw err;
  }

  const image = images.find((i) => String(i.id) === imageId);
  if (!image) notFound();

  const src = uploadUrl("images-gallery", image.name);

  return (
    <ModuleCard title="Editar pie de foto">
      {src && (
        <div className="px-4 sm:px-6 pt-6">
          <img
            className="h-40 w-auto max-w-full rounded-md object-cover border"
            style={{ borderColor: "var(--color-line)" }}
            src={src}
            alt={image.caption}
          />
        </div>
      )}
      <ImageCaptionForm image={image} action={updateImageCaption.bind(null, Number(id), image.id)} />
    </ModuleCard>
  );
}