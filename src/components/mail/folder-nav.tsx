import { Inbox, Send, FileEdit, ShieldAlert, Trash2, Star, Plus, HardDrive, ShieldCheck } from "lucide-react";
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
    <nav className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Tech Compose Button */}
        <Button
          size="lg"
          className="w-full justify-start gap-2.5 rounded-xl h-12 bg-primary text-primary-foreground font-semibold shadow-tech hover:brightness-110 transition-all glow-border"
          onClick={onCompose}
        >
          <div className="grid size-6 place-items-center rounded-lg bg-white/20">
            <Plus className="size-4 stroke-[3]" />
          </div>
          <span className="tracking-tight">Escrever E-mail</span>
        </Button>

        {/* Folders List */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
            Pastas Principais
          </p>
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
                      "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                      isActive
                        ? "bg-primary/15 text-primary font-semibold border border-primary/20 shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                    )}
                    <Icon className={cn("size-4 shrink-0 transition-transform duration-200 group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span className="truncate">{label}</span>
                    {count > 0 && (
                      <span
                        className={cn(
                          "ml-auto rounded-full px-2 py-0.5 text-xs font-mono tabular-nums transition-all",
                          isActive
                            ? "bg-primary text-primary-foreground font-bold shadow-sm"
                            : "bg-muted/80 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
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
        </div>
      </div>

      {/* Storage & System Status Card */}
      <div className="space-y-3 pt-4">
        {/* Storage Bar */}
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <HardDrive className="size-3.5 text-primary" /> Armazenamento
            </span>
            <span className="font-mono text-[11px]">1.2 GB / 15 GB</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
            <div className="h-full w-[8%] bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)]" />
          </div>
        </div>

        {/* Server Security Badge */}
        <div className="rounded-xl border border-sidebar-border/80 bg-sidebar-accent/20 p-2.5 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-success" /> TLS 1.3 / DKIM
          </span>
          <span className="flex items-center gap-1 text-[10px] text-success">
            <span className="size-1.5 rounded-full bg-success animate-pulse" /> Online
          </span>
        </div>
      </div>
    </nav>
  );
}
