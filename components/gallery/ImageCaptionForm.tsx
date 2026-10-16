"use client";

import { useActionState } from "react";
import { TextField, SubmitButton, FormError } from "@/components/FormField";
import type { GalleryImage } from "@/types/gallery";
import type { GalleryActionState } from "@/lib/actions/gallery";

export function ImageCaptionForm({
  image,
  action,
}: {
  image: GalleryImage;
  action: (state: GalleryActionState, formData: FormData) => Promise<GalleryActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="w-full grid grid-cols-4 gap-5 px-4 sm:px-6 py-6">
      <TextField
        label="Pie de foto"
        name="caption"
        required
        maxLength={255}
        defaultValue={image.caption}
        colSpan={4}
      />

      <FormError message={state.error} />

      <SubmitButton pending={pending}>{pending ? "Guardando…" : "Actualizar"}</SubmitButton>
    </form>
  );
}