"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleLike } from "@/app/blog/actions";

export default function LikeButton({
  postId,
  slug,
  likesIniciais,
  jaCurtiu,
  logado,
}: {
  postId: string;
  slug: string;
  likesIniciais: number;
  jaCurtiu: boolean;
  logado: boolean;
}) {
  const router = useRouter();
  const [curtiu, setCurtiu] = useState(jaCurtiu);
  const [likes, setLikes] = useState(likesIniciais);
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!logado) {
      router.push(`/entrar?next=/blog/${slug}`);
      return;
    }
    // UI otimista
    const novoCurtiu = !curtiu;
    setCurtiu(novoCurtiu);
    setLikes((n) => n + (novoCurtiu ? 1 : -1));

    startTransition(async () => {
      const res = await toggleLike(postId, slug);
      if (res.erro) {
        // reverte se falhou
        setCurtiu(curtiu);
        setLikes(likesIniciais);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`like-btn${curtiu ? " is-liked" : ""}`}
      aria-pressed={curtiu}
      disabled={pending}
      title={logado ? (curtiu ? "Descurtir" : "Curtir") : "Entre para curtir"}
    >
      <span className="like-heart">{curtiu ? "♥" : "♡"}</span>
      <span>{likes}</span>
    </button>
  );
}
