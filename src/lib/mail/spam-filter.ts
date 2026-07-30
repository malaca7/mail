/**
 * Motor de filtragem antispam inspirado no SpamAssassin.
 * Analisa assunto, corpo, remetente e anexos para calcular um score de spam.
 */

import { getSecurityConfig } from "./security-config";
import type { Email } from "./types";

export interface SpamResult {
  score: number;
  isSpam: boolean;
  matchedRules: { ruleId: string; ruleName: string; score: number; description: string }[];
  virusScanClean: boolean;
  virusDetails?: string;
}

export function analyzeEmail(email: Email): SpamResult {
  const config = getSecurityConfig();
  const sa = config.spamassassin;
  const clamav = config.clamav;

  const matchedRules: SpamResult["matchedRules"] = [];
  let totalScore = 0;

  if (!sa.enabled) {
    return { score: 0, isSpam: false, matchedRules: [], virusScanClean: true };
  }

  const senderDomain = email.remetente.email.split("@")[1]?.toLowerCase() ?? "";

  // Check whitelist — skip spam check
  if (sa.whitelist.some((w) => senderDomain.includes(w.toLowerCase()))) {
    return { score: 0, isSpam: false, matchedRules: [], virusScanClean: true };
  }

  // Check blacklist — instant spam
  if (sa.blacklist.some((b) => senderDomain.includes(b.toLowerCase()))) {
    matchedRules.push({
      ruleId: "BLACKLIST",
      ruleName: "SENDER_BLACKLISTED",
      score: 10,
      description: `Domínio ${senderDomain} está na blacklist`,
    });
    return { score: 10, isSpam: true, matchedRules, virusScanClean: true };
  }

  const subject = email.assunto ?? "";
  const body = (email.texto ?? "") + " " + (email.html ?? "");

  for (const rule of sa.rules) {
    if (!rule.enabled) continue;

    let matched = false;

    switch (rule.id) {
      case "r1": // SUBJ_ALL_CAPS
        matched = subject.length > 5 && subject === subject.toUpperCase() && /[A-Z]{5,}/.test(subject);
        break;
      case "r2": // BODY_URGENCY
        matched = /\b(urgente|imediato|agora mesmo|última chance|açã[o] imediata)\b/i.test(body);
        break;
      case "r3": // SUBJ_FREE_PRIZE
        matched = /\b(prêmio|premiado|selecionado|ganhou|grátis|gratuito|free)\b/i.test(subject);
        break;
      case "r4": // BODY_CLICK_HERE
        matched = /\b(clique aqui|acesse agora|click here|act now)\b/i.test(body);
        break;
      case "r5": // SENDER_NO_NAME
        matched = !email.remetente.nome || email.remetente.nome.trim() === "";
        break;
      case "r6": // BODY_HTML_ONLY
        matched = email.html.length > 100 && email.texto.trim().length < 20;
        break;
      case "r7": // SUBJ_EXCLAMATION
        matched = (subject.match(/!/g) || []).length >= 3;
        break;
      case "r8": // BODY_MONEY_KEYWORDS
        matched = /\b(R\$|ganhe|lucro|investimento|fature|renda extra|dinheiro fácil)\b/i.test(body);
        break;
      case "r9": // ATTACHMENT_EXECUTABLE
        matched = email.anexos.some((a) =>
          /\.(exe|bat|cmd|scr|pif|msi|vbs|js|wsf)$/i.test(a.nome)
        );
        break;
      case "r10": // BODY_PHISHING_URL
        matched = /\b(bit\.ly|tinyurl|goo\.gl|t\.co|encurtador|verify-account|confirm-identity)\b/i.test(body);
        break;
    }

    if (matched) {
      matchedRules.push({
        ruleId: rule.id,
        ruleName: rule.name,
        score: rule.score,
        description: rule.description,
      });
      totalScore += rule.score;
    }
  }

  // ClamAV virus scan simulation
  let virusScanClean = true;
  let virusDetails: string | undefined;

  if (clamav.enabled && clamav.scanAttachments) {
    const suspiciousAttachment = email.anexos.find((a) =>
      /\.(exe|bat|cmd|scr|pif|msi|vbs|wsf|com|dll)$/i.test(a.nome)
    );
    if (suspiciousAttachment) {
      virusScanClean = false;
      virusDetails = `ClamAV: Arquivo suspeito detectado — ${suspiciousAttachment.nome}`;
    }
  }

  return {
    score: Math.round(totalScore * 10) / 10,
    isSpam: totalScore >= sa.threshold,
    matchedRules,
    virusScanClean,
    virusDetails,
  };
}
