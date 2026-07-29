import { Paperclip, Star, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatListDate, initials } from "@/lib/mail/format";
import type { Email } from "@/lib/mail/types";

interface Props {
  emails: Email[];
  selectedId?: string | null;
  onOpen: (id: string) => void;
  onToggleStar: (id: string) => void;
}

export function MessageList({ emails, selectedId, onOpen, onToggleStar }: Props) {
  if (emails.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center">
        <div className="grid size-16 place-items-center rounded-2xl bg-muted/50 border border-border">
          <Inbox className="size-8 text-muted-foreground/60" />
        </div>
        <div>
          <p className="font-display text-lg font-medium text-foreground">Caixa de entrada limpa</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Nenhuma mensagem encontrada nesta pasta ou pesquisa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border/60">
      {emails.map((email) => {
        const nome = email.remetente.nome ?? email.remetente.email;
        const isSelected = selectedId === email.id;

        return (
          <li key={email.id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => onOpen(email.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen(email.id)}
              className={cn(
                "group relative flex cursor-pointer items-start gap-3.5 px-4 py-3.5 transition-all duration-200",
                isSelected
                  ? "bg-primary/10 border-l-2 border-l-primary shadow-sm"
                  : "hover:bg-muted/40"
              )}
            >
              {/* Unread Glow Indicator */}
              <div className="pt-2 shrink-0">
                <span
                  aria-hidden
                  className={cn(
                    "block size-2 rounded-full transition-all duration-200",
                    email.lida
                      ? "bg-transparent scale-0"
                      : "bg-primary shadow-[0_0_8px_var(--color-primary)] scale-100 animate-pulse"
                  )}
                />
              </div>

              {/* Gradient Initials Avatar */}
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-xs font-semibold text-primary font-mono shadow-sm">
                {initials(nome)}
              </span>

              {/* Message Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("truncate text-sm tracking-tight", email.lida ? "font-normal text-muted-foreground" : "font-semibold text-foreground")}>
                    {nome}
                  </p>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground/80 tabular-nums">
                    {formatListDate(email.data_envio)}
                  </span>
                </div>
                <p className={cn("truncate text-sm mt-0.5", email.lida ? "text-foreground/70 font-normal" : "font-medium text-foreground")}>
                  {email.assunto}
                </p>
                <p className="truncate text-xs text-muted-foreground/80 mt-0.5">{email.preview}</p>
              </div>

              {/* Star & Attachment Icons */}
              <div className="flex shrink-0 flex-col items-center gap-2 pt-1">
                <button
                  aria-label={email.favorita ? "Remover dos favoritos" : "Marcar como favorito"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(email.id);
                  }}
                  className="text-muted-foreground/60 transition-colors hover:text-primary p-0.5 rounded-md hover:bg-muted/60"
                >
                  <Star className={cn("size-4 transition-transform group-hover:scale-110", email.favorita && "fill-amber-400 text-amber-400")} />
                </button>
                {email.anexos.length > 0 && <Paperclip className="size-3.5 text-muted-foreground/60" />}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
