import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — Malaca Mail" },
      {
        name: "description",
        content: "Solicite um link de redefinição de senha para sua conta do domínio malaca.com.br.",
      },
      { property: "og:title", content: "Recuperar senha — Malaca Mail" },
      {
        property: "og:description",
        content: "Redefina a senha da sua conta de e-mail do domínio malaca.com.br.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RecoveryPage,
});

function RecoveryPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-background">
      <div className="surface-panel w-full max-w-md p-8 border border-border rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Voltar ao login
          </Link>
          <Logo variant="icon" size="sm" />
        </div>

        {enviado ? (
          <div className="mt-6 text-center">
            <MailCheck className="mx-auto size-10 text-success" />
            <h1 className="font-display mt-4 text-2xl">Verifique sua caixa de entrada</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Se <strong>{email}</strong> existir, enviaremos um link de redefinição válido por 30
              minutos pelo servidor smtp.malaca.com.br.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display mt-6 text-2xl">Recuperar senha</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Informe seu endereço e enviaremos um link seguro para criar uma nova senha.
            </p>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setEnviado(true);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Endereço de e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@malaca.com.br"
                  className="h-11"
                />
              </div>
              <Button type="submit" size="lg" className="w-full rounded-xl">
                Enviar link de recuperação
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
