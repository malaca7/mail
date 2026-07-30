/**
 * Configurações de segurança do domínio malaca.com.br
 * Persistidas em localStorage.
 */

const SECURITY_KEY = "malaca-mail:security-config";

export interface DKIMConfig {
  enabled: boolean;
  selector: string;
  publicKey: string;
  algorithm: "rsa-sha256" | "ed25519-sha256";
  keyBits: number;
}

export interface SPFConfig {
  enabled: boolean;
  record: string;
  mode: "strict" | "relaxed";
  includes: string[];
}

export interface DMARCConfig {
  enabled: boolean;
  policy: "none" | "quarantine" | "reject";
  subdomain_policy: "none" | "quarantine" | "reject";
  percentage: number;
  rua_email: string;
  ruf_email: string;
}

export interface SpamAssassinConfig {
  enabled: boolean;
  threshold: number; // 1-10, default 5
  autoLearn: boolean;
  whitelist: string[];
  blacklist: string[];
  rules: SpamRule[];
}

export interface SpamRule {
  id: string;
  name: string;
  description: string;
  score: number;
  enabled: boolean;
}

export interface ClamAVConfig {
  enabled: boolean;
  scanAttachments: boolean;
  scanLinks: boolean;
  lastDefinitionUpdate: string;
  definitionVersion: string;
  quarantineCount: number;
  maxAttachmentSizeMB: number;
}

export interface SecurityConfig {
  dkim: DKIMConfig;
  spf: SPFConfig;
  dmarc: DMARCConfig;
  spamassassin: SpamAssassinConfig;
  clamav: ClamAVConfig;
}

const DEFAULT_SPAM_RULES: SpamRule[] = [
  { id: "r1", name: "SUBJ_ALL_CAPS", description: "Assunto todo em maiúsculas", score: 2.5, enabled: true },
  { id: "r2", name: "BODY_URGENCY", description: "Palavras de urgência no corpo (URGENTE, AGORA, IMEDIATO)", score: 1.8, enabled: true },
  { id: "r3", name: "SUBJ_FREE_PRIZE", description: "Promessa de prêmio ou gratuidade no assunto", score: 3.2, enabled: true },
  { id: "r4", name: "BODY_CLICK_HERE", description: "Frases como 'clique aqui' ou 'acesse agora'", score: 1.5, enabled: true },
  { id: "r5", name: "SENDER_NO_NAME", description: "Remetente sem nome definido", score: 0.8, enabled: true },
  { id: "r6", name: "BODY_HTML_ONLY", description: "Corpo do e-mail contém apenas HTML sem texto puro significativo", score: 1.2, enabled: true },
  { id: "r7", name: "SUBJ_EXCLAMATION", description: "Múltiplas exclamações no assunto (!!!)", score: 1.9, enabled: true },
  { id: "r8", name: "BODY_MONEY_KEYWORDS", description: "Referências a dinheiro (R$, ganhe, lucro, investimento)", score: 2.0, enabled: true },
  { id: "r9", name: "ATTACHMENT_EXECUTABLE", description: "Anexo com extensão executável (.exe, .bat, .cmd)", score: 4.0, enabled: true },
  { id: "r10", name: "BODY_PHISHING_URL", description: "URLs suspeitas de phishing no corpo", score: 3.5, enabled: true },
];

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  dkim: {
    enabled: true,
    selector: "mail",
    publicKey: "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAz3bG...truncated...QIDAQAB",
    algorithm: "rsa-sha256",
    keyBits: 2048,
  },
  spf: {
    enabled: true,
    record: "v=spf1 mx a ip4:203.0.113.10 include:_spf.malaca.com.br ~all",
    mode: "relaxed",
    includes: ["_spf.malaca.com.br", "_spf.google.com"],
  },
  dmarc: {
    enabled: true,
    policy: "quarantine",
    subdomain_policy: "none",
    percentage: 100,
    rua_email: "dmarc-reports@malaca.com.br",
    ruf_email: "dmarc-forensics@malaca.com.br",
  },
  spamassassin: {
    enabled: true,
    threshold: 5,
    autoLearn: true,
    whitelist: ["registro.br", "gov.br"],
    blacklist: ["turbo-deals.biz", "spam-city.net"],
    rules: DEFAULT_SPAM_RULES,
  },
  clamav: {
    enabled: true,
    scanAttachments: true,
    scanLinks: true,
    lastDefinitionUpdate: new Date().toISOString(),
    definitionVersion: "27450",
    quarantineCount: 0,
    maxAttachmentSizeMB: 25,
  },
};

export function getSecurityConfig(): SecurityConfig {
  if (typeof window === "undefined") return DEFAULT_SECURITY_CONFIG;
  try {
    const raw = localStorage.getItem(SECURITY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SecurityConfig>;
      return { ...DEFAULT_SECURITY_CONFIG, ...parsed };
    }
    return DEFAULT_SECURITY_CONFIG;
  } catch {
    return DEFAULT_SECURITY_CONFIG;
  }
}

export function saveSecurityConfig(config: SecurityConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SECURITY_KEY, JSON.stringify(config));
}

export function generateDMARCRecord(config: DMARCConfig): string {
  return `v=DMARC1; p=${config.policy}; sp=${config.subdomain_policy}; pct=${config.percentage}; rua=mailto:${config.rua_email}; ruf=mailto:${config.ruf_email}; adkim=r; aspf=r`;
}
