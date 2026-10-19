import Link from "next/link";
import { notFound } from "next/navigation";
import { adminFetch, AdminApiError } from "@/lib/adminApi";
import { getSession } from "@/lib/session";
import { canDeletePosts, canEditPost } from "@/lib/roles";
import { uploadUrl } from "@/lib/assets";
import { ModuleCard } from "@/components/ModuleCard";
import { FlashBanner } from "@/components/FlashBanner";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";
import { deletePost } from "@/lib/actions/posts";
import type { PostDetail } from "@/types/post";

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  PUBLICADA: { bg: "var(--color-success-tint)", fg: "var(--color-success)" },
  BORRADOR: { bg: "var(--color-warning-tint)", fg: "var(--color-warning)" },
  RETENIDA: { bg: "var(--color-danger-tint)", fg: "var(--color-danger)" },
  ARCHIVADA: { bg: "var(--color-line)", fg: "var(--color-ink-soft)" },
};

function fechaLarga(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function PostShowPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const { ok, error } = await searchParams;
  const session = await getSession();

  let post: PostDetail;
  try {
    post = await adminFetch<PostDetail>(`/api/admin/posts/${id}`);
  } catch (err) {
    if (err instanceof AdminApiError && err.status === 404) notFound();
    throw err;
  }

  const roles = session?.user.roles ?? [];
  const canEdit = canEditPost(roles, session?.user.id ?? -1, post.userId);
  const canDelete = canDeletePosts(roles);

  const imgSrc = uploadUrl("posts", post.image);
  const statusStyle = STATUS_STYLES[post.status] ?? STATUS_STYLES.ARCHIVADA;

  return (
    <ModuleCard title="Vista previa de la noticia">
      <FlashBanner ok={ok} error={error} />

      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 sm:px-6 py-3 text-sm border-b"
        style={{ borderColor: "var(--color-line)" }}
      >
        <span className="font-tabular text-[var(--color-ink-soft)]">#{post.id}</span>
        <span
          className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: statusStyle.bg, color: statusStyle.fg }}
        >
          {post.status}
        </span>
        <span className="text-[var(--color-ink-soft)]">
          {post.newsType || "NOTICIA"} · {post.section || "GENERAL"}
        </span>
        <span className="text-[var(--color-ink-soft)]">
          Corresponsal: <strong className="text-[var(--color-ink)]">{post.autorName ?? "—"}</strong>
        </span>
        <span className="text-[var(--color-ink-soft)]">
          Redactó: <strong className="text-[var(--color-ink)]">{post.userName ?? post.authorEmail}</strong>
        </span>
        <span className="text-[var(--color-ink-soft)] font-tabular">
          Creado {post.createdAt?.slice(0, 10)}
          {post.updatedAt ? ` · Actualizado ${post.updatedAt.slice(0, 10)}` : ""}
        </span>
      </div>

      <article className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-8">
        <div className="mb-4">
          <span className="inline-block bg-red-600 px-3.5 py-1.5 text-xs font-bold uppercase text-white">
            {post.categoryName}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold leading-tight text-[var(--color-ink)]">
          {post.title}
        </h1>

        {post.head && (
          <p className="mt-2 text-base font-semibold text-[var(--color-ink-soft)]">{post.head}</p>
        )}

        <div className="mt-4 border-b-2 border-red-700 pb-2">
          <span className="font-semibold text-red-700">{post.autorName ?? post.userName ?? "BajaNews"}</span>
          {" | "}
          <span className="font-semibold">BajaNews</span>
        </div>

        <p className="mt-3 text-sm italic text-[var(--color-ink-soft)]">
          Publicado: {fechaLarga(post.createdAt)}
          {post.updatedAt && ` · Actualizado: ${fechaLarga(post.updatedAt)}`}
        </p>

        {imgSrc ? (
          <figure className="mt-6">
            <img
              className="w-full aspect-video object-cover rounded-md"
              src={imgSrc}
              alt={post.photoDescription || post.title}
            />
            {post.photoDescription && (
              <figcaption className="mt-2 text-sm text-[var(--color-ink-soft)]">{post.photoDescription}</figcaption>
            )}
          </figure>
        ) : (
          <div
            className="mt-6 flex aspect-video items-center justify-center rounded-md text-sm"
            style={{ background: "var(--color-line)", color: "var(--color-ink-soft)" }}
          >
            Sin imagen de portada
          </div>
        )}

        <p className="my-5 text-lg lg:text-xl italic font-semibold text-justify">{post.subtitle}</p>

        <div className="contenido-nota" dangerouslySetInnerHTML={{ __html: post.body }} />

        {post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="bg-gray-300 px-2 py-1 text-sm text-black">
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      <div className="flex flex-wrap gap-3 px-4 sm:px-6 py-6 border-t" style={{ borderColor: "var(--color-line)" }}>
        {canEdit && (
          <Link
            href={`/posts/${post.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-semibold cursor-pointer"
            style={{ background: "var(--color-cta)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modificar
          </Link>
        )}

        {canDelete && (
          <ConfirmDeleteForm
            action={deletePost.bind(null, post.id, "/posts")}
            confirmMessage={`¿Borrar la noticia "${post.title}"? Esta acción no se puede deshacer.`}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-semibold cursor-pointer"
              style={{ background: "var(--color-danger)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Borrar
            </button>
          </ConfirmDeleteForm>
        )}

        <Link
          href="/posts"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold border-2 cursor-pointer"
          style={{ borderColor: "var(--color-input-border)", color: "var(--color-ink)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver a noticias
        </Link>
      </div>
    </ModuleCard>
  );
}