import { Inbox, Send, FileEdit, ShieldAlert, Trash2, Star, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FolderId } from "@/lib/mail/types";

export const FOLDERS: { id: FolderId; label: string; icon: typeof Inbox }[] = [
  { id: "inbox", label: "Caixa de Entrada", icon: Inbox },
  { id: "starred", label: "Favoritos", icon: Star },
  { id: "sent", label: "Enviados", icon: Send },
  { id: "drafts", label: "Rascunhos", icon: FileEdit },
  { id: "spam", label: "Spam", icon: ShieldAlert },
  { id: "trash", label: "Lixeira", icon: Trash2 },
];

interface Props {
  active: FolderId;
  counts: Record<string, number>;
  onSelect: (folder: FolderId) => void;
  onCompose: () => void;
}

export function FolderNav({ active, counts, onSelect, onCompose }: Props) {
  return (
    <nav className="flex h-full flex-col gap-6 p-4">
      <Button size="lg" className="w-full justify-start gap-2 rounded-2xl" onClick={onCompose}>
        <PenLine className="size-4" />
        Escrever
      </Button>

      <ul className="space-y-1">
        {FOLDERS.map(({ id, label, icon: Icon }) => {
          const count = counts[id] ?? 0;
          const isActive = active === id;
          return (
            <li key={id}>
              <button
                onClick={() => onSelect(id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "ml-auto rounded-full px-2 py-0.5 text-xs tabular-nums",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto rounded-xl border border-sidebar-border bg-sidebar p-3 text-xs leading-relaxed text-muted-foreground">
        <p className="font-medium text-sidebar-foreground">Servidores do domínio</p>
        <p className="mt-1">smtp.malaca.com.br · 587</p>
        <p>imap.malaca.com.br · 993</p>
        <p>pop.malaca.com.br · 995</p>
      </div>
    </nav>
  );
}
