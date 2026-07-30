import { useEffect, useMemo, useState } from "react";
import { mockEmails } from "@/lib/mail/mock-data";
import { getUserEmails, saveUserEmails } from "@/lib/mail/session";
import type { Email, FolderId, User } from "@/lib/mail/types";

const PAGE_SIZE = 6;

export function useMailbox(user?: User | null) {
  const [emails, setEmailsState] = useState<Email[]>(() => {
    return user ? getUserEmails(user) : mockEmails;
  });

  useEffect(() => {
    if (!user) return;

    const reload = () => {
      setEmailsState(getUserEmails(user));
    };

    reload();

    window.addEventListener("storage", reload);
    window.addEventListener("malaca-mail:updated", reload);

    const interval = setInterval(reload, 2500);

    return () => {
      window.removeEventListener("storage", reload);
      window.removeEventListener("malaca-mail:updated", reload);
      clearInterval(interval);
    };
  }, [user?.id]);

  const setEmails = (action: React.SetStateAction<Email[]>) => {
    setEmailsState((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      if (user) {
        saveUserEmails(user, next);
      }
      return next;
    });
  };

  const [folder, setFolderState] = useState<FolderId>("inbox");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const email of emails) {
      if (!email.lida && email.pasta !== "trash") map[email.pasta] = (map[email.pasta] ?? 0) + 1;
    }
    map.drafts = emails.filter((e) => e.pasta === "drafts").length;
    map.starred = emails.filter((e) => e.favorita && e.pasta !== "trash").length;
    return map;
  }, [emails]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return emails
      .filter((e) => (folder === "starred" ? e.favorita && e.pasta !== "trash" : e.pasta === folder))
      .filter((e) =>
        term
          ? [e.assunto, e.texto, e.preview, e.remetente.nome ?? "", e.remetente.email]
              .join(" ")
              .toLowerCase()
              .includes(term)
          : true,
      )
      .sort((a, b) => +new Date(b.data_envio) - +new Date(a.data_envio));
  }, [emails, folder, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selected = emails.find((e) => e.id === selectedId) ?? null;

  const update = (id: string, patch: Partial<Email>) =>
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  return {
    emails,
    folder,
    query,
    counts,
    filtered,
    pageItems,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    selected,
    setQuery: (value: string) => {
      setQuery(value);
      setPage(1);
    },
    setFolder: (value: FolderId) => {
      setFolderState(value);
      setPage(1);
      setSelectedId(null);
    },
    setPage,
    open: (id: string) => {
      setSelectedId(id);
      update(id, { lida: true });
    },
    close: () => setSelectedId(null),
    toggleRead: (id: string, lida: boolean) => update(id, { lida }),
    toggleStar: (id: string) => {
      const email = emails.find((e) => e.id === id);
      if (email) update(id, { favorita: !email.favorita });
    },
    remove: (id: string) => {
      const email = emails.find((e) => e.id === id);
      if (!email) return;
      if (email.pasta === "trash") {
        setEmails((prev) => prev.filter((e) => e.id !== id));
      } else {
        update(id, { pasta: "trash" });
      }
      if (selectedId === id) setSelectedId(null);
    },
    addEmail: (email: Email) => setEmails((prev) => [email, ...prev]),
  };
}

export type Mailbox = ReturnType<typeof useMailbox>;
