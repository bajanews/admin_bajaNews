"use client";

import { useActionState } from "react";
import { TextField, FileField, SubmitButton, FormError } from "@/components/FormField";
import type { GalleryActionState } from "@/lib/actions/gallery";

export function ImageUploadForm({
  action,
}: {
  action: (state: GalleryActionState, formData: FormData) => Promise<GalleryActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="w-full grid grid-cols-4 gap-5 px-4 sm:px-6 py-6">
      <FileField
        label="Imágenes"
        hint="(JPG o PNG, máximo 1 MB cada una)"
        name="files"
        accept="image/jpeg,image/png"
        multiple
        colSpan={2}
      />

      <TextField
        label="Pie de foto"
        hint="(se aplica a todas las imágenes que subas)"
        name="Caption"
        required
        maxLength={255}
        colSpan={2}
      />

      <FormError message={state.error} />

      <SubmitButton pending={pending}>{pending ? "Subiendo…" : "Subir"}</SubmitButton>
    </form>
  );
}