import { useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, User as UserIcon, Lock, Mail, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { isUsernameAvailable, registerAccount } from "@/lib/mail/session";
import { toast } from "sonner";

export const Route = createFileRoute("/criar-conta")({
  head: () => ({
    meta: [
      { title: "Criar E-mail — Malaca Mail (@malaca.com.br)" },
      {
        name: "description",
        content: "Crie seu e-mail profissional grátis com o domínio exclusivo @malaca.com.br.",
      },
      { property: "og:title", content: "Criar E-mail — Malaca Mail (@malaca.com.br)" },
      {
        property: "og:description",
        content: "Crie sua conta no domínio malaca.com.br com IMAP e SMTP dedicados.",
      },
    ],
  }),
  component: CreateAccountPage,
});

function CreateAccountPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Real-time username validation
  const cleanUsername = useMemo(
    () => username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, ""),
    [username]
  );

  const isAvailable = useMemo(() => {
    if (cleanUsername.length < 3) return null;
    return isUsernameAvailable(cleanUsername);
  }, [cleanUsername]);

  // Password strength meter
  const passwordStrength = useMemo(() => {
    if (!senha) return 0;
    let score = 0;
    if (senha.length >= 6) score += 25;
    if (senha.length >= 10) score += 25;
    if (/[A-Z]/.test(senha)) score += 25;
    if (/[0-9!@#$%^&*]/.test(senha)) score += 25;
    return score;
  }, [senha]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!cleanUsername || cleanUsername.length < 3) {
      setErro("O nome de usuário deve ter pelo menos 3 caracteres.");
      return;
    }

    if (isAvailable === false) {
      setErro(`O endereço ${cleanUsername}@malaca.com.br já está em uso.`);
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve conter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const user = registerAccount({
        username: cleanUsername,
        nome: nome || cleanUsername,
        senha,
        recoveryEmail: recoveryEmail || undefined,
      });

      toast.success(`Conta ${user.email} criada com sucesso!`);
      navigate({ to: "/", replace: true });
    } catch (err) {
      setErro((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2 bg-background">
      {/* Left Tech Showcase Panel */}
      <section className="hidden flex-col justify-between p-12 lg:flex glass-panel border-r border-border relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <Logo variant="horizontal" size="lg" />
          <span className="tech-badge px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-success animate-pulse" />
            Servidores Próprios @malaca.com.br
          </span>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary mb-6">
            <Sparkles className="size-3.5" />
            Crie seu endereço de e-mail exclusivo
          </div>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            Seu próprio e-mail <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-300">
              @malaca.com.br
            </span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Acesse seu novo webmail com criptografia avançada, 15 GB de armazenamento, suporte nativo a IMAP/SMTP e compatibilidade com qualquer cliente mobile ou desktop.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-xl border border-border">
              <ShieldCheck className="size-6 text-primary mb-2" />
              <h3 className="text-sm font-semibold text-foreground">Domínio Próprio</h3>
              <p className="text-xs text-muted-foreground mt-1">Endereço limpo e profissional sem intermediários.</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-border">
              <CheckCircle2 className="size-6 text-success mb-2" />
              <h3 className="text-sm font-semibold text-foreground">TLS & DKIM</h3>
              <p className="text-xs text-muted-foreground mt-1">Assinatura de segurança configurada em todas as mensagens.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs font-mono text-muted-foreground">
          <span>SMTP: smtp.malaca.com.br:587</span>
          <span>•</span>
          <span>IMAP: imap.malaca.com.br:993</span>
        </div>
      </section>

      {/* Right Registration Form */}
      <section className="flex flex-col justify-between p-6 sm:p-12 relative">
        <div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Já possui uma conta? Entrar
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md my-auto py-8">
          <div className="mb-6 lg:hidden">
            <Logo variant="horizontal" size="md" />
          </div>

          <h2 className="font-display text-3xl font-semibold tracking-tight">Criar nova conta</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Escolha seu nome de usuário para o domínio <strong>@malaca.com.br</strong>.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* E-mail / Username Input */}
            <div className="space-y-2">
              <Label htmlFor="username">Endereço de E-mail Desejado</Label>
              <div className="relative flex items-center">
                <Input
                  id="username"
                  type="text"
                  required
                  value={cleanUsername}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="seu.nome"
                  className="h-12 pr-36 pl-4 font-mono text-sm rounded-xl bg-muted/40 focus:bg-background transition-all"
                />
                <div className="absolute right-3 flex items-center gap-2 pointer-events-none">
                  {isAvailable === true && (
                    <CheckCircle2 className="size-4 text-success animate-in fade-in" />
                  )}
                  {isAvailable === false && (
                    <XCircle className="size-4 text-destructive animate-in fade-in" />
                  )}
                  <span className="text-xs font-mono font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                    @malaca.com.br
                  </span>
                </div>
              </div>
              {cleanUsername && (
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-mono text-muted-foreground">
                    Endereço final: <strong className="text-foreground">{cleanUsername}@malaca.com.br</strong>
                  </span>
                  {isAvailable === true && (
                    <span className="text-success font-medium flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Disponível!
                    </span>
                  )}
                  {isAvailable === false && (
                    <span className="text-destructive font-medium flex items-center gap-1">
                      <XCircle className="size-3" /> Indisponível
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="nome"
                  type="text"
                  required
                  placeholder="Ex: Carlos Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-11 pl-9 rounded-xl"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="senha">Senha de Acesso</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  required
                  placeholder="Mínimo de 6 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-11 pl-9 rounded-xl"
                />
              </div>

              {/* Password strength bar */}
              {senha.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength <= 25
                          ? "bg-destructive w-1/4"
                          : passwordStrength <= 50
                          ? "bg-amber-500 w-2/4"
                          : passwordStrength <= 75
                          ? "bg-blue-500 w-3/4"
                          : "bg-success w-full"
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground text-right font-mono">
                    Força da senha:{" "}
                    {passwordStrength <= 25
                      ? "Fraca"
                      : passwordStrength <= 50
                      ? "Média"
                      : passwordStrength <= 75
                      ? "Boa"
                      : "Forte"}
                  </p>
                </div>
              )}
            </div>

            {/* E-mail de Recuperação Opcional */}
            <div className="space-y-2">
              <Label htmlFor="recoveryEmail">
                E-mail de Recuperação <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="recoveryEmail"
                  type="email"
                  placeholder="outro.email@gmail.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="h-11 pl-9 rounded-xl"
                />
              </div>
            </div>

            {erro && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <XCircle className="size-4 shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-xl h-12 text-base font-semibold shadow-tech glow-border"
              disabled={loading || isAvailable === false}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Criando sua conta...
                </span>
              ) : (
                "Criar Minha Conta @malaca.com.br"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Ao criar uma conta, você concorda com a política de privacidade e termos do domínio malaca.com.br.
        </p>
      </section>
    </main>
  );
}
