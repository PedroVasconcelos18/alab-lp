"use client";

import Link from "next/link";
import { useTransition } from "react";
import { alternarStatus, excluirPost } from "@/app/admin/actions";
import type { PostStatus } from "@/lib/types";

export default function PostRowActions({
  id,
  slug,
  status,
  titulo,
}: {
  id: string;
  slug: string;
  status: PostStatus;
  titulo: string;
}) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await alternarStatus(id, status === "publicado" ? "rascunho" : "publicado");
    });
  }

  function remover() {
    if (!confirm(`Excluir "${titulo}"? Esta ação não pode ser desfeita.`)) return;
    startTransition(async () => {
      await excluirPost(id);
    });
  }

  return (
    <div className="admin-row-actions">
      {status === "publicado" && (
        <Link
          href={`/blog/${slug}`}
          target="_blank"
          className="admin-action"
          title="Ver no site"
        >
          Ver
        </Link>
      )}
      <button
        type="button"
        onClick={toggle}
        className="admin-action"
        disabled={pending}
      >
        {status === "publicado" ? "Despublicar" : "Publicar"}
      </button>
      <Link href={`/admin/posts/${id}`} className="admin-action">
        Editar
      </Link>
      <button
        type="button"
        onClick={remover}
        className="admin-action admin-action-danger"
        disabled={pending}
      >
        Excluir
      </button>
    </div>
  );
}
