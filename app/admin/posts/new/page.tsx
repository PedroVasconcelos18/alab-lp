import { requireAdmin } from "@/lib/auth";
import { criarPost } from "@/app/admin/actions";
import PostEditor from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

export default async function NovoPostPage() {
  await requireAdmin();
  return (
    <main className="admin">
      <div className="admin-shell">
        <PostEditor action={criarPost} />
      </div>
    </main>
  );
}
