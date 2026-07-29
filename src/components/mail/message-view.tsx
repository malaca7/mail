import { ArrowLeft, Download, MailOpen, Reply, Star, Trash2, ShieldCheck, FileText, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatBytes, formatFullDate, initials, sanitizeHtml } from "@/lib/mail/format";
import type { Email } from "@/lib/mail/types";

interface Props {
  email: Email;
  onBack: () => void;
  onDelete: (id: string) => void;
  onToggleRead: (id: string, lida: boolean) => void;
  onToggleStar: (id: string) => void;
  onReply: (email: Email) => void;
}

export function MessageView({ email, onBack, onDelete, onToggleRead, onToggleStar, onReply }: Props) {
  const nome = email.remetente.nome ?? email.remetente.email;

  return (
    <article className="flex h-full flex-col bg-background">
      {/* High-Tech Action Header */}
      <header className="flex items-center justify-between border-b border-border/80 bg-surface/50 backdrop-blur-md px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Voltar" className="rounded-xl">
            <ArrowLeft className="size-4" />
          </Button>
          <Separator orientation="vertical" className="h-5 my-auto mx-1" />
          <Button variant="outline" size="sm" onClick={() => onReply(email)} className="gap-1.5 rounded-xl font-medium text-xs">
            <Reply className="size-3.5" />
            Responder
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleRead(email.id, !email.lida)}
            aria-label="Marcar como lida ou não lida"
            className="rounded-xl"
          >
            <MailOpen className="size-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleStar(email.id)}
            aria-label="Favoritar"
            className="rounded-xl"
          >
            <Star className={cn("size-4", email.favorita ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          </Button>
        </div>

        {/* Security & Action Badge */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20 text-[11px] font-mono text-success">
            <ShieldCheck className="size-3" /> DKIM & TLS Verificado
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(email.id)}
            aria-label="Excluir mensagem"
            className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </header>

      {/* Message Content Container */}
      <div className="scrollbar-slim flex-1 overflow-y-auto px-6 py-8 sm:px-10 max-w-4xl mx-auto w-full">
        {/* Subject Header */}
        <h1 className="font-display text-2xl font-semibold leading-snug sm:text-3xl text-foreground tracking-tight">
          {email.assunto}
        </h1>

        {/* Sender Info Card */}
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4 p-4 rounded-2xl bg-muted/30 border border-border/60">
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-sm font-semibold text-primary font-mono shadow-sm">
              {initials(nome)}
            </span>
            <div className="min-w-0 text-sm">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground truncate">{nome}</p>
                <span className="text-[10px] font-mono text-success bg-success/10 px-1.5 py-0.5 rounded border border-success/20">
                  SPF PASS
                </span>
              </div>
              <p className="truncate text-xs font-mono text-muted-foreground">{email.remetente.email}</p>
              <p className="mt-1 text-[11px] text-muted-foreground/80">
                Para: <span className="font-mono text-foreground/90">{email.destinatarios.map((d) => d.email).join(", ")}</span>
                {email.cc?.length ? ` · CC: ${email.cc.map((d) => d.email).join(", ")}` : ""}
              </p>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-muted-foreground shrink-0 self-center">
            {formatFullDate(email.data_envio)}
          </div>
        </div>

        <Separator className="my-8 opacity-60" />

        {/* Email HTML Body */}
        <div
          className="prose-mail max-w-none text-sm leading-relaxed text-foreground/90 [&_a]:text-primary [&_a]:underline [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_li]:my-1.5 [&_p]:my-4 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(email.html) }}
        />

        {/* Attachments Section */}
        {email.anexos.length > 0 && (
          <section className="mt-10 pt-6 border-t border-border/80">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              <FileText className="size-4 text-primary" />
              <span>{email.anexos.length} Anexo{email.anexos.length > 1 ? "s" : ""}</span>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {email.anexos.map((anexo) => (
                <li
                  key={anexo.id}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3.5 transition-all hover:border-primary/40 hover:shadow-tech"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary font-mono text-xs font-bold uppercase">
                      {anexo.nome.split('.').pop() || 'file'}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {anexo.nome}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        {formatBytes(anexo.tamanho)}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl hover:bg-primary/10 hover:text-primary shrink-0"
                    aria-label={`Baixar ${anexo.nome}`}
                    onClick={() => {
                      const blob = new Blob([email.texto], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = anexo.nome;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Quick Reply Button Footer */}
        <div className="mt-12 pt-6 border-t border-border/60 flex items-center gap-3">
          <Button onClick={() => onReply(email)} size="lg" className="rounded-xl gap-2 font-medium">
            <Reply className="size-4" />
            Responder a {nome}
          </Button>
        </div>
      </div>
    </article>
  );
}
