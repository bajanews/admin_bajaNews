"use client";

import { useActionState } from "react";
import { TextField, SubmitButton, FormError } from "@/components/FormField";
import type { Gallery } from "@/types/gallery";
import type { GalleryActionState } from "@/lib/actions/gallery";

export function GalleryForm({
  gallery,
  action,
  buttonLabel = "Guardar",
}: {
  gallery?: Gallery;
  action: (state: GalleryActionState, formData: FormData) => Promise<GalleryActionState>;
  buttonLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="w-full grid grid-cols-4 gap-5 px-4 sm:px-6 py-6">
      <TextField
        label="Nombre de la galería"
        name="name"
        required
        maxLength={255}
        defaultValue={gallery?.name}
        colSpan={2}
      />

      <FormError message={state.error} />

      <SubmitButton pending={pending}>{pending ? "Guardando…" : buttonLabel}</SubmitButton>
    </form>
  );
}