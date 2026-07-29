import type { User } from "./types";

/**
 * Camada de sessão temporária (client-side).
 * Substituir por JWT httpOnly + endpoints /api/auth/login|logout quando o backend
 * Express + Prisma estiver ativo. A interface pública destas funções não muda.
 */

const KEY = "malaca-mail:session";

export const DEMO_ACCOUNT = {
  email: "contato@malaca.com.br",
  senha: "malaca2026",
};

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function signIn(email: string, senha: string): User {
  if (email.trim().toLowerCase() !== DEMO_ACCOUNT.email || senha !== DEMO_ACCOUNT.senha) {
    throw new Error("E-mail ou senha inválidos.");
  }
  const user: User = {
    id: "u1",
    nome: "Malaca",
    email: DEMO_ACCOUNT.email,
    criado_em: new Date().toISOString(),
  };
  window.localStorage.setItem(KEY, JSON.stringify(user));
  return user;
}

export function signOut() {
  window.localStorage.removeItem(KEY);
}
