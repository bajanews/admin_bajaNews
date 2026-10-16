import { ModuleCard } from "@/components/ModuleCard";
import { GalleryForm } from "@/components/gallery/GalleryForm";
import { createGallery } from "@/lib/actions/gallery";

export default function NewGalleryPage() {
  return (
    <ModuleCard title="Nueva galería">
      <GalleryForm action={createGallery} buttonLabel="Crear galería" />
    </ModuleCard>
  );
}