import { adminFetch } from "@/lib/adminApi";
import { getSession } from "@/lib/session";
import { ModuleCard } from "@/components/ModuleCard";
import { PostForm } from "@/components/posts/PostForm";
import { createPost } from "@/lib/actions/posts";
import type { Category } from "@/types/category";
import type { PostUserOption } from "@/types/post";

export default async function NewPostPage() {
  const session = await getSession();
  const [categories, usuarios] = await Promise.all([
    adminFetch<Category[]>("/api/admin/categories"),
    adminFetch<PostUserOption[]>("/api/admin/posts/usuarios").catch(() => [] as PostUserOption[]),
  ]);

  return (
    <ModuleCard title="Crear noticia">
      <PostForm
        categories={categories}
        usuarios={usuarios}
        currentUserId={session?.user.id}
        roles={session?.user.roles ?? []}
        action={createPost}
      />
    </ModuleCard>
  );
}