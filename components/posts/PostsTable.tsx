import Link from "next/link";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";
import { deletePost } from "@/lib/actions/posts";
import { canDeletePosts, canEditPost } from "@/lib/roles";
import type { PostListItem } from "@/types/post";

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  PUBLICADA: { bg: "var(--color-success-tint)", fg: "var(--color-success)" },
  BORRADOR: { bg: "var(--color-warning-tint)", fg: "var(--color-warning)" },
  ARCHIVADA: { bg: "var(--color-line)", fg: "var(--color-ink-soft)" },
  RETENIDA: { bg: "var(--color-warning-tint)", fg: "var(--color-warning)" },
};

export function PostsTable({
  posts,
  returnTo,
  roles,
  currentUserId,
}: {
  posts: PostListItem[];
  returnTo: string;
  roles: string[];
  currentUserId: number;
}) {
  const canDelete = canDeletePosts(roles);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm" style={{ tableLayout: "fixed" }}>
        <caption className="sr-only">Lista de noticias</caption>
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--color-line)" }}>
            <th scope="col" className="w-[5%] px-4 sm:px-6 py-3 text-left font-semibold text-[var(--color-ink-soft)]">#</th>
            <th scope="col" className="w-[38%] px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Título</th>
            <th scope="col" className="w-[12%] px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Creado</th>
            <th scope="col" className="w-[12%] px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Estatus</th>
            <th scope="col" className="w-[18%] px-4 py-3 text-left font-semibold text-[var(--color-ink-soft)]">Categoría</th>
            <th scope="col" className="w-[15%] px-4 sm:px-6 py-3 text-left font-semibold text-[var(--color-ink-soft)]">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-6 text-[var(--color-ink-soft)]">
                No hay noticias todavía.
              </td>
            </tr>
          )}
          {posts.map((post) => {
            const statusStyle = STATUS_STYLES[post.status] ?? STATUS_STYLES.ARCHIVADA;
            const canEdit = canEditPost(roles, currentUserId, post.userId);
            return (
            <tr key={post.id} className="border-b last:border-0" style={{ borderColor: "var(--color-line)" }}>
                <td className="px-4 sm:px-6 py-3 font-tabular text-[var(--color-ink-soft)]">{post.id}</td>
                <td className="px-4 py-3 text-[var(--color-ink)]">
                  <p className="truncate" title={post.title}>
                    {post.title}
                  </p>
                </td>
                <td className="px-4 py-3 font-tabular text-[var(--color-ink-soft)] whitespace-nowrap">
                  {post.createdAt ? post.createdAt.slice(0, 10) : ""}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: statusStyle.bg, color: statusStyle.fg }}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--color-ink)]">{post.categoryName}</td>
                <td className="px-4 sm:px-6 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/posts/${post.id}`}
                      aria-label={`Ver noticia: ${post.title}`}
                      className="p-2 rounded-md hover:bg-[var(--color-line)] cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    {canEdit && (
                      <Link
                        href={`/posts/${post.id}/edit`}
                        aria-label={`Editar noticia: ${post.title}`}
                        className="p-2 rounded-md hover:bg-[var(--color-line)] cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                    )}
                    {canDelete && (
                      <ConfirmDeleteForm
                        action={deletePost.bind(null, post.id, returnTo)}
                        confirmMessage={`¿Borrar la noticia "${post.title}"? Esta acción no se puede deshacer.`}
                      >
                        <button
                          type="submit"
                          aria-label={`Borrar noticia: ${post.title}`}
                          className="p-2 rounded-md hover:bg-[var(--color-danger-tint)] cursor-pointer"
                          style={{ color: "var(--color-danger)" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </ConfirmDeleteForm>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
