"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || '/api')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
}

export default function ContactMessagesPage() {
  const [msgs, setMsgs] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/contact`);
      const body = await res.json();
      if (res.ok && body.success) setMsgs(body.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: ContactMessage['status']) => {
    const res = await fetch(`${API_BASE_URL}/contact/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-xl font-bold text-charcoal mb-4">Messages Contact</h1>
        {loading ? (
          <div className="text-slate">Chargement…</div>
        ) : msgs.length === 0 ? (
          <div className="text-slate">Aucun message.</div>
        ) : (
          <div className="grid gap-3">
            {msgs.map(m => (
              <div key={m.id} className="rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-charcoal">{m.name} <span className="text-slate font-normal">&lt;{m.email}&gt;</span></div>
                  <select value={m.status} onChange={e => updateStatus(m.id, e.target.value as any)} className="text-sm border rounded px-2 py-1">
                    <option value="new">Non lu</option>
                    <option value="in_progress">En cours</option>
                    <option value="resolved">Résolu</option>
                    <option value="closed">Fermé</option>
                  </select>
                </div>
                <div className="mt-2 text-slate text-sm whitespace-pre-wrap">{m.message}</div>
                <div className="mt-2 text-xs text-gray-500">{new Date(m.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

