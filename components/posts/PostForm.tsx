"use client";

import { useActionState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { uploadUrl } from "@/lib/assets";
import { TextField, TextAreaField, SelectField, FileField, SubmitButton, FormError } from "@/components/FormField";
import type { Category } from "@/types/category";
import type { PostDetail, PostUserOption } from "@/types/post";
import { ROLE_ADMIN } from "@/lib/roles";
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
  const primero = CATEGORIAS_PRIMERO
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is Category => Boolean(c));
  const resto = categories.filter((c) => !CATEGORIAS_PRIMERO.includes(c.id));
  return [...primero, ...resto];
}

const CAMPOS_BORRADOR = [
  "title",
  "subtitle",
  "photoDescription",
  "categoryId",
  "newsType",
  "status",
  "section",
  "tags",
  "autorId",
  "userId",
];

export function PostForm({
  post,
  categories,
  usuarios = [],
  currentUserId,
  roles = [],
  action,
  buttonLabel = "Guardar",
}: {
  post?: PostDetail;
  categories: Category[];
  usuarios?: PostUserOption[];
  currentUserId?: number;
  roles?: string[];
  action: (state: PostActionState, formData: FormData) => Promise<PostActionState>;
  buttonLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const currentImage = post ? uploadUrl("posts", post.image) : null;
  const categoriasOrdenadas = ordenarCategorias(categories);

  const opcionesUsuarios = usuarios.map((u) => ({ value: String(u.id), label: u.name }));
  const mostrarUsuarios = opcionesUsuarios.length > 0;
  const puedeElegirEditor = roles.includes(ROLE_ADMIN);
  const corresponsalInicial = post?.autorId ?? post?.userId ?? currentUserId;
  const redactorInicial = post?.userId ?? currentUserId;
  const nombreDeUsuario = (id?: number | null) =>
    usuarios.find((u) => u.id === id)?.name ?? "";
  const nombreEditor = post
    ? post.userName || nombreDeUsuario(post.userId)
    : nombreDeUsuario(currentUserId);

  const pathname = usePathname();
  const storageKey = `borrador-nota:${pathname}`;
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    try {
      const guardado = window.sessionStorage.getItem(`${storageKey}:campos`);
      if (guardado) {
        const valores = JSON.parse(guardado) as Record<string, string>;
        for (const campo of CAMPOS_BORRADOR) {
          const el = form.elements.namedItem(campo) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
          if (el && valores[campo] !== undefined) el.value = valores[campo];
        }
      }
    } catch {}

    function guardar() {
      if (!form) return;
      const valores: Record<string, string> = {};
      for (const campo of CAMPOS_BORRADOR) {
        const el = form.elements.namedItem(campo) as HTMLInputElement | null;
        if (el) valores[campo] = el.value;
      }
      try {
        window.sessionStorage.setItem(`${storageKey}:campos`, JSON.stringify(valores));
      } catch {}
    }

    form.addEventListener("input", guardar);
    form.addEventListener("change", guardar);

    return () => {
      form.removeEventListener("input", guardar);
      form.removeEventListener("change", guardar);
      try {
        window.sessionStorage.removeItem(`${storageKey}:campos`);
      } catch {}
    };
  }, [storageKey]);

  return (
    <form ref={formRef} action={formAction} className="w-full grid grid-cols-4 gap-5 px-4 sm:px-6 py-6">
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
        accept="image/jpeg,image/png"
        hint={post ? "(déjalo vacío para conservar la actual · JPG/PNG, máx. 1 MB)" : "(JPG/PNG, máx. 1 MB)"}
        colSpan={4}
      />

      <TextField label="Título" name="title" required maxLength={255} defaultValue={post?.title} colSpan={4} />

      <TextAreaField
        label="Sub título"
        name="subtitle"
        required
        defaultValue={post?.subtitle}
        colSpan={4}
        className="resize-y"
        style={{ borderColor: "var(--color-input-border)", height: 160 }}
      />

      <TextField
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
        defaultValue={post?.section ?? "PRINCIPAL"}
        options={SECTION_OPTIONS}
        colSpan={2}
      />

      <TextField
        label="Etiquetas"
        name="tags"
        hint="(separadas por coma)"
        defaultValue={post?.tags?.join(", ") ?? ""}
        placeholder="gobierno, elecciones, tijuana"
        colSpan={2}
      />

      {mostrarUsuarios && (
        <SelectField
          label="Corresponsal"
          name="autorId"
          defaultValue={corresponsalInicial ? String(corresponsalInicial) : ""}
          placeholder="Selecciona el corresponsal"
          options={opcionesUsuarios}
          colSpan={2}
        />
      )}

      {mostrarUsuarios && puedeElegirEditor && (
        <SelectField
          label="Editor"
          name="userId"
          hint="(quién escribió la nota)"
          defaultValue={redactorInicial ? String(redactorInicial) : ""}
          placeholder="Selecciona un editor"
          options={opcionesUsuarios}
          colSpan={2}
        />
      )}

      {mostrarUsuarios && !puedeElegirEditor && (
        <TextField
          label="Editor"
          hint="(quién escribió la nota)"
          value={nombreEditor}
          readOnly
          tabIndex={-1}
          colSpan={2}
          className="cursor-default"
          style={{ borderColor: "var(--color-line)", background: "var(--color-line)" }}
        />
      )}

      <RichTextEditor name="body" label="Nota" defaultValue={post?.body} storageKey={`${storageKey}:body`} />

      <FormError message={state.error} />

      <SubmitButton pending={pending}>{pending ? "Guardando…" : buttonLabel}</SubmitButton>
    </form>
  );
}