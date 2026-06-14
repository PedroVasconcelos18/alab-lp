"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { Post, PostStatus } from "@/lib/types";
import type { AdminState } from "@/app/admin/actions";

type Action = (prev: AdminState, formData: FormData) => Promise<AdminState>;

export default function PostEditor({
  action,
  post,
}: {
  action: Action;
  post?: Post;
}) {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(
    action,
    null,
  );

  const [conteudo, setConteudo] = useState(post?.conteudo_md ?? "");
  const [titulo, setTitulo] = useState(post?.titulo ?? "");
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "rascunho");

  return (
    <form action={formAction} className="editor">
      <div className="editor-bar">
        <Link href="/admin" className="post-back">
          ← Painel
        </Link>
        <div className="editor-bar-actions">
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PostStatus)}
            className="editor-status"
          >
            <option value="rascunho">Rascunho</option>
            <option value="publicado">Publicado</option>
          </select>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Salvando…" : post ? "Salvar" : "Criar post"}
          </button>
        </div>
      </div>

      {state?.erro && <p className="auth-erro">{state.erro}</p>}

      <div className="editor-fields">
        <input
          type="text"
          name="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título do post"
          className="editor-titulo"
          required
        />

        <div className="editor-grid">
          <label className="auth-label">
            Slug (URL)
            <input
              type="text"
              name="slug"
              defaultValue={post?.slug ?? ""}
              placeholder="deixe vazio para gerar do título"
              className="auth-input"
            />
          </label>
          <label className="auth-label">
            Categoria
            <input
              type="text"
              name="categoria"
              defaultValue={post?.categoria ?? ""}
              placeholder="Frameworks, M&A…"
              className="auth-input"
            />
          </label>
          <label className="auth-label">
            Tempo de leitura (min)
            <input
              type="number"
              name="tempo_leitura"
              defaultValue={post?.tempo_leitura ?? ""}
              placeholder="8"
              min={1}
              className="auth-input"
            />
          </label>
          <label className="auth-label">
            URL da capa (opcional)
            <input
              type="url"
              name="capa_url"
              defaultValue={post?.capa_url ?? ""}
              placeholder="https://…"
              className="auth-input"
            />
          </label>
        </div>

        <label className="auth-label">
          Resumo (excerpt)
          <textarea
            name="excerpt"
            defaultValue={post?.excerpt ?? ""}
            placeholder="Aparece na listagem do blog."
            className="comment-input"
            rows={2}
          />
        </label>
      </div>

      <div className="editor-split">
        <div className="editor-pane">
          <span className="editor-pane-label">Markdown</span>
          <textarea
            name="conteudo_md"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="# Escreva em Markdown…"
            className="editor-md"
            required
          />
        </div>
        <div className="editor-pane">
          <span className="editor-pane-label">Preview</span>
          <div className="editor-preview post-body">
            {conteudo.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {conteudo}
              </ReactMarkdown>
            ) : (
              <p style={{ color: "var(--silver-400)" }}>
                O preview aparece aqui conforme você escreve.
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
