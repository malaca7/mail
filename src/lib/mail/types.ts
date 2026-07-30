/**
 * Tipos de domínio do Malaca Mail.
 * Espelham o schema previsto no Prisma/PostgreSQL (users, folders, emails, attachments)
 * para que a troca da camada mock pela API real não exija mudanças de UI.
 */

export type FolderId = "inbox" | "sent" | "drafts" | "spam" | "trash" | "starred";

export interface User {
  id: string;
  nome: string;
  email: string;
  criado_em: string;
}

export interface Attachment {
  id: string;
  email_id: string;
  nome: string;
  tipo: string;
  /** bytes */
  tamanho: number;
  caminho: string;
}

export interface EmailAddress {
  nome?: string;
  email: string;
}

export interface SecurityHeaders {
  spf?: "pass" | "fail" | "softfail" | "neutral" | "none";
  dkim?: "pass" | "fail" | "none";
  dmarc?: "pass" | "fail" | "none";
}

export interface Email {
  id: string;
  message_id: string;
  remetente: EmailAddress;
  destinatarios: EmailAddress[];
  cc?: EmailAddress[];
  cco?: EmailAddress[];
  assunto: string;
  preview: string;
  html: string;
  texto: string;
  data_envio: string;
  lida: boolean;
  favorita: boolean;
  pasta: FolderId;
  anexos: Attachment[];
  /** Spam score atribuído pelo filtro SpamAssassin */
  spamScore?: number;
  /** Detalhes das regras de spam que foram acionadas */
  spamDetails?: string;
  /** Headers de autenticação (SPF/DKIM/DMARC) */
  securityHeaders?: SecurityHeaders;
}

export interface DraftPayload {
  para: string;
  cc: string;
  cco: string;
  assunto: string;
  html: string;
  anexos: { nome: string; tipo: string; tamanho: number }[];
}
