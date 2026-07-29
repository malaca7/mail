import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Link2, List, Paperclip, Send, Trash2, X, Lock, ShieldCheck, UploadCloud } from "lucide-react";
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

export function ComposeDialog({ open, initial, onClose, onSend, onSaveDraft }: Props) {
  const [draft, setDraft] = useState<DraftPayload>(EMPTY);
  const [showCc, setShowCc] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [encryptEnabled, setEncryptEnabled] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const next = { ...EMPTY, ...initial };
    setDraft(next);
    setSavedAt(null);
    setShowCc(Boolean(next.cc || next.cco));
    if (editorRef.current) editorRef.current.innerHTML = next.html;
  }, [open, initial]);

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md p-0 sm:items-center sm:p-6 animate-in fade-in duration-200">
      <div
        className={cn(
          "glass-card border border-border/80 shadow-2xl flex h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl duration-200 sm:h-[82vh]",
          dragging && "ring-2 ring-primary glow-border"
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
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border/60 bg-surface/40 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-base font-semibold tracking-tight text-foreground">Nova Mensagem</h2>
            <button
              onClick={() => setEncryptEnabled(!encryptEnabled)}
              className={cn(
                "hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono transition-colors border",
                encryptEnabled
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-muted border-border text-muted-foreground"
              )}
            >
              <Lock className="size-3" />
              {encryptEnabled ? "Criptografia TLS Ativa" : "Sem Criptografia"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {savedAt && (
              <span className="text-[11px] font-mono text-muted-foreground/80">
                Salvo às {savedAt}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar" className="rounded-xl">
              <X className="size-4" />
            </Button>
          </div>
        </header>

        {/* Recipients Form */}
        <div className="space-y-2 px-5 py-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-muted-foreground w-12 shrink-0">Para:</span>
            <Input
              value={draft.para}
              onChange={(e) => setDraft({ ...draft, para: e.target.value })}
              placeholder="destinatario@exemplo.com"
              className="border-0 border-b border-border/60 px-0 shadow-none focus-visible:ring-0 rounded-none bg-transparent font-mono text-sm"
            />
            {!showCc && (
              <Button variant="ghost" size="sm" onClick={() => setShowCc(true)} className="text-xs font-mono rounded-lg">
                CC / CCO
              </Button>
            )}
          </div>

          {showCc && (
            <>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold text-muted-foreground w-12 shrink-0">CC:</span>
                <Input
                  value={draft.cc}
                  onChange={(e) => setDraft({ ...draft, cc: e.target.value })}
                  placeholder="copia@exemplo.com"
                  className="border-0 border-b border-border/60 px-0 shadow-none focus-visible:ring-0 rounded-none bg-transparent font-mono text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold text-muted-foreground w-12 shrink-0">CCO:</span>
                <Input
                  value={draft.cco}
                  onChange={(e) => setDraft({ ...draft, cco: e.target.value })}
                  placeholder="oculto@exemplo.com"
                  className="border-0 border-b border-border/60 px-0 shadow-none focus-visible:ring-0 rounded-none bg-transparent font-mono text-sm"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-mono font-semibold text-muted-foreground w-12 shrink-0">Assunto:</span>
            <Input
              value={draft.assunto}
              onChange={(e) => setDraft({ ...draft, assunto: e.target.value })}
              placeholder="Digite o assunto da mensagem..."
              className="border-0 border-b border-border/60 px-0 shadow-none focus-visible:ring-0 rounded-none bg-transparent text-sm font-medium"
            />
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 px-4 py-2 bg-surface/30 border-y border-border/60">
          <Button variant="ghost" size="icon" onClick={() => exec("bold")} aria-label="Negrito" className="size-8 rounded-lg">
            <Bold className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => exec("italic")} aria-label="Itálico" className="size-8 rounded-lg">
            <Italic className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => exec("insertUnorderedList")} aria-label="Lista" className="size-8 rounded-lg">
            <List className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg"
            aria-label="Inserir link"
            onClick={() => {
              const url = window.prompt("URL do link");
              if (url) exec("createLink", url);
            }}
          >
            <Link2 className="size-3.5" />
          </Button>
        </div>

        {/* Rich Text Editor */}
        <div
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-label="Corpo da mensagem"
          onInput={(e) => setDraft({ ...draft, html: e.currentTarget.innerHTML })}
          className="scrollbar-slim flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed outline-none [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-5 text-foreground"
        />

        {/* Drag Overlay Helper */}
        {dragging && (
          <div className="absolute inset-0 z-50 bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center border-2 border-dashed border-primary rounded-2xl text-primary">
            <UploadCloud className="size-12 animate-bounce mb-2" />
            <p className="font-display text-lg font-semibold">Solte os arquivos para anexar</p>
          </div>
        )}

        {/* Attachments List */}
        {draft.anexos.length > 0 && (
          <ul className="flex flex-wrap gap-2 border-t border-border/60 bg-muted/20 px-5 py-3">
            {draft.anexos.map((anexo, i) => (
              <li
                key={`${anexo.nome}-${i}`}
                className="flex items-center gap-2 rounded-xl bg-surface border border-border/80 px-3 py-1.5 text-xs font-mono"
              >
                <Paperclip className="size-3 text-primary" />
                <span className="max-w-40 truncate">{anexo.nome}</span>
                <span className="text-muted-foreground">({formatBytes(anexo.tamanho)})</span>
                <button
                  aria-label={`Remover ${anexo.nome}`}
                  className="hover:text-destructive transition-colors ml-1"
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

        {/* Footer Actions */}
        <footer className="flex items-center justify-between border-t border-border/60 bg-surface/50 px-5 py-3">
          <div className="flex items-center gap-3">
            <Button onClick={submit} className="gap-2 rounded-xl h-10 px-5 font-semibold shadow-tech glow-border">
              <Send className="size-4" />
              Enviar Mensagem
            </Button>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border/80 bg-background px-3.5 py-2 text-xs font-mono text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Paperclip className="size-3.5" />
              Anexar Arquivo
              <input type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            </label>
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Descartar"
            className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onClose}
          >
            <Trash2 className="size-4" />
          </Button>
        </footer>
      </div>
    </div>
  );
}
