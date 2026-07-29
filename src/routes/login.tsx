import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Mail, ShieldCheck, UserPlus, Sparkles, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { useTheme } from "@/hooks/use-theme";
import { DEMO_ACCOUNT, signIn } from "@/lib/mail/session";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Malaca Mail" },
      {
        name: "description",
        content: "Acesse sua caixa de entrada privada do domínio malaca.com.br com e-mail e senha.",
      },
      { property: "og:title", content: "Entrar — Malaca Mail" },
      {
        property: "og:description",
        content: "Acesso seguro ao webmail privado do domínio malaca.com.br.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();
  const [email, setEmail] = useState(DEMO_ACCOUNT.email);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      signIn(email, senha);
      navigate({ to: "/", replace: true });
    } catch (error) {
      setErro((error as Error).message);
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2 bg-background">
      {/* High-Tech Left Hero Panel */}
      <section className="hidden flex-col justify-between p-12 lg:flex glass-panel border-r border-border relative overflow-hidden">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <Logo variant="horizontal" size="lg" />
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-muted"
              title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
            >
              {theme === "dark" ? <Sun className="size-5 text-amber-400" /> : <Moon className="size-5 text-slate-700" />}
            </Button>
            <span className="tech-badge px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-success animate-pulse" />
              IMAP / SMTP 100% Online
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="mb-6">
            <Logo variant="icon" size="xl" />
          </div>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            Seu e-mail, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-300">
              no seu próprio domínio.
            </span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Webmail privado de alta performance para o domínio <strong>malaca.com.br</strong> com infraestrutura dedicada, criptografia ponta a ponta e zero rastreadores.
          </p>

          {/* High-Tech Terminal Card */}
          <div className="mt-8 rounded-2xl border border-border/80 bg-surface/80 p-4 font-mono text-xs text-muted-foreground space-y-1.5 shadow-tech">
            <div className="flex items-center justify-between text-foreground/80 font-bold border-b border-border/60 pb-2 mb-2">
              <span>Endpoints do Domínio</span>
              <span className="text-[10px] text-success">SSL/TLS 1.3</span>
            </div>
            <p className="flex justify-between"><span>SMTP Server:</span> <strong className="text-foreground">smtp.malaca.com.br:587</strong></p>
            <p className="flex justify-between"><span>IMAP Server:</span> <strong className="text-foreground">imap.malaca.com.br:993</strong></p>
            <p className="flex justify-between"><span>POP3 Server:</span> <strong className="text-foreground">pop.malaca.com.br:995</strong></p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <ShieldCheck className="size-4 text-success" />
          <span>Proteção ativa com assinaturas SPF, DKIM e DMARC</span>
        </div>
      </section>

      {/* Right Login Section */}
      <section className="flex flex-col justify-between p-6 sm:p-12 relative">
        <div className="flex justify-end">
          <Link to="/criar-conta">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl font-medium text-xs border-primary/30 text-primary hover:bg-primary/10">
              <UserPlus className="size-3.5" />
              <span>Criar Conta @malaca.com.br</span>
            </Button>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm my-auto py-8">
          <div className="mb-6 lg:hidden">
            <Logo variant="horizontal" size="md" />
          </div>

          <h2 className="font-display text-3xl font-semibold tracking-tight">Entrar na Conta</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Insira seu e-mail do domínio e sua senha de acesso.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Endereço de e-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-9 rounded-xl font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="senha">Senha</Label>
                <Link to="/recuperar-senha" className="text-xs text-primary hover:underline font-medium">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-11 pl-9 rounded-xl"
                />
              </div>
            </div>

            {erro && (
              <p className="text-xs font-medium text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                {erro}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-xl h-11 text-base font-semibold shadow-tech glow-border"
              disabled={loading}
            >
              {loading ? "Autenticando..." : "Acessar Webmail"}
            </Button>
          </form>

          {/* Create Account Banner */}
          <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-xs text-muted-foreground mb-2">Ainda não possui seu endereço de e-mail?</p>
            <Link to="/criar-conta">
              <Button variant="secondary" size="sm" className="w-full rounded-xl font-semibold gap-1.5 text-xs text-primary">
                <Sparkles className="size-3.5" />
                Criar meu e-mail @malaca.com.br
              </Button>
            </Link>
          </div>

          <p className="mt-6 rounded-xl border border-border bg-muted/40 p-3 text-xs font-mono text-muted-foreground text-center">
            Conta Demo: <strong>{DEMO_ACCOUNT.email}</strong> · Senha: <strong>{DEMO_ACCOUNT.senha}</strong>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground/60">
          Malaca Mail System © 2026 · malaca.com.br
        </p>
      </section>
    </main>
  );
}
