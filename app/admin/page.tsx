"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

type OrderLine = {
  id: string;
  title: string;
  note: string;
  card_text: string;
  total: number | string;
  items: Array<{ title: string; brand?: string; price?: number; sku?: string; selectedVariant?: { title?: string; sku?: string } }>;
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

type AdminCustomer = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  postcode: string | null;
  city: string | null;
  created_at: string;
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
  variants?: AdminVariant[];
  giftbox_eligible: boolean;
  status: string;
  image_url: string | null;
};

type AdminVariant = {
  id: string;
  title: string;
  sku: string;
  price: number;
  stock: number;
  status?: string;
};

type Customer = {
  key: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  city: string;
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
  if (!value) return "Ingen dato";
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function customerKey(order: AdminOrder) {
  return order.customer_email || order.customer_phone || order.customer_name || order.id;
}

function searchable(value: unknown) {
  return String(value || "").toLowerCase();
}

function productTotalStock(product: AdminProduct) {
  if (!product.variants?.length) return product.stock;
  return product.variants
    .filter((variant) => variant.status !== "archived")
    .reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0);
}

function productHasLowStock(product: AdminProduct) {
  if (product.status !== "live") return false;
  if (!product.variants?.length) return product.stock <= 2;
  return product.variants.some((variant) => variant.status !== "archived" && variant.stock <= 2);
}

function orderContact(order: AdminOrder) {
  return [order.customer_email, order.customer_phone].filter(Boolean).join(" · ") || "Ingen kontaktoplysninger";
}

function orderAddress(street: string, postcode: string, city: string) {
  return [street, postcode, city].filter(Boolean).join(", ") || "Ingen adresse";
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customerProfiles, setCustomerProfiles] = useState<AdminCustomer[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedCustomerKey, setSelectedCustomerKey] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [error, setError] = useState("");

  const customers = useMemo(() => {
    const grouped = new Map<string, Customer>();

    customerProfiles.forEach((profile) => {
      const key = profile.email || profile.phone || profile.id;
      grouped.set(key, {
        key,
        id: profile.id,
        name: profile.name || "Ukendt kunde",
        email: profile.email || "",
        phone: profile.phone || "",
        address: orderAddress(profile.address || "", profile.postcode || "", profile.city || ""),
        postcode: profile.postcode || "",
        city: profile.city || "",
        orders: [],
        total: 0,
        latestOrder: profile.created_at
      });
    });

    orders.forEach((order) => {
      const key = customerKey(order);
      const existing = grouped.get(key);
      const address = orderAddress(order.customer_address, order.customer_postcode, order.customer_city);

      if (existing) {
        existing.orders.push(order);
        existing.total += Number(order.total) || 0;
        if (new Date(order.created_at) > new Date(existing.latestOrder)) existing.latestOrder = order.created_at;
        return;
      }

      grouped.set(key, {
        key,
        name: order.customer_name || "Ukendt kunde",
        email: order.customer_email,
        phone: order.customer_phone,
        address,
        postcode: order.customer_postcode,
        city: order.customer_city,
        orders: [order],
        total: Number(order.total) || 0,
        latestOrder: order.created_at
      });
    });

    return Array.from(grouped.values()).sort((a, b) => new Date(b.latestOrder).getTime() - new Date(a.latestOrder).getTime());
  }, [orders, customerProfiles]);

  const filteredOrders = useMemo(() => {
    const term = searchable(orderSearch);
    return orders.filter((order) => {
      const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
      const matchesSearch = !term || [
        order.order_number,
        order.customer_name,
        order.customer_email,
        order.customer_phone,
        order.recipient_name,
        order.delivery_city
      ].some((value) => searchable(value).includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const filteredCustomers = useMemo(() => {
    const term = searchable(customerSearch);
    return customers.filter((customer) => !term || [
      customer.name,
      customer.email,
      customer.phone,
      customer.address
    ].some((value) => searchable(value).includes(term)));
  }, [customers, customerSearch]);

  const filteredProducts = useMemo(() => {
    const term = searchable(productSearch);
    return products.filter((product) => {
      const matchesStatus = productStatusFilter === "all" || product.status === productStatusFilter;
      const matchesSearch = !term || [
        product.title,
        product.brand,
        product.category,
        product.sku,
        ...(product.variants || []).flatMap((variant) => [variant.title, variant.sku])
      ].some((value) => searchable(value).includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [products, productSearch, productStatusFilter]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || filteredOrders[0] || orders[0],
    [orders, filteredOrders, selectedOrderId]
  );

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.key === selectedCustomerKey) || filteredCustomers[0] || customers[0],
    [customers, filteredCustomers, selectedCustomerKey]
  );

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || filteredProducts[0] || products[0],
    [products, filteredProducts, selectedProductId]
  );

  const lowStockProducts = useMemo(() => products.filter(productHasLowStock), [products]);
  const newOrdersCount = orders.filter((order) => order.status === "new").length;
  const unpaidOrdersCount = orders.filter((order) => ["new", "confirmed"].includes(order.status)).length;
  const liveProductCount = products.filter((product) => product.status === "live").length;

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

    const customersResponse = await fetch("/api/admin/customers");
    if (!customersResponse.ok) {
      setError("Kundedata kunne ikke hentes.");
      setIsLoading(false);
      return;
    }

    const ordersData = await ordersResponse.json() as { orders: AdminOrder[] };
    const productsData = await productsResponse.json() as { products: AdminProduct[] };
    const customersData = await customersResponse.json() as { customers: AdminCustomer[] };

    setOrders(ordersData.orders);
    setProducts(productsData.products);
    setCustomerProfiles(customersData.customers);
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

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsLoggedIn(false);
    setOrders([]);
    setProducts([]);
    setCustomerProfiles([]);
    setPassword("");
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

    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order));
  }

  async function deleteOrder(orderId: string) {
    if (!window.confirm("Vil du slette ordren? Ordrelinjer slettes også.")) return;
    setError("");

    const response = await fetch(`/api/admin/orders?id=${encodeURIComponent(orderId)}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Ordren kunne ikke slettes.");
      return;
    }

    setOrders((current) => current.filter((order) => order.id !== orderId));
    setSelectedOrderId("");
  }

  async function updateCustomer(customer: Customer, update: { name: string; email: string; phone: string; address: string; postcode: string; city: string }) {
    setError("");

    const response = await fetch("/api/admin/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: customer.id,
        key: customer.key,
        originalEmail: customer.email,
        originalPhone: customer.phone,
        originalName: customer.name,
        ...update
      })
    });

    if (!response.ok) {
      setError("Kunden kunne ikke opdateres.");
      return;
    }

    await loadAdminData();
  }

  async function deleteCustomer(customer: Customer) {
    if (!window.confirm("Vil du slette kunden? Kundens persondata fjernes fra kundeprofil og ordreoversigt, men ordrelinjer beholdes.")) return;
    setError("");

    const params = new URLSearchParams({
      id: customer.id || "",
      email: customer.email || "",
      phone: customer.phone || "",
      name: customer.name || ""
    });
    const response = await fetch(`/api/admin/customers?${params.toString()}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Kunden kunne ikke slettes.");
      return;
    }

    await loadAdminData();
    setSelectedCustomerKey("");
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

  async function updateProduct(productId: string, update: { stock?: number; price?: number; cost?: number; status?: string; variants?: AdminVariant[] }) {
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

    setProducts((current) => current.map((product) => product.id === productId ? { ...product, ...update } : product));
  }

  function updateProductVariant(product: AdminProduct, variantId: string, update: Partial<AdminVariant>) {
    const variants = (product.variants || []).map((variant) =>
      variant.id === variantId ? { ...variant, ...update } : variant
    );
    void updateProduct(product.id, { variants });
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
        <div className="admin-header-actions">
          <button className="btn" onClick={loadAdminData}>Opdater</button>
          <button className="btn" onClick={logout}>Log ud</button>
        </div>
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

      <section className="admin-kpi-grid" aria-label="Admin nøgletal">
        <div><span>Nye ordrer</span><strong>{newOrdersCount}</strong></div>
        <div><span>Afventer betaling</span><strong>{unpaidOrdersCount}</strong></div>
        <div><span>Lavt lager</span><strong>{lowStockProducts.length}</strong></div>
        <div><span>Live produkter</span><strong>{liveProductCount}</strong></div>
      </section>

      {error && <div className="admin-error">{error}</div>}
      {isLoading && <div className="admin-empty">Henter admin-data...</div>}

      {!isLoading && activeTab === "orders" && (
        orders.length === 0 ? <div className="admin-empty">Der er ingen ordrer endnu.</div> : (
          <>
            <div className="admin-filter-bar">
              <input value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Søg ordre, kunde, mail, telefon eller by" />
              <select value={orderStatusFilter} onChange={(event) => setOrderStatusFilter(event.target.value)}>
                <option value="all">Alle statusser</option>
                {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
              </select>
            </div>
            {filteredOrders.length === 0 ? <div className="admin-empty">Ingen ordrer matcher filteret.</div> : (
              <section className="admin-grid">
                <div className="admin-orders-list">
                  {filteredOrders.map((order) => (
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
                {selectedOrder && <OrderDetail order={selectedOrder} paymentUrl={paymentUrl} isCreatingPayment={isCreatingPayment} onStatus={updateStatus} onPayment={createPaymentLink} onDelete={deleteOrder} />}
              </section>
            )}
          </>
        )
      )}

      {!isLoading && activeTab === "customers" && (
        customers.length === 0 ? <div className="admin-empty">Der er ingen kunder endnu.</div> : (
          <>
            <div className="admin-filter-bar">
              <input value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="Søg kunde, mail, telefon eller adresse" />
            </div>
            {filteredCustomers.length === 0 ? <div className="admin-empty">Ingen kunder matcher filteret.</div> : (
              <section className="admin-grid">
                <div className="admin-orders-list">
                  {filteredCustomers.map((customer) => (
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
                  <CustomerDetail
                    customer={selectedCustomer}
                    onOpenOrder={(orderId) => {
                      setSelectedOrderId(orderId);
                      setActiveTab("orders");
                    }}
                    onCustomerUpdate={updateCustomer}
                    onCustomerDelete={deleteCustomer}
                  />
                )}
              </section>
            )}
          </>
        )
      )}

      {!isLoading && activeTab === "inventory" && (
        products.length === 0 ? <div className="admin-empty">Der er ingen produkter i lageret.</div> : (
          <>
            <div className="admin-filter-bar">
              <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Søg produkt, brand, SKU eller variant" />
              <select value={productStatusFilter} onChange={(event) => setProductStatusFilter(event.target.value)}>
                <option value="all">Alle produktstatusser</option>
                {productStatuses.map((status) => <option key={status} value={status}>{productStatusLabels[status]}</option>)}
              </select>
            </div>
            {filteredProducts.length === 0 ? <div className="admin-empty">Ingen produkter matcher filteret.</div> : (
              <section className="admin-grid">
                <div className="admin-orders-list">
                  {filteredProducts.map((product) => (
                    <button
                      className={`admin-order-card ${selectedProduct?.id === product.id ? "active" : ""}`}
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                    >
                      <span>{product.brand} · {product.category}</span>
                      <strong>{product.title}</strong>
                      <em>{product.sku || "Ingen SKU"} · {money(product.price)}</em>
                      <b>{productHasLowStock(product) ? `${productTotalStock(product)} på lager` : `${productTotalStock(product)} stk.`}</b>
                    </button>
                  ))}
                </div>
                {selectedProduct && (
                  <InventoryDetail
                    product={selectedProduct}
                    onProductUpdate={updateProduct}
                    onVariantUpdate={updateProductVariant}
                  />
                )}
              </section>
            )}
          </>
        )
      )}
    </main>
  );
}

function OrderDetail({
  order,
  paymentUrl,
  isCreatingPayment,
  onStatus,
  onPayment,
  onDelete
}: {
  order: AdminOrder;
  paymentUrl: string;
  isCreatingPayment: boolean;
  onStatus: (orderId: string, status: string) => void;
  onPayment: (orderId: string) => void;
  onDelete: (orderId: string) => void;
}) {
  return (
    <article className="admin-detail panel">
      <div className="admin-detail-head">
        <div>
          <span className="eyebrow">Ordre</span>
          <h2>{order.order_number}</h2>
          <p>{formatDate(order.created_at)}</p>
        </div>
        <select value={order.status} onChange={(event) => onStatus(order.id, event.target.value)}>
          {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
        </select>
      </div>
      <div className="admin-danger-row">
        <button className="btn danger" onClick={() => onDelete(order.id)}>Slet ordre</button>
      </div>

      <div className="admin-summary-row">
        <div><span>Total</span><strong>{money(order.total)}</strong></div>
        <div><span>Linjer</span><strong>{order.order_lines.length}</strong></div>
        <div><span>Status</span><strong>{statusLabels[order.status] || order.status}</strong></div>
      </div>

      <div className="admin-payment-box">
        <div>
          <span>Stripe</span>
          <strong>Betalingslink</strong>
          <p>Opret et Stripe Checkout-link, når fragt og ordre er godkendt.</p>
        </div>
        <button className="btn primary" disabled={isCreatingPayment} onClick={() => onPayment(order.id)}>
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
          <p><strong>{order.customer_name || "Ikke udfyldt"}</strong></p>
          <p>{orderContact(order)}</p>
          <p>{orderAddress(order.customer_address, order.customer_postcode, order.customer_city)}</p>
        </section>
        <section>
          <h3>Levering</h3>
          <p><strong>{order.delivery_method || "Ikke valgt"}</strong></p>
          <p>{order.recipient_name || "Ingen modtager"}</p>
          <p>{orderAddress(order.delivery_address, order.delivery_postcode, order.delivery_city)}</p>
          <p>{order.requested_delivery_date ? `Ønsket dato: ${order.requested_delivery_date}` : "Ingen ønsket dato"}</p>
        </section>
      </div>

      {order.delivery_note && (
        <div className="admin-note">
          <span>Leveringsnote</span>
          <p>{order.delivery_note}</p>
        </div>
      )}

      <h3 className="admin-section-title">Ordrelinjer</h3>
      <div className="admin-lines">
        {order.order_lines.map((line) => (
          <div className="admin-line" key={line.id}>
            <div>
              <strong>{line.title}</strong>
              <span>{line.note}</span>
            </div>
            <em>{money(line.total)}</em>
            {line.card_text && <p><b>Korttekst:</b> {line.card_text}</p>}
            {!!line.items?.length && (
              <ul>
                {line.items.map((item, index) => (
                  <li key={`${line.id}-${index}`}>
                    {item.title}{item.selectedVariant?.title ? ` · ${item.selectedVariant.title}` : ""}{item.brand ? ` · ${item.brand}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}

function CustomerDetail({
  customer,
  onOpenOrder,
  onCustomerUpdate,
  onCustomerDelete
}: {
  customer: Customer;
  onOpenOrder: (orderId: string) => void;
  onCustomerUpdate: (customer: Customer, update: { name: string; email: string; phone: string; address: string; postcode: string; city: string }) => void;
  onCustomerDelete: (customer: Customer) => void;
}) {
  const [form, setForm] = useState({
    name: customer.name === "Ukendt kunde" ? "" : customer.name,
    email: customer.email || "",
    phone: customer.phone || "",
    address: customer.address && customer.address !== "Ingen adresse" ? customer.address.split(", ")[0] || "" : "",
    postcode: customer.postcode || "",
    city: customer.city || ""
  });

  useEffect(() => {
    setForm({
      name: customer.name === "Ukendt kunde" ? "" : customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address && customer.address !== "Ingen adresse" ? customer.address.split(", ")[0] || "" : "",
      postcode: customer.postcode || "",
      city: customer.city || ""
    });
  }, [customer.key, customer.name, customer.email, customer.phone, customer.address, customer.postcode, customer.city]);

  return (
    <article className="admin-detail panel">
      <div className="admin-detail-head">
        <div>
          <span className="eyebrow">Kunde</span>
          <h2>{customer.name}</h2>
          <p>{customer.email || customer.phone || "Ingen kontaktoplysninger"}</p>
        </div>
      </div>

      <div className="admin-summary-row">
        <div><span>Ordrer</span><strong>{customer.orders.length}</strong></div>
        <div><span>Omsætning</span><strong>{money(customer.total)}</strong></div>
        <div><span>Seneste</span><strong>{formatDate(customer.latestOrder)}</strong></div>
      </div>

      <div className="admin-info-grid">
        <section>
          <h3>Kontakt</h3>
          <p>{customer.email || "Ingen e-mail"}</p>
          <p>{customer.phone || "Intet telefonnummer"}</p>
        </section>
        <section>
          <h3>Adresse</h3>
          <p>{customer.address || "Ingen adresse"}</p>
        </section>
      </div>

      <h3 className="admin-section-title">Rediger kunde</h3>
      <div className="admin-customer-form">
        <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Navn" />
        <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="E-mail" />
        <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Telefon" />
        <input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} placeholder="Adresse" />
        <input value={form.postcode} onChange={(event) => setForm((current) => ({ ...current, postcode: event.target.value }))} placeholder="Postnr." />
        <input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} placeholder="By" />
        <button className="btn primary" onClick={() => onCustomerUpdate(customer, form)}>Gem kunde</button>
        <button className="btn danger" onClick={() => onCustomerDelete(customer)}>Slet kunde</button>
      </div>

      <h3 className="admin-section-title">Kundens ordrer</h3>
      <div className="admin-lines">
        {customer.orders.map((order) => (
          <button className="admin-line admin-line-button" key={order.id} onClick={() => onOpenOrder(order.id)}>
            <div>
              <strong>{order.order_number}</strong>
              <span>{formatDate(order.created_at)} · {statusLabels[order.status] || order.status}</span>
            </div>
            <em>{money(order.total)}</em>
          </button>
        ))}
      </div>
    </article>
  );
}

function InventoryDetail({
  product,
  onProductUpdate,
  onVariantUpdate
}: {
  product: AdminProduct;
  onProductUpdate: (productId: string, update: { stock?: number; price?: number; cost?: number; status?: string; variants?: AdminVariant[] }) => void;
  onVariantUpdate: (product: AdminProduct, variantId: string, update: Partial<AdminVariant>) => void;
}) {
  const lowVariantCount = (product.variants || []).filter((variant) => variant.status !== "archived" && variant.stock <= 2).length;

  return (
    <article className="admin-detail panel">
      <div className="admin-detail-head">
        <div>
          <span className="eyebrow">Lager</span>
          <h2>{product.title}</h2>
          <p>{product.brand} · {product.category}</p>
        </div>
        <select value={product.status} onChange={(event) => onProductUpdate(product.id, { status: event.target.value })}>
          {productStatuses.map((status) => <option key={status} value={status}>{productStatusLabels[status]}</option>)}
        </select>
      </div>

      <div className="admin-summary-row">
        <div><span>Samlet lager</span><strong>{productTotalStock(product)}</strong></div>
        <div><span>Pris</span><strong>{money(product.price)}</strong></div>
        <div><span>Kost</span><strong>{money(product.cost)}</strong></div>
      </div>

      <div className="admin-inventory-controls">
        <button className="btn" onClick={() => onProductUpdate(product.id, { stock: Math.max(0, product.stock - 1) })}>-1</button>
        <input min="0" type="number" value={product.stock} onChange={(event) => onProductUpdate(product.id, { stock: Math.max(0, Number(event.target.value) || 0) })} />
        <button className="btn" onClick={() => onProductUpdate(product.id, { stock: product.stock + 1 })}>+1</button>
      </div>

      <div className="admin-price-controls">
        <label>
          <span>Salgspris</span>
          <input min="0" step="0.01" type="number" value={Number(product.price) || 0} onChange={(event) => onProductUpdate(product.id, { price: Math.max(0, Number(event.target.value) || 0) })} />
        </label>
        <label>
          <span>Kostpris</span>
          <input min="0" step="0.01" type="number" value={Number(product.cost) || 0} onChange={(event) => onProductUpdate(product.id, { cost: Math.max(0, Number(event.target.value) || 0) })} />
        </label>
      </div>

      {!!product.variants?.length && (
        <div className="admin-variant-list">
          <strong>Variantlager</strong>
          {product.variants.map((variant) => (
            <div className="admin-variant-row" key={variant.id}>
              <div>
                <span>{variant.title}</span>
                <em>{variant.sku || "Ingen SKU"} · {money(variant.price)}</em>
              </div>
              <button className="btn" onClick={() => onVariantUpdate(product, variant.id, { stock: Math.max(0, variant.stock - 1) })}>-1</button>
              <input min="0" type="number" value={variant.stock} onChange={(event) => onVariantUpdate(product, variant.id, { stock: Math.max(0, Number(event.target.value) || 0) })} />
              <button className="btn" onClick={() => onVariantUpdate(product, variant.id, { stock: variant.stock + 1 })}>+1</button>
              <label className="admin-variant-price">
                <span>Variantpris</span>
                <input min="0" step="0.01" type="number" value={Number(variant.price) || 0} onChange={(event) => onVariantUpdate(product, variant.id, { price: Math.max(0, Number(event.target.value) || 0) })} />
              </label>
            </div>
          ))}
        </div>
      )}

      <div className="admin-info-grid">
        <section>
          <h3>Produktdata</h3>
          <p>SKU: {product.sku || "Ingen SKU"}</p>
          <p>Status: {productStatusLabels[product.status] || product.status}</p>
          <p>Gaveæske-egnet: {product.giftbox_eligible ? "Ja" : "Nej"}</p>
        </section>
        <section>
          <h3>Lageralarm</h3>
          <p>{productHasLowStock(product) ? `Lav lagerbeholdning${lowVariantCount ? ` på ${lowVariantCount} variant${lowVariantCount === 1 ? "" : "er"}` : ""}. Overvej genbestilling.` : "Lagerbeholdningen ser fin ud."}</p>
        </section>
      </div>
    </article>
  );
}
