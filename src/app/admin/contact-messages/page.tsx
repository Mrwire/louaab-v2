"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://louaab.ma/api";

type ContactStatus = "new" | "in_progress" | "resolved" | "closed";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
}

const statusLabels: Record<ContactStatus, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  resolved: "Résolu",
  closed: "Fermé",
};

const badgeClasses: Record<ContactStatus, string> = {
  new: "bg-coral/10 text-coral",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-gray-200 text-gray-700",
};

export default function ContactMessagesPage() {
  const [msgs, setMsgs] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        credentials: "include",
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(body?.data)) {
        setMsgs(body.data);
      } else {
        setError("Impossible de charger les messages.");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur réseau lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: ContactStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMsgs((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sorted = useMemo(
    () =>
      [...msgs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [msgs],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate">Inbox</p>
            <h1 className="text-2xl font-bold text-charcoal">Messages contact</h1>
          </div>
          <button
            onClick={load}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-charcoal transition hover:border-mint hover:text-mint"
          >
            Rafraîchir
          </button>
        </div>

        {loading && (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-slate">Chargement...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-coral/30 bg-white p-6 shadow-sm">
            <p className="text-sm text-coral">{error}</p>
          </div>
        )}

        {!loading && !error && sorted.length === 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-slate">Aucun message reçu pour le moment.</p>
          </div>
        )}

        {!loading && !error && sorted.length > 0 && (
          <div className="space-y-3">
            {sorted.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-charcoal">{m.name}</p>
                      {m.email && <p className="text-xs text-slate">&lt;{m.email}&gt;</p>}
                      {m.phone && <span className="text-xs text-slate">• {m.phone}</span>}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {new Date(m.createdAt).toLocaleString("fr-MA")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${badgeClasses[m.status]}`}
                    >
                      {statusLabels[m.status]}
                    </span>
                    <select
                      value={m.status}
                      onChange={(e) => updateStatus(m.id, e.target.value as ContactStatus)}
                      className="rounded-lg border border-mist bg-white px-3 py-1 text-sm font-medium text-charcoal focus:border-mint focus:outline-none"
                    >
                      <option value="new">Nouveau</option>
                      <option value="in_progress">En cours</option>
                      <option value="resolved">Résolu</option>
                      <option value="closed">Fermé</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 rounded-xl bg-mist/20 p-3 text-sm text-slate whitespace-pre-wrap">
                  {m.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
