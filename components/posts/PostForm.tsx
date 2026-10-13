"use client";

import { useActionState } from "react";
import dynamic from "next/dynamic";
import { uploadUrl } from "@/lib/assets";
import { TextField, TextAreaField, SelectField, FileField, SubmitButton, FormError } from "@/components/FormField";
import type { Category } from "@/types/category";
import type { PostDetail } from "@/types/post";
import type { PostActionState } from "@/lib/actions/posts";

const RichTextEditor = dynamic(
  () => import("@/components/RichTextEditor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="col-span-4">
        <div
          className="h-72 rounded-md border-2 animate-pulse flex items-center justify-center text-sm"
          style={{ borderColor: "var(--color-input-border)", background: "var(--color-line)", color: "var(--color-ink-soft)" }}
        >
          Cargando editor…
        </div>
      </div>
    ),
  }
);

const STATUS_OPTIONS = [
  { value: "BORRADOR", label: "Borrador" },
  { value: "PUBLICADA", label: "Publicada" },
  { value: "ARCHIVADA", label: "Archivada" },
  { value: "RETENIDA", label: "Retenida" },
];

const SECTION_OPTIONS = [
  { value: "GENERAL", label: "General" },
  { value: "PRINCIPAL", label: "Principal (carrusel de portada)" },
  { value: "DESTACADA", label: "Destacada (banner rojo)" },
  { value: "RSS", label: "RSS" },
];

const CATEGORIAS_PRIMERO = [4, 3];

function ordenarCategorias(categories: Category[]): Category[] {
  const prioridad = (c: Category) => {
    const pos = CATEGORIAS_PRIMERO.indexOf(c.id);
    return pos === -1 ? CATEGORIAS_PRIMERO.length : pos;
  };
  return [...categories].sort((a, b) => prioridad(a) - prioridad(b));
}

export function PostForm({
  post,
  categories,
  action,
  buttonLabel = "Guardar",
}: {
  post?: PostDetail;
  categories: Category[];
  action: (state: PostActionState, formData: FormData) => Promise<PostActionState>;
  buttonLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const currentImage = post ? uploadUrl("posts", post.image) : null;
  const categoriasOrdenadas = ordenarCategorias(categories);

  return (
    <form action={formAction} className="w-full grid grid-cols-4 gap-5 px-4 sm:px-6 py-6">
      {currentImage && (
        <div className="col-span-4">
          <img
            className="h-40 w-auto max-w-full rounded-md object-cover border"
            style={{ borderColor: "var(--color-line)" }}
            src={currentImage}
            alt={`Imagen de portada actual de "${post?.title}"`}
          />
        </div>
      )}

      <FileField
        label="Imagen de portada"
        name="image"
        accept="image/*"
        hint={post ? "(déjalo vacío para conservar la actual)" : undefined}
        colSpan={4}
      />

      <TextField label="Título" name="title" required maxLength={255} defaultValue={post?.title} colSpan={4} />

      <TextAreaField label="Sub título" name="subtitle" required defaultValue={post?.subtitle} colSpan={4} />

      <TextField
        label="Encabezado"
        name="head"
        hint="(opcional)"
        maxLength={255}
        defaultValue={post?.head ?? ""}
        colSpan={2}
      />

      <TextAreaField
        label="Pie de foto"
        name="photoDescription"
        required
        defaultValue={post?.photoDescription}
        colSpan={2}
      />

      <SelectField
        label="Categoría"
        name="categoryId"
        required
        defaultValue={post?.categoryId ?? categoriasOrdenadas[0]?.id}
        placeholder="Selecciona una categoría"
        options={categoriasOrdenadas.map((c) => ({ value: String(c.id), label: c.name }))}
        colSpan={2}
      />

      <TextField
        label="Tipo de nota"
        name="newsType"
        required
        defaultValue={post?.newsType ?? "NOTICIA"}
        colSpan={2}
      />

      <SelectField
        label="Estatus"
        name="status"
        required
        defaultValue={post?.status ?? "PUBLICADA"}
        options={STATUS_OPTIONS}
        colSpan={2}
      />

      <SelectField
        label="Sección"
        name="section"
        required
        defaultValue={post?.section ?? "GENERAL"}
        options={SECTION_OPTIONS}
        colSpan={2}
      />

      <TextField
        label="Etiquetas"
        name="tags"
        hint="(separadas por coma)"
        defaultValue={post?.tags?.join(", ") ?? ""}
        placeholder="gobierno, elecciones, tijuana"
        colSpan={4}
      />

      <RichTextEditor name="body" label="Nota" defaultValue={post?.body} />

      <FormError message={state.error} />

      <SubmitButton pending={pending}>{pending ? "Guardando…" : buttonLabel}</SubmitButton>
    </form>
  );
}