"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Clock, RefreshCw, Truck, Shield, XCircle } from "lucide-react";
import { fetchAdminOrders } from "@/lib/api/admin-orders";
import type { Order } from "@/lib/orders";

interface ReturnForm {
  condition: "good" | "damaged";
  note: string;
  returnDate: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://louaab.ma/api";

export default function ReturnsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [form, setForm] = useState<ReturnForm>({
    condition: "good",
    note: "",
    returnDate: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // Récupérer les commandes "livrées" ou "retournées"
      const delivered = await fetchAdminOrders({ status: "delivered" as Order["status"] });
      const returned = await fetchAdminOrders({ status: "returned" as Order["status"] });
      // Fusion et tri récents
      const merged = [...delivered, ...returned].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setOrders(merged);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Impossible de charger les restitutions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openModal = (order: Order) => {
    setSelectedOrder(order);
    setForm({
      condition: "good",
      note: "",
      returnDate: new Date().toISOString().split("T")[0],
    });
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const confirmReturn = async () => {
    if (!selectedOrder) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/ui/orders/${selectedOrder.id}/return`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          condition: form.condition,
          note: form.note,
          returnDate: form.returnDate,
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.message || "Erreur lors de la restitution");
      }
      closeModal();
      await loadOrders();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erreur lors de la restitution");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate">Commandes</p>
            <h1 className="text-2xl font-bold text-charcoal">Restitutions</h1>
            <p className="text-sm text-slate">Validez les retours, mettez à jour l’état et le stock.</p>
          </div>
          <button
            onClick={loadOrders}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-charcoal transition hover:border-mint hover:text-mint flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Rafraîchir
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-slate">Chargement...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-slate">Aucune commande en restitution.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-charcoal">
                        {order.customerName}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                          order.status === "returned"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-amber-50 border-amber-200 text-amber-700"
                        }`}
                      >
                        {order.status === "returned" ? "Restitué" : "Livré"}
                      </span>
                    </div>
                    <p className="text-sm text-slate">{order.customerPhone}</p>
                    {order.deliveryAddress && (
                      <p className="text-xs text-gray-500 mt-1">{order.deliveryAddress}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Créée le {new Date(order.createdAt).toLocaleString("fr-MA")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate">Total</p>
                    <p className="text-xl font-bold text-charcoal">{order.totalPrice} MAD</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate">
                  {order.items.map((item, idx) => (
                    <span key={idx} className="rounded-full bg-mist/50 px-2 py-1">
                      {item.toyName} · {item.quantity}x
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {order.status === "returned" ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                      <CheckCircle className="h-4 w-4" />
                      Restitution validée
                    </span>
                  ) : (
                    <button
                      onClick={() => openModal(order)}
                      data-style="returns-btn-v3"
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition shadow-lg"
                      style={{
                        background: "linear-gradient(90deg, #059669, #047857)",
                        border: "1px solid rgba(4,120,87,0.6)",
                        boxShadow: "0 12px 25px -6px rgba(4,120,87,0.45)",
                      }}
                    >
                      <Truck className="h-4 w-4" />
                      Confirmer la restitution
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate font-semibold">Restitution</p>
                <h2 className="text-lg font-bold text-charcoal">{selectedOrder.customerName}</h2>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:text-charcoal"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-charcoal">Date de restitution</label>
                <input
                  type="date"
                  value={form.returnDate}
                  onChange={(e) => setForm((f) => ({ ...f, returnDate: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-mint focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm">
                  <input
                    type="radio"
                    name="condition"
                    value="good"
                    checked={form.condition === "good"}
                    onChange={() => setForm((f) => ({ ...f, condition: "good" }))}
                  />
                  Bon état
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm">
                  <input
                    type="radio"
                    name="condition"
                    value="damaged"
                    checked={form.condition === "damaged"}
                    onChange={() => setForm((f) => ({ ...f, condition: "damaged" }))}
                  />
                  Mauvais état
                </label>
              </div>
              <div>
                <label className="text-sm font-semibold text-charcoal">Note</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-mint focus:outline-none min-h-[100px]"
                  placeholder="Observations sur la restitution, état du jouet, etc."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4">
              <button
                onClick={closeModal}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmReturn}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-mint/90 disabled:opacity-60"
              >
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                Valider la restitution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
