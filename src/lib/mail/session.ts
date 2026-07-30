import type { User, Email } from "./types";
import { mockEmails } from "./mock-data";
import { analyzeEmail } from "./spam-filter";

const SESSION_KEY = "malaca-mail:session";
const ACCOUNTS_KEY = "malaca-mail:accounts";
const EMAILS_PREFIX = "malaca-mail:emails:";

export const DEMO_ACCOUNT = {
  id: "u1",
  nome: "Malaca Demo",
  email: "contato@malaca.com.br",
  senha: "malaca2026",
  criado_em: "2026-01-01T00:00:00.000Z",
};

export interface StoredAccount extends User {
  senha: string;
  recoveryEmail?: string;
  avatarUrl?: string;
  quotaUsadaBytes?: number;
  quotaTotalBytes?: number;
  suspended?: boolean;
}

export function getAllAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [DEMO_ACCOUNT];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    const list: StoredAccount[] = raw ? JSON.parse(raw) : [];
    const hasDemo = list.some((acc) => acc.email.toLowerCase() === DEMO_ACCOUNT.email);
    return hasDemo ? list : [DEMO_ACCOUNT, ...list];
  } catch {
    return [DEMO_ACCOUNT];
  }
}

export function isUsernameAvailable(username: string): boolean {
  const clean = username.trim().toLowerCase().replace(/@.*$/, "");
  if (!clean || clean.length < 3) return false;
  const fullEmail = `${clean}@malaca.com.br`;
  const accounts = getAllAccounts();
  return !accounts.some((acc) => acc.email.toLowerCase() === fullEmail);
}

export interface RegisterPayload {
  username: string;
  nome: string;
  senha: string;
  recoveryEmail?: string;
}

export function registerAccount({
  username,
  nome,
  senha,
  recoveryEmail,
}: RegisterPayload): User {
  const cleanUsername = username.trim().toLowerCase().replace(/@.*$/, "");
  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error("O nome de usuário deve ter pelo menos 3 caracteres.");
  }
  const email = `${cleanUsername}@malaca.com.br`;

  if (!isUsernameAvailable(cleanUsername)) {
    throw new Error(`O endereço ${email} já está em uso.`);
  }

  if (!senha || senha.length < 6) {
    throw new Error("A senha deve conter no mínimo 6 caracteres.");
  }

  const newUser: StoredAccount = {
    id: "u_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    nome: nome.trim() || cleanUsername,
    email,
    senha,
    recoveryEmail,
    criado_em: new Date().toISOString(),
    quotaUsadaBytes: 452000,
    quotaTotalBytes: 15 * 1024 * 1024 * 1024, // 15 GB
  };

  const accounts = getAllAccounts();
  const updatedAccounts = [...accounts, newUser];
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts));

  // Initialize custom user mailbox with a Welcome Email
  seedWelcomeEmail(newUser);

  // Auto login
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  return newUser;
}

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function signIn(emailInput: string, senhaInput: string): User {
  const cleanInput = emailInput.trim().toLowerCase();
  const cleanEmail = cleanInput.includes("@") ? cleanInput : `${cleanInput}@malaca.com.br`;
  const accounts = getAllAccounts();
  const found = accounts.find((acc) => acc.email.toLowerCase() === cleanEmail);

  if (!found || found.senha !== senhaInput) {
    throw new Error("E-mail ou senha incorretos.");
  }

  if (found.suspended) {
    throw new Error("Esta conta está suspensa. Entre em contato com o administrador.");
  }

  const user: User = {
    id: found.id,
    nome: found.nome,
    email: found.email,
    criado_em: found.criado_em,
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function getUserEmails(user: User): Email[] {
  if (typeof window === "undefined") return mockEmails;
  const key = `${EMAILS_PREFIX}${user.id}`;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw) as Email[];
    }
    seedWelcomeEmail(user);
    const updatedRaw = window.localStorage.getItem(key);
    return updatedRaw ? JSON.parse(updatedRaw) : mockEmails;
  } catch {
    return mockEmails;
  }
}

export function saveUserEmails(user: User, emails: Email[]): void {
  if (typeof window === "undefined") return;
  const key = `${EMAILS_PREFIX}${user.id}`;
  try {
    window.localStorage.setItem(key, JSON.stringify(emails));
    window.dispatchEvent(new Event("malaca-mail:updated"));
  } catch {
    // ignore
  }
}

export function deliverEmail(email: Email): void {
  if (typeof window === "undefined") return;

  const accounts = getAllAccounts();
  const recipientEmails = [
    ...email.destinatarios.map((d) => {
      const clean = d.email.trim().toLowerCase();
      return clean.includes("@") ? clean : `${clean}@malaca.com.br`;
    }),
    ...(email.cc?.map((c) => {
      const clean = c.email.trim().toLowerCase();
      return clean.includes("@") ? clean : `${clean}@malaca.com.br`;
    }) ?? []),
  ];

  // Run spam analysis
  const spamResult = analyzeEmail(email);

  for (const recipientEmail of recipientEmails) {
    const foundAcc = accounts.find((acc) => acc.email.toLowerCase() === recipientEmail);
    if (foundAcc && !foundAcc.suspended) {
      const recipientKey = `${EMAILS_PREFIX}${foundAcc.id}`;
      try {
        const raw = window.localStorage.getItem(recipientKey);
        const existing: Email[] = raw ? JSON.parse(raw) : [];
        const incomingEmail: Email = {
          ...email,
          id: "e_in_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
          lida: false,
          pasta: spamResult.isSpam ? "spam" : "inbox",
          spamScore: spamResult.score,
          spamDetails: spamResult.matchedRules.map((r) => `${r.ruleName} (+${r.score})`).join(", ") || undefined,
          securityHeaders: {
            spf: "pass",
            dkim: "pass",
            dmarc: "pass",
          },
        };
        window.localStorage.setItem(recipientKey, JSON.stringify([incomingEmail, ...existing]));
      } catch {
        // ignore
      }
    }
  }

  // Notify active listeners
  window.dispatchEvent(new Event("malaca-mail:updated"));
}

// ── Admin Helpers ──

export function updateAccount(accountId: string, patch: Partial<StoredAccount>): void {
  if (typeof window === "undefined") return;
  const accounts = getAllAccounts();
  const updated = accounts.map((acc) => (acc.id === accountId ? { ...acc, ...patch } : acc));
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("malaca-mail:updated"));
}

export function deleteAccount(accountId: string): void {
  if (typeof window === "undefined") return;
  const accounts = getAllAccounts().filter((acc) => acc.id !== accountId && acc.id !== DEMO_ACCOUNT.id);
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  window.localStorage.removeItem(`${EMAILS_PREFIX}${accountId}`);
  window.dispatchEvent(new Event("malaca-mail:updated"));
}

export function getAccountStats() {
  if (typeof window === "undefined") return { totalAccounts: 1, totalEmails: 0, totalStorageBytes: 0 };
  const accounts = getAllAccounts();
  let totalEmails = 0;
  let totalStorageBytes = 0;
  for (const acc of accounts) {
    const key = `${EMAILS_PREFIX}${acc.id}`;
    const raw = window.localStorage.getItem(key);
    if (raw) {
      try {
        const emails = JSON.parse(raw) as Email[];
        totalEmails += emails.length;
        totalStorageBytes += raw.length * 2;
      } catch { /* ignore */ }
    }
  }
  return { totalAccounts: accounts.length, totalEmails, totalStorageBytes };
}

function seedWelcomeEmail(user: User) {
  const key = `${EMAILS_PREFIX}${user.id}`;
  const welcomeMessage: Email = {
    id: "e_welcome_" + Date.now(),
    message_id: `<welcome-${Date.now()}@malaca.com.br>`,
    remetente: { nome: "Suporte Malaca Mail", email: "suporte@malaca.com.br" },
    destinatarios: [{ nome: user.nome, email: user.email }],
    assunto: `🎉 Bem-vindo ao seu novo e-mail @malaca.com.br, ${user.nome}!`,
    preview: `Sua conta ${user.email} foi criada com sucesso no servidor de alta performance.`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0052FF;">Sua conta de e-mail profissional está ativa!</h2>
        <p>Olá <strong>${user.nome}</strong>,</p>
        <p>Seja bem-vindo ao <strong>Malaca Mail</strong>. Seu novo endereço <code>${user.email}</code> está totalmente configurado e pronto para envio e recebimento de mensagens com alta segurança e criptografia.</p>
        
        <div style="background-color: #f4f6fb; border-left: 4px solid #0052FF; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; color: #111;">Configurações de Servidor (SMTP/IMAP):</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #555;">
            <li><strong>Endereço de E-mail:</strong> ${user.email}</li>
            <li><strong>Servidor de Entrada (IMAP):</strong> imap.malaca.com.br (Porta 993 - SSL/TLS)</li>
            <li><strong>Servidor de Saída (SMTP):</strong> smtp.malaca.com.br (Porta 587 - STARTTLS)</li>
            <li><strong>Servidor POP3:</strong> pop.malaca.com.br (Porta 995 - SSL)</li>
          </ul>
        </div>
        <p>Qualquer dúvida, nossa equipe de suporte está à sua disposição.</p>
        <p>Atenciosamente,<br><strong>Equipe Malaca Mail</strong></p>
      </div>
    `,
    texto: `Bem-vindo ao Malaca Mail, ${user.nome}! Sua conta ${user.email} está pronta.`,
    data_envio: new Date().toISOString(),
    lida: false,
    favorita: true,
    pasta: "inbox",
    anexos: [],
  };

  const initialEmails = [welcomeMessage, ...mockEmails.map((e) => ({ ...e, destinatarios: [{ nome: user.nome, email: user.email }] }))];
  window.localStorage.setItem(key, JSON.stringify(initialEmails));
}
