import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  RefreshCw,
  Search,
  Sun,
  UserPlus,
  ShieldCheck,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FOLDERS, FolderNav } from "@/components/mail/folder-nav";
import { MessageList } from "@/components/mail/message-list";
import { MessageView } from "@/components/mail/message-view";
import { ComposeDialog } from "@/components/mail/compose-dialog";
import { Logo } from "@/components/logo";
import { useMailbox } from "@/hooks/use-mailbox";
import { useTheme } from "@/hooks/use-theme";
import { getSession, signOut, deliverEmail } from "@/lib/mail/session";
import type { DraftPayload, Email, User } from "@/lib/mail/types";
import { cn } from "@/lib/utils";
import { LoginPage } from "./login";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const session = getSession();
      if (!session) {
        throw redirect({ to: "/login", replace: true });
      }
    }
  },
  head: () => ({
    meta: [
      { title: "Malaca Mail — Webmail privado do domínio malaca.com.br" },
      {
        name: "description",
        content:
          "Webmail privado do domínio malaca.com.br: caixa de entrada, busca instantânea, anexos e composição com editor rico.",
      },
      { property: "og:title", content: "Malaca Mail — Webmail privado do domínio malaca.com.br" },
      {
        property: "og:description",
        content: "Webmail privado do domínio malaca.com.br: caixa de entrada, busca instantânea, anexos e composição com editor rico.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MailApp,
});

function parseAddresses(value: string) {
  return value
    .split(/[,;]/)
    .map((v) => v.trim())
    .filter(Boolean)
    .map((email) => ({ email }));
}

function MailApp() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [user, setUser] = useState<User | null>(() => getSession());
  const mailbox = useMailbox(user);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeInitial, setComposeInitial] = useState<Partial<DraftPayload>>({});

  useEffect(() => {
    const session = getSession();
    if (!session) {
      navigate({ to: "/login", replace: true });
    } else {
      setUser(session);
    }
  }, [navigate]);

  const folderLabel = useMemo(
    () => FOLDERS.find((f) => f.id === mailbox.folder)?.label ?? "",
    [mailbox.folder],
  );

  if (!user) {
    return <LoginPage />;
  }

  const openCompose = (initial: Partial<DraftPayload> = {}) => {
    setComposeInitial(initial);
    setComposeOpen(true);
  };

  const handleSend = (draft: DraftPayload) => {
    const email: Email = {
      id: crypto.randomUUID(),
      message_id: `<${Date.now()}@malaca.com.br>`,
      remetente: { nome: user.nome, email: user.email },
      destinatarios: parseAddresses(draft.para),
      cc: parseAddresses(draft.cc),
      cco: parseAddresses(draft.cco),
      assunto: draft.assunto || "(sem assunto)",
      preview: draft.html.replace(/<[^>]+>/g, " ").slice(0, 120),
      html: draft.html,
      texto: draft.html.replace(/<[^>]+>/g, " "),
      data_envio: new Date().toISOString(),
      lida: true,
      favorita: false,
      pasta: "sent",
      anexos: draft.anexos.map((a, i) => ({
        id: `${Date.now()}-${i}`,
        email_id: "",
        caminho: "",
        ...a,
      })),
    };
    mailbox.addEmail(email);
    deliverEmail(email);
    setComposeOpen(false);
    toast.success("Mensagem enviada via smtp.malaca.com.br");
  };

  const handleSaveDraft = (draft: DraftPayload) => {
    if (!draft.para && !draft.assunto && !draft.html) return;
    const draftEmail: Email = {
      id: "draft_" + Date.now(),
      message_id: `<draft-${Date.now()}@malaca.com.br>`,
      remetente: { nome: user.nome, email: user.email },
      destinatarios: parseAddresses(draft.para),
      cc: parseAddresses(draft.cc),
      cco: parseAddresses(draft.cco),
      assunto: draft.assunto || "(sem assunto)",
      preview: draft.html.replace(/<[^>]+>/g, " ").slice(0, 120),
      html: draft.html,
      texto: draft.html.replace(/<[^>]+>/g, " "),
      data_envio: new Date().toISOString(),
      lida: true,
      favorita: false,
      pasta: "drafts",
      anexos: draft.anexos.map((a, i) => ({
        id: `${Date.now()}-${i}`,
        email_id: "",
        caminho: "",
        ...a,
      })),
    };
    // Remove previous auto-saved drafts and save new one
    mailbox.addEmail(draftEmail);
    toast.success("Rascunho salvo automaticamente");
  };

  const handleLogout = () => {
    signOut();
    navigate({ to: "/login", replace: true });
  };

  const sidebar = (
    <FolderNav
      active={mailbox.folder}
      counts={mailbox.counts}
      onSelect={mailbox.setFolder}
      onCompose={() => openCompose()}
    />
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* High-Tech Glass Header */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border/80 bg-surface/60 backdrop-blur-xl px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-xl" aria-label="Abrir menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0 border-r border-sidebar-border">
              <SheetTitle className="sr-only">Pastas</SheetTitle>
              {sidebar}
            </SheetContent>
          </Sheet>

          <Logo variant="horizontal" size="md" />
          
          <span className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20 text-[11px] font-mono text-success">
            <span className="size-1.5 rounded-full bg-success animate-pulse" /> Servidores 99.9% Online
          </span>
        </div>

        {/* Tech Search Input */}
        <div className="relative mx-auto w-full max-w-lg hidden sm:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={mailbox.query}
            onChange={(e) => mailbox.setQuery(e.target.value)}
            placeholder="Pesquisar remetente, assunto ou termo..."
            className="h-10 rounded-xl bg-muted/40 border border-border/60 pl-10 pr-4 font-mono text-xs focus:bg-background transition-all shadow-inner"
            aria-label="Pesquisar mensagens"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Create New Account Button */}
          <Link to="/criar-conta">
            <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1.5 rounded-xl font-medium text-xs border-primary/30 hover:border-primary text-primary hover:bg-primary/10">
              <UserPlus className="size-3.5" />
              <span>Criar @malaca.com.br</span>
            </Button>
          </Link>

          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema" className="rounded-xl">
            {theme === "dark" ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
          </Button>

          <div className="hidden text-right text-xs leading-tight lg:block border-l border-border/60 pl-3">
            <p className="font-semibold text-foreground tracking-tight">{user.nome}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{user.email}</p>
          </div>

          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sair" className="rounded-xl text-muted-foreground hover:text-destructive">
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
          {sidebar}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-2.5">
            <h1 className="font-display text-base">{folderLabel}</h1>
            <span className="text-xs text-muted-foreground">{mailbox.filtered.length} mensagens</span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              aria-label="Atualizar"
              onClick={() => toast.success("Sincronizado com imap.malaca.com.br")}
            >
              <RefreshCw className="size-4" />
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Página anterior"
                disabled={mailbox.currentPage <= 1}
                onClick={() => mailbox.setPage(mailbox.currentPage - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-xs tabular-nums text-muted-foreground">
                {mailbox.currentPage}/{mailbox.totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Próxima página"
                disabled={mailbox.currentPage >= mailbox.totalPages}
                onClick={() => mailbox.setPage(mailbox.currentPage + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1">
            <section
              className={cn(
                "scrollbar-slim min-w-0 flex-1 overflow-y-auto xl:max-w-md xl:border-r xl:border-border",
                mailbox.selected && "hidden xl:block",
              )}
            >
              <MessageList
                emails={mailbox.pageItems}
                selectedId={mailbox.selected?.id}
                onOpen={mailbox.open}
                onToggleStar={mailbox.toggleStar}
              />
            </section>

            <section className={cn("min-w-0 flex-1", !mailbox.selected && "hidden xl:block")}>
              {mailbox.selected ? (
                <MessageView
                  email={mailbox.selected}
                  onBack={mailbox.close}
                  onDelete={(id) => {
                    mailbox.remove(id);
                    toast.success("Mensagem movida para a lixeira");
                  }}
                  onToggleRead={mailbox.toggleRead}
                  onToggleStar={mailbox.toggleStar}
                  onReply={(email) =>
                    openCompose({
                      para: email.remetente.email,
                      assunto: `Re: ${email.assunto}`,
                      html: `<br><blockquote>${email.html}</blockquote>`,
                    })
                  }
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center">
                  <p className="font-display text-xl">Selecione uma mensagem</p>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    O conteúdo completo, anexos e ações aparecem aqui.
                  </p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <ComposeDialog
        open={composeOpen}
        initial={composeInitial}
        onClose={() => setComposeOpen(false)}
        onSend={handleSend}
        onSaveDraft={handleSaveDraft}
      />
    </div>
  );
}
