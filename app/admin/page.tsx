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

type AdminProduct = {
  id: string;
  legacy_id: string | null;
  slug: string;
  title: string;
  brand: string;
  category: string;
  price: number | string;
  cost: number | string;
  stock: number;
  sku: string | null;
  giftbox_eligible: boolean;
  status: string;
  image_url: string | null;
};

type Customer = {
  key: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  orders: AdminOrder[];
  total: number;
  latestOrder: string;
};

type AdminTab = "orders" | "customers" | "inventory";

const statusLabels: Record<string, string> = {
  new: "Ny",
  confirmed: "Bekræftet",
  paid: "Betalt",
  packed: "Pakket",
  sent: "Sendt",
  cancelled: "Annulleret"
};

const productStatusLabels: Record<string, string> = {
  draft: "Kladde",
  live: "Live",
  archived: "Arkiveret"
};

const statuses = Object.keys(statusLabels);
const productStatuses = Object.keys(productStatusLabels);

function money(value: number | string) {
  return `${Math.round(Number(value) || 0).toLocaleString("da-DK")} kr.`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function customerKey(order: AdminOrder) {
  return order.customer_email || order.customer_phone || order.customer_name || order.id;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedCustomerKey, setSelectedCustomerKey] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [error, setError] = useState("");

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || orders[0],
    [orders, selectedOrderId]
  );

  const customers = useMemo(() => {
    const grouped = new Map<string, Customer>();

    orders.forEach((order) => {
      const key = customerKey(order);
      const existing = grouped.get(key);
      const address = [order.customer_address, order.customer_postcode, order.customer_city].filter(Boolean).join(", ");

      if (existing) {
        existing.orders.push(order);
        existing.total += Number(order.total) || 0;
        if (new Date(order.created_at) > new Date(existing.latestOrder)) {
          existing.latestOrder = order.created_at;
        }
        return;
      }

      grouped.set(key, {
        key,
        name: order.customer_name || "Ukendt kunde",
        email: order.customer_email,
        phone: order.customer_phone,
        address,
        orders: [order],
        total: Number(order.total) || 0,
        latestOrder: order.created_at
      });
    });

    return Array.from(grouped.values()).sort((a, b) => new Date(b.latestOrder).getTime() - new Date(a.latestOrder).getTime());
  }, [orders]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.key === selectedCustomerKey) || customers[0],
    [customers, selectedCustomerKey]
  );

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || products[0],
    [products, selectedProductId]
  );

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock <= 2 && product.status === "live"),
    [products]
  );

  async function loadAdminData() {
    setIsLoading(true);
    setError("");

    const ordersResponse = await fetch("/api/admin/orders");
    if (ordersResponse.status === 401) {
      setIsLoggedIn(false);
      setIsLoading(false);
      return;
    }

    if (!ordersResponse.ok) {
      setError("Admin-data kunne ikke hentes.");
      setIsLoading(false);
      return;
    }

    const productsResponse = await fetch("/api/admin/products");
    if (!productsResponse.ok) {
      setError("Lagerdata kunne ikke hentes.");
      setIsLoading(false);
      return;
    }

    const ordersData = await ordersResponse.json() as { orders: AdminOrder[] };
    const productsData = await productsResponse.json() as { products: AdminProduct[] };

    setOrders(ordersData.orders);
    setProducts(productsData.products);
    setSelectedOrderId((current) => current || ordersData.orders[0]?.id || "");
    setSelectedProductId((current) => current || productsData.products[0]?.id || "");
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

    await loadAdminData();
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

  async function createPaymentLink(orderId: string) {
    setError("");
    setPaymentUrl("");
    setIsCreatingPayment(true);

    const response = await fetch("/api/admin/stripe-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId })
    });

    setIsCreatingPayment(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Betalingslink kunne ikke oprettes." })) as { error?: string };
      setError(data.error || "Betalingslink kunne ikke oprettes.");
      return;
    }

    const data = await response.json() as { url: string };
    setPaymentUrl(data.url);
  }

  async function updateProduct(productId: string, update: { stock?: number; status?: string }) {
    setError("");

    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId, ...update })
    });

    if (!response.ok) {
      setError("Produktet kunne ikke opdateres.");
      return;
    }

    setProducts((current) =>
      current.map((product) => product.id === productId ? { ...product, ...update } : product)
    );
  }

  useEffect(() => {
    void loadAdminData();
  }, []);

  if (!isLoggedIn && !isLoading) {
    return (
      <main className="admin-login-page">
        <form className="admin-login-card" onSubmit={login}>
          <span className="eyebrow">Greenplanet admin</span>
          <h1>Log ind</h1>
          <p>Brug admin-adgangskoden for at se ordrer, kunder og lager.</p>
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
          <h1>{activeTab === "orders" ? "Ordrestyring" : activeTab === "customers" ? "Kundestyring" : "Lagerstyring"}</h1>
        </div>
        <button className="btn" onClick={loadAdminData}>Opdater</button>
      </header>

      <nav className="admin-tabs" aria-label="Admin navigation">
        <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
          Ordrer <span>{orders.length}</span>
        </button>
        <button className={activeTab === "customers" ? "active" : ""} onClick={() => setActiveTab("customers")}>
          Kunder <span>{customers.length}</span>
        </button>
        <button className={activeTab === "inventory" ? "active" : ""} onClick={() => setActiveTab("inventory")}>
          Lager <span>{lowStockProducts.length} lav</span>
        </button>
      </nav>

      {error && <div className="admin-error">{error}</div>}
      {isLoading && <div className="admin-empty">Henter admin-data...</div>}

      {!isLoading && activeTab === "orders" && (
        orders.length === 0 ? <div className="admin-empty">Der er ingen ordrer endnu.</div> : (
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

                <div className="admin-payment-box">
                  <div>
                    <span>Stripe</span>
                    <strong>Betalingslink</strong>
                    <p>Opret et Stripe Checkout-link, når fragt og ordre er godkendt.</p>
                  </div>
                  <button className="btn primary" disabled={isCreatingPayment} onClick={() => createPaymentLink(selectedOrder.id)}>
                    {isCreatingPayment ? "Opretter..." : "Opret betalingslink"}
                  </button>
                  {paymentUrl && (
                    <div className="admin-payment-url">
                      <input readOnly value={paymentUrl} onFocus={(event) => event.target.select()} />
                      <a className="btn" href={paymentUrl} rel="noreferrer" target="_blank">Åbn</a>
                    </div>
                  )}
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
        )
      )}

      {!isLoading && activeTab === "customers" && (
        customers.length === 0 ? <div className="admin-empty">Der er ingen kunder endnu.</div> : (
          <section className="admin-grid">
            <div className="admin-orders-list">
              {customers.map((customer) => (
                <button
                  className={`admin-order-card ${selectedCustomer?.key === customer.key ? "active" : ""}`}
                  key={customer.key}
                  onClick={() => setSelectedCustomerKey(customer.key)}
                >
                  <span>{formatDate(customer.latestOrder)}</span>
                  <strong>{customer.name}</strong>
                  <em>{customer.orders.length} ordre · {money(customer.total)}</em>
                  <b>{customer.email || customer.phone || "Ingen kontakt"}</b>
                </button>
              ))}
            </div>

            {selectedCustomer && (
              <article className="admin-detail panel">
                <div className="admin-detail-head">
                  <div>
                    <span className="eyebrow">Kunde</span>
                    <h2>{selectedCustomer.name}</h2>
                    <p>{selectedCustomer.email || selectedCustomer.phone || "Ingen kontaktoplysninger"}</p>
                  </div>
                </div>

                <div className="admin-summary-row">
                  <div><span>Ordrer</span><strong>{selectedCustomer.orders.length}</strong></div>
                  <div><span>Omsætning</span><strong>{money(selectedCustomer.total)}</strong></div>
                  <div><span>Seneste</span><strong>{formatDate(selectedCustomer.latestOrder)}</strong></div>
                </div>

                <div className="admin-info-grid">
                  <section>
                    <h3>Kontakt</h3>
                    <p>{selectedCustomer.email || "Ingen e-mail"}</p>
                    <p>{selectedCustomer.phone || "Intet telefonnummer"}</p>
                  </section>
                  <section>
                    <h3>Adresse</h3>
                    <p>{selectedCustomer.address || "Ingen adresse"}</p>
                  </section>
                </div>

                <h3 className="admin-section-title">Kundens ordrer</h3>
                <div className="admin-lines">
                  {selectedCustomer.orders.map((order) => (
                    <button
                      className="admin-line admin-line-button"
                      key={order.id}
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setActiveTab("orders");
                      }}
                    >
                      <div>
                        <strong>{order.order_number}</strong>
                        <span>{formatDate(order.created_at)} · {statusLabels[order.status] || order.status}</span>
                      </div>
                      <em>{money(order.total)}</em>
                    </button>
                  ))}
                </div>
              </article>
            )}
          </section>
        )
      )}

      {!isLoading && activeTab === "inventory" && (
        products.length === 0 ? <div className="admin-empty">Der er ingen produkter i lageret.</div> : (
          <section className="admin-grid">
            <div className="admin-orders-list">
              {products.map((product) => (
                <button
                  className={`admin-order-card ${selectedProduct?.id === product.id ? "active" : ""}`}
                  key={product.id}
                  onClick={() => setSelectedProductId(product.id)}
                >
                  <span>{product.brand} · {product.category}</span>
                  <strong>{product.title}</strong>
                  <em>{product.sku || "Ingen SKU"} · {money(product.price)}</em>
                  <b>{product.stock <= 2 ? `${product.stock} på lager` : `${product.stock} stk.`}</b>
                </button>
              ))}
            </div>

            {selectedProduct && (
              <article className="admin-detail panel">
                <div className="admin-detail-head">
                  <div>
                    <span className="eyebrow">Lager</span>
                    <h2>{selectedProduct.title}</h2>
                    <p>{selectedProduct.brand} · {selectedProduct.category}</p>
                  </div>
                  <select
                    value={selectedProduct.status}
                    onChange={(event) => updateProduct(selectedProduct.id, { status: event.target.value })}
                  >
                    {productStatuses.map((status) => (
                      <option key={status} value={status}>{productStatusLabels[status]}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-summary-row">
                  <div><span>Lager</span><strong>{selectedProduct.stock}</strong></div>
                  <div><span>Pris</span><strong>{money(selectedProduct.price)}</strong></div>
                  <div><span>Kost</span><strong>{money(selectedProduct.cost)}</strong></div>
                </div>

                <div className="admin-inventory-controls">
                  <button className="btn" onClick={() => updateProduct(selectedProduct.id, { stock: Math.max(0, selectedProduct.stock - 1) })}>-1</button>
                  <input
                    min="0"
                    type="number"
                    value={selectedProduct.stock}
                    onChange={(event) => updateProduct(selectedProduct.id, { stock: Number(event.target.value) })}
                  />
                  <button className="btn" onClick={() => updateProduct(selectedProduct.id, { stock: selectedProduct.stock + 1 })}>+1</button>
                </div>

                <div className="admin-info-grid">
                  <section>
                    <h3>Produktdata</h3>
                    <p>SKU: {selectedProduct.sku || "Ingen SKU"}</p>
                    <p>Status: {productStatusLabels[selectedProduct.status] || selectedProduct.status}</p>
                    <p>Gaveæske-egnet: {selectedProduct.giftbox_eligible ? "Ja" : "Nej"}</p>
                  </section>
                  <section>
                    <h3>Lageralarm</h3>
                    <p>{selectedProduct.stock <= 2 ? "Lav lagerbeholdning. Overvej genbestilling." : "Lagerbeholdningen ser fin ud."}</p>
                  </section>
                </div>
              </article>
            )}
          </section>
        )
      )}
    </main>
  );
}
