"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

type OrderLine = {
  id: string;
  title: string;
  note: string;
  card_text: string;
  total: number | string;
  items: Array<{ title: string; brand?: string; price?: number; sku?: string }>;
};

type AdminOrder = {
  id: string;
  order_number: string;
  status: string;
  total: number | string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_postcode: string;
  customer_city: string;
  delivery_method: string;
  recipient_name: string;
  delivery_address: string;
  delivery_postcode: string;
  delivery_city: string;
  requested_delivery_date: string;
  delivery_note: string;
  created_at: string;
  order_lines: OrderLine[];
};

const statusLabels: Record<string, string> = {
  new: "Ny",
  confirmed: "Bekræftet",
  paid: "Betalt",
  packed: "Pakket",
  sent: "Sendt",
  cancelled: "Annulleret"
};

const statuses = Object.keys(statusLabels);

function money(value: number | string) {
  return `${Math.round(Number(value) || 0).toLocaleString("da-DK")} kr.`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || orders[0],
    [orders, selectedOrderId]
  );

  async function loadOrders() {
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/admin/orders");
    if (response.status === 401) {
      setIsLoggedIn(false);
      setIsLoading(false);
      return;
    }

    if (!response.ok) {
      setError("Ordrer kunne ikke hentes.");
      setIsLoading(false);
      return;
    }

    const data = await response.json() as { orders: AdminOrder[] };
    setOrders(data.orders);
    setSelectedOrderId((current) => current || data.orders[0]?.id || "");
    setIsLoggedIn(true);
    setIsLoading(false);
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      setError(response.status === 401 ? "Forkert adgangskode." : "Admin-login mangler konfiguration.");
      setIsLoading(false);
      return;
    }

    await loadOrders();
  }

  async function updateStatus(orderId: string, status: string) {
    setError("");

    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status })
    });

    if (!response.ok) {
      setError("Status kunne ikke opdateres.");
      return;
    }

    setOrders((current) =>
      current.map((order) => order.id === orderId ? { ...order, status } : order)
    );
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  if (!isLoggedIn && !isLoading) {
    return (
      <main className="admin-login-page">
        <form className="admin-login-card" onSubmit={login}>
          <span className="eyebrow">Greenplanet admin</span>
          <h1>Log ind</h1>
          <p>Brug admin-adgangskoden for at se ordrer og opdatere ordrestatus.</p>
          <input
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Admin-adgangskode"
            type="password"
          />
          {error && <div className="admin-error">{error}</div>}
          <button className="btn primary" type="submit">Log ind</button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="eyebrow">Greenplanet admin</span>
          <h1>Ordrer</h1>
        </div>
        <button className="btn" onClick={loadOrders}>Opdater</button>
      </header>

      {error && <div className="admin-error">{error}</div>}
      {isLoading && <div className="admin-empty">Henter ordrer...</div>}

      {!isLoading && orders.length === 0 && (
        <div className="admin-empty">Der er ingen ordrer endnu.</div>
      )}

      {!isLoading && orders.length > 0 && (
        <section className="admin-grid">
          <div className="admin-orders-list">
            {orders.map((order) => (
              <button
                className={`admin-order-card ${selectedOrder?.id === order.id ? "active" : ""}`}
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
              >
                <span>{formatDate(order.created_at)}</span>
                <strong>{order.order_number}</strong>
                <em>{order.customer_name || "Ukendt kunde"} · {money(order.total)}</em>
                <b>{statusLabels[order.status] || order.status}</b>
              </button>
            ))}
          </div>

          {selectedOrder && (
            <article className="admin-detail panel">
              <div className="admin-detail-head">
                <div>
                  <span className="eyebrow">Ordre</span>
                  <h2>{selectedOrder.order_number}</h2>
                  <p>{formatDate(selectedOrder.created_at)}</p>
                </div>
                <select
                  value={selectedOrder.status}
                  onChange={(event) => updateStatus(selectedOrder.id, event.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>{statusLabels[status]}</option>
                  ))}
                </select>
              </div>

              <div className="admin-summary-row">
                <div><span>Total</span><strong>{money(selectedOrder.total)}</strong></div>
                <div><span>Linjer</span><strong>{selectedOrder.order_lines.length}</strong></div>
                <div><span>Status</span><strong>{statusLabels[selectedOrder.status] || selectedOrder.status}</strong></div>
              </div>

              <div className="admin-info-grid">
                <section>
                  <h3>Bestiller</h3>
                  <p><strong>{selectedOrder.customer_name || "Ikke udfyldt"}</strong></p>
                  <p>{[selectedOrder.customer_email, selectedOrder.customer_phone].filter(Boolean).join(" · ") || "Ingen kontaktoplysninger"}</p>
                  <p>{[selectedOrder.customer_address, selectedOrder.customer_postcode, selectedOrder.customer_city].filter(Boolean).join(", ") || "Ingen adresse"}</p>
                </section>
                <section>
                  <h3>Levering</h3>
                  <p><strong>{selectedOrder.delivery_method || "Ikke valgt"}</strong></p>
                  <p>{selectedOrder.recipient_name || "Ingen modtager"}</p>
                  <p>{[selectedOrder.delivery_address, selectedOrder.delivery_postcode, selectedOrder.delivery_city].filter(Boolean).join(", ") || "Ingen leveringsadresse"}</p>
                  <p>{selectedOrder.requested_delivery_date ? `Ønsket dato: ${selectedOrder.requested_delivery_date}` : "Ingen ønsket dato"}</p>
                </section>
              </div>

              {selectedOrder.delivery_note && (
                <div className="admin-note">
                  <span>Leveringsnote</span>
                  <p>{selectedOrder.delivery_note}</p>
                </div>
              )}

              <h3 className="admin-section-title">Ordrelinjer</h3>
              <div className="admin-lines">
                {selectedOrder.order_lines.map((line) => (
                  <div className="admin-line" key={line.id}>
                    <div>
                      <strong>{line.title}</strong>
                      <span>{line.note}</span>
                    </div>
                    <em>{money(line.total)}</em>
                    {line.card_text && (
                      <p><b>Korttekst:</b> {line.card_text}</p>
                    )}
                    <ul>
                      {line.items?.map((item, index) => (
                        <li key={`${line.id}-${index}`}>
                          {item.title}{item.brand ? ` · ${item.brand}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          )}
        </section>
      )}
    </main>
  );
}
