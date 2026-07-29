import { Paperclip, Star } from "lucide-react";
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
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-12 text-center">
        <p className="font-display text-xl">Nada por aqui</p>
        <p className="text-sm text-muted-foreground">
          Nenhuma mensagem corresponde a esta pasta ou pesquisa.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {emails.map((email) => {
        const nome = email.remetente.nome ?? email.remetente.email;
        return (
          <li key={email.id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => onOpen(email.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen(email.id)}
              className={cn(
                "group flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors duration-200",
                selectedId === email.id ? "bg-accent/60" : "hover:bg-muted/60",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-3 size-2 shrink-0 rounded-full",
                  email.lida ? "bg-transparent" : "bg-primary",
                )}
              />
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                {initials(nome)}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className={cn("truncate text-sm", email.lida ? "font-normal" : "font-semibold")}>
                    {nome}
                  </p>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                    {formatListDate(email.data_envio)}
                  </span>
                </div>
                <p className={cn("truncate text-sm", email.lida ? "text-foreground/80" : "font-medium")}>
                  {email.assunto}
                </p>
                <p className="truncate text-xs text-muted-foreground">{email.preview}</p>
              </div>

              <div className="flex shrink-0 flex-col items-center gap-2 pt-1">
                <button
                  aria-label={email.favorita ? "Remover dos favoritos" : "Marcar como favorito"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(email.id);
                  }}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <Star className={cn("size-4", email.favorita && "fill-primary text-primary")} />
                </button>
                {email.anexos.length > 0 && <Paperclip className="size-3.5 text-muted-foreground" />}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
