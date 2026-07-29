import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Link2, List, Paperclip, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/mail/format";
import type { DraftPayload } from "@/lib/mail/types";

const EMPTY: DraftPayload = { para: "", cc: "", cco: "", assunto: "", html: "", anexos: [] };

interface Props {
  open: boolean;
  initial?: Partial<DraftPayload>;
  onClose: () => void;
  onSend: (draft: DraftPayload) => void;
  onSaveDraft: (draft: DraftPayload) => void;
}

/** Editor de composição com editor rico simples, arrastar-e-soltar de anexos e auto save. */
export function ComposeDialog({ open, initial, onClose, onSend, onSaveDraft }: Props) {
  const [draft, setDraft] = useState<DraftPayload>(EMPTY);
  const [showCc, setShowCc] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const next = { ...EMPTY, ...initial };
    setDraft(next);
    setSavedAt(null);
    setShowCc(Boolean(next.cc || next.cco));
    if (editorRef.current) editorRef.current.innerHTML = next.html;
  }, [open, initial]);

  // Auto save a cada 8s enquanto houver conteúdo.
  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => {
      if (draft.para || draft.assunto || draft.html) {
        onSaveDraft(draft);
        setSavedAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      }
    }, 8000);
    return () => window.clearInterval(id);
  }, [open, draft, onSaveDraft]);

  if (!open) return null;

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setDraft((d) => ({ ...d, html: editorRef.current?.innerHTML ?? "" }));
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setDraft((d) => ({
      ...d,
      anexos: [
        ...d.anexos,
        ...Array.from(files).map((f) => ({
          nome: f.name,
          tipo: f.type || "application/octet-stream",
          tamanho: f.size,
        })),
      ],
    }));
  };

  const submit = () => {
    if (!draft.para.trim()) {
      toast.error("Informe ao menos um destinatário.");
      return;
    }
    onSend({ ...draft, html: editorRef.current?.innerHTML ?? draft.html });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div
        className={cn(
          "surface-panel animate-in slide-in-from-bottom-4 fade-in flex h-[92vh] w-full max-w-2xl flex-col overflow-hidden duration-200 sm:h-[80vh]",
          dragging && "ring-2 ring-primary",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-display text-lg">Nova mensagem</h2>
          <div className="flex items-center gap-2">
            {savedAt && <span className="text-xs text-muted-foreground">Rascunho salvo {savedAt}</span>}
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
              <X className="size-4" />
            </Button>
          </div>
        </header>

        <div className="space-y-1 px-4 py-3">
          <div className="flex items-center gap-2">
            <Input
              value={draft.para}
              onChange={(e) => setDraft({ ...draft, para: e.target.value })}
              placeholder="Para"
              className="border-0 border-b border-border px-0 shadow-none focus-visible:ring-0"
            />
            {!showCc && (
              <Button variant="ghost" size="sm" onClick={() => setShowCc(true)}>
                CC/CCO
              </Button>
            )}
          </div>
          {showCc && (
            <>
              <Input
                value={draft.cc}
                onChange={(e) => setDraft({ ...draft, cc: e.target.value })}
                placeholder="CC"
                className="border-0 border-b border-border px-0 shadow-none focus-visible:ring-0"
              />
              <Input
                value={draft.cco}
                onChange={(e) => setDraft({ ...draft, cco: e.target.value })}
                placeholder="CCO"
                className="border-0 border-b border-border px-0 shadow-none focus-visible:ring-0"
              />
            </>
          )}
          <Input
            value={draft.assunto}
            onChange={(e) => setDraft({ ...draft, assunto: e.target.value })}
            placeholder="Assunto"
            className="border-0 border-b border-border px-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex items-center gap-1 px-3 pb-2">
          <Button variant="ghost" size="icon" onClick={() => exec("bold")} aria-label="Negrito">
            <Bold className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => exec("italic")} aria-label="Itálico">
            <Italic className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => exec("insertUnorderedList")}
            aria-label="Lista"
          >
            <List className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Inserir link"
            onClick={() => {
              const url = window.prompt("URL do link");
              if (url) exec("createLink", url);
            }}
          >
            <Link2 className="size-4" />
          </Button>
        </div>
        <Separator />

        <div
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-label="Corpo da mensagem"
          onInput={(e) => setDraft({ ...draft, html: e.currentTarget.innerHTML })}
          className="scrollbar-slim flex-1 overflow-y-auto px-5 py-4 text-sm leading-relaxed outline-none [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-5"
        />

        {draft.anexos.length > 0 && (
          <ul className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
            {draft.anexos.map((anexo, i) => (
              <li
                key={`${anexo.nome}-${i}`}
                className="flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5 text-xs"
              >
                <Paperclip className="size-3" />
                <span className="max-w-40 truncate">{anexo.nome}</span>
                <span className="text-muted-foreground">{formatBytes(anexo.tamanho)}</span>
                <button
                  aria-label={`Remover ${anexo.nome}`}
                  onClick={() =>
                    setDraft({ ...draft, anexos: draft.anexos.filter((_, idx) => idx !== i) })
                  }
                >
                  <X className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <footer className="flex items-center gap-2 border-t border-border px-4 py-3">
          <Button onClick={submit} className="gap-2 rounded-xl">
            <Send className="size-4" />
            Enviar
          </Button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted">
            <Paperclip className="size-4" />
            Anexar
            <input type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
          </label>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Arraste arquivos para anexar
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Descartar"
            className="ml-auto text-destructive hover:text-destructive"
            onClick={onClose}
          >
            <Trash2 className="size-4" />
          </Button>
        </footer>
      </div>
    </div>
  );
}
