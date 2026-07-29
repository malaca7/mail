import { ArrowLeft, Download, MailOpen, Reply, Star, Trash2 } from "lucide-react";
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
    <article className="flex h-full flex-col">
      <header className="flex items-center gap-1 border-b border-border px-3 py-2">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Voltar">
          <ArrowLeft className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onReply(email)} aria-label="Responder">
          <Reply className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleRead(email.id, !email.lida)}
          aria-label="Marcar como lida ou não lida"
        >
          <MailOpen className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleStar(email.id)}
          aria-label="Favoritar"
        >
          <Star className={cn("size-4", email.favorita && "fill-primary text-primary")} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(email.id)}
          aria-label="Excluir mensagem"
          className="ml-auto text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </header>

      <div className="scrollbar-slim flex-1 overflow-y-auto px-5 py-6 sm:px-8">
        <h1 className="font-display text-2xl leading-snug sm:text-3xl">{email.assunto}</h1>

        <div className="mt-5 flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
            {initials(nome)}
          </span>
          <div className="min-w-0 text-sm">
            <p className="font-semibold">{nome}</p>
            <p className="truncate text-muted-foreground">{email.remetente.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Para: {email.destinatarios.map((d) => d.email).join(", ")}
              {email.cc?.length ? ` · CC: ${email.cc.map((d) => d.email).join(", ")}` : ""}
            </p>
          </div>
          <span className="ml-auto hidden shrink-0 text-xs text-muted-foreground sm:block">
            {formatFullDate(email.data_envio)}
          </span>
        </div>

        <Separator className="my-6" />

        <div
          className="prose-mail max-w-none text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_li]:my-1 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(email.html) }}
        />

        {email.anexos.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {email.anexos.length} anexo{email.anexos.length > 1 ? "s" : ""}
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {email.anexos.map((anexo) => (
                <li
                  key={anexo.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{anexo.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {anexo.tipo} · {formatBytes(anexo.tamanho)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
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
      </div>
    </article>
  );
}
