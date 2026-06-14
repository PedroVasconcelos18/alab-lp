"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  criarComentario,
  editarComentario,
  excluirComentario,
} from "@/app/blog/actions";
import { formatarDataCompleta } from "@/lib/format";
import type { Comentario } from "@/lib/types";

export default function CommentsSection({
  postId,
  slug,
  comentariosIniciais,
  userId,
  isAdmin,
}: {
  postId: string;
  slug: string;
  comentariosIniciais: Comentario[];
  userId: string | null;
  isAdmin: boolean;
}) {
  const [comentarios, setComentarios] = useState(comentariosIniciais);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Edição inline: id do comentário em edição + o texto sendo editado.
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState("");
  const [erroEdicao, setErroEdicao] = useState<string | null>(null);

  function abrirEdicao(id: string, conteudoAtual: string) {
    setEditandoId(id);
    setTextoEdicao(conteudoAtual);
    setErroEdicao(null);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setTextoEdicao("");
    setErroEdicao(null);
  }

  function salvarEdicao(id: string) {
    const novo = textoEdicao.trim();
    if (!novo) {
      setErroEdicao("O comentário não pode ficar vazio.");
      return;
    }
    startTransition(async () => {
      const res = await editarComentario(id, slug, novo);
      if (res.erro) {
        setErroEdicao(res.erro);
        return;
      }
      setComentarios((atual) =>
        atual.map((c) => (c.id === id ? { ...c, conteudo: novo } : c)),
      );
      cancelarEdicao();
    });
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const conteudo = texto.trim();
    if (!conteudo) return;

    startTransition(async () => {
      const res = await criarComentario(postId, slug, conteudo);
      if (res.erro) {
        setErro(res.erro);
        return;
      }
      // Acrescenta de forma otimista no topo (a revalidação confirma depois).
      setComentarios((atual) => [
        {
          id: `tmp-${Date.now()}`,
          post_id: postId,
          autor_id: userId ?? "",
          conteudo,
          created_at: new Date().toISOString(),
          autor: { nome: "Você", avatar_url: null },
        },
        ...atual,
      ]);
      setTexto("");
    });
  }

  function excluir(id: string) {
    startTransition(async () => {
      const res = await excluirComentario(id, slug);
      if (!res.erro) {
        setComentarios((atual) => atual.filter((c) => c.id !== id));
      }
    });
  }

  return (
    <section className="comments" id="comentarios">
      <h2 className="comments-title">
        Comentários
        <span className="comments-count">{comentarios.length}</span>
      </h2>

      {userId ? (
        <form onSubmit={enviar} className="comment-form">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva um comentário…"
            className="comment-input"
            rows={3}
            maxLength={2000}
          />
          {erro && <p className="auth-erro">{erro}</p>}
          <div className="comment-form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={pending || !texto.trim()}
            >
              {pending ? "Enviando…" : "Comentar"}
            </button>
          </div>
        </form>
      ) : (
        <p className="comments-hint">
          <Link href={`/entrar?next=/blog/${slug}`}>Entre</Link> para deixar um
          comentário.
        </p>
      )}

      {comentarios.length === 0 ? (
        <p style={{ color: "var(--silver-400)", marginTop: 24 }}>
          Ainda não há comentários. Seja o primeiro.
        </p>
      ) : (
        <ul className="comment-list">
          {comentarios.map((c) => {
            const eAutor = c.autor_id === userId;
            const podeExcluir = isAdmin || eAutor;
            const persistido = !c.id.startsWith("tmp-");
            const emEdicao = editandoId === c.id;
            return (
              <li key={c.id} className="comment">
                <div className="comment-head">
                  <span className="comment-author">
                    {c.autor?.nome ?? "Usuário"}
                  </span>
                  <span className="comment-meta-right">
                    <span className="comment-date">
                      {formatarDataCompleta(c.created_at)}
                    </span>
                    {/* Editar (lápis): só o autor. Excluir (lixeira): autor ou admin. */}
                    {eAutor && persistido && !emEdicao && (
                      <button
                        type="button"
                        onClick={() => abrirEdicao(c.id, c.conteudo)}
                        className="comment-icon-btn"
                        disabled={pending}
                        aria-label="Editar comentário"
                        title="Editar"
                      >
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                          <path d="M11.5 2.5l2 2L6 12l-2.5.5L4 10l7.5-7.5z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                    {podeExcluir && persistido && !emEdicao && (
                      <button
                        type="button"
                        onClick={() => excluir(c.id)}
                        className="comment-icon-btn comment-icon-danger"
                        disabled={pending}
                        aria-label="Excluir comentário"
                        title="Excluir"
                      >
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                          <path d="M2.5 4h11M6 4V2.5h4V4M5 4l.5 9h5L11 4M6.5 6.5v4M9.5 6.5v4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </span>
                </div>

                {emEdicao ? (
                  <div className="comment-edit">
                    <textarea
                      value={textoEdicao}
                      onChange={(e) => setTextoEdicao(e.target.value)}
                      className="comment-input"
                      rows={3}
                      maxLength={2000}
                      autoFocus
                    />
                    {erroEdicao && <p className="auth-erro">{erroEdicao}</p>}
                    <div className="comment-edit-actions">
                      <button
                        type="button"
                        onClick={() => salvarEdicao(c.id)}
                        className="btn btn-primary"
                        disabled={pending || !textoEdicao.trim()}
                      >
                        {pending ? "Salvando…" : "Salvar"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelarEdicao}
                        className="comment-action"
                        disabled={pending}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="comment-body">{c.conteudo}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
