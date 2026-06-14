import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { obterPostPorId } from "@/lib/posts";
import { editarPost } from "@/app/admin/actions";
import PostEditor from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

export default async function EditarPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const post = await obterPostPorId(id);
  if (!post) notFound();

  // Liga a action ao id do post.
  const action = editarPost.bind(null, id);

  return (
    <main className="admin">
      <div className="admin-shell">
        <PostEditor action={action} post={post} />
      </div>
    </main>
  );
}
