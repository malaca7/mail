import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
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
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-sidebar p-12 lg:flex border-r border-sidebar-border">
        <Logo variant="horizontal" size="lg" />
        <div className="max-w-md">
          <div className="mb-6 inline-block">
            <Logo variant="icon" size="xl" />
          </div>
          <h2 className="font-display text-4xl leading-tight">
            Seu e-mail, no seu domínio, no seu servidor.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Webmail privado do domínio malaca.com.br, com SMTP e IMAP próprios e compatível com
            Thunderbird, Outlook e Apple Mail.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
            <li>smtp.malaca.com.br · porta 587 (STARTTLS)</li>
            <li>imap.malaca.com.br · porta 993 (SSL)</li>
            <li>pop.malaca.com.br · porta 995 (SSL)</li>
          </ul>
        </div>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4" />
          SPF, DKIM e DMARC configurados no domínio
        </p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <Logo variant="horizontal" size="md" className="mb-6 lg:hidden" />
          <h1 className="font-display text-3xl">Entrar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use seu endereço completo e a senha da conta.
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
                  className="h-11 pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-11 pl-9"
                />
              </div>
            </div>

            {erro && <p className="text-sm text-destructive">{erro}</p>}

            <Button type="submit" size="lg" className="w-full rounded-xl" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-4 flex justify-between text-sm">
            <Link to="/recuperar-senha" className="text-primary hover:underline">
              Esqueci minha senha
            </Link>
          </div>

          <p className="mt-8 rounded-xl border border-border bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
            Conta de demonstração: <strong>{DEMO_ACCOUNT.email}</strong> · senha{" "}
            <strong>{DEMO_ACCOUNT.senha}</strong>
          </p>
        </div>
      </section>
    </main>
  );
}
