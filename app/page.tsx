"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { giftboxes as initialGiftboxes, initialProducts, productSpecs, type Giftbox, type Product } from "@/lib/data";

const boxPrice = 49;
const deliveryShippingPrice = 49;
const cartStorageKey = "greenplanet-cart";
const orderStorageKey = "greenplanet-orders";
const companyInfo = {
  name: "Greenplanet",
  cvr: "44640376",
  address: "Bøgevejen 6",
  postcode: "2850",
  city: "Nærum",
  email: "hello@greenplanet.dk"
};
const publicViews = ["home", "giftboxes", "products", "builder", "orders", "confirmation", "contact", "delivery", "returns", "legal", "terms", "privacy", "cookies"] as const;

type PolicyView = "contact" | "delivery" | "returns" | "legal" | "terms" | "privacy" | "cookies";
type View = "home" | "giftboxes" | "products" | "builder" | "import" | "orders" | "product" | "confirmation" | PolicyView;
type CartLine = {
  id: string;
  title: string;
  note: string;
  cardText: string;
  items: Product[];
  total: number;
};

type SavedOrder = {
  id: string;
  createdAt: string;
  lines: CartLine[];
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    postcode: string;
    city: string;
  };
  delivery: {
    method: string;
    recipientName: string;
    address: string;
    postcode: string;
    city: string;
    requestedDate: string;
    note: string;
  };
};

type PolicyPage = { eyebrow: string; title: string; intro: string; sections: { title: string; body: string }[] };
type SupabaseProductRow = {
  legacy_id: string | null;
  slug: string;
  title: string;
  brand: string;
  category: string;
  description: string;
  cost: number | string;
  price: number | string;
  stock: number;
  sku: string | null;
  image_url: string | null;
  giftbox_eligible: boolean;
  occasions: string[] | null;
  shape: Product["shape"];
  status: string;
};
type SupabaseGiftboxRow = {
  legacy_id: string | null;
  slug: string;
  title: string;
  category: string;
  description: string;
  note: string | null;
  recipient: string | null;
  occasion: string | null;
  packing: string | null;
  card_text: string | null;
  delivery: string | null;
  why: string | null;
  details: string[] | null;
};
type SupabaseGiftboxLinkRow = {
  sort_order: number;
  giftboxes: { legacy_id: string | null } | null;
  products: { legacy_id: string | null } | null;
};
type SupabasePageRow = {
  slug: PolicyView;
  title: string;
  eyebrow: string | null;
  intro: string | null;
  sections: { title: string; body: string }[] | null;
};

function money(value: number) {
  return `${Math.round(value)} kr.`;
}

function margin(product: Product) {
  return product.price ? Math.round(((product.price - product.cost) / product.price) * 100) : 0;
}

function inferCategory(brand: string, title: string) {
  const text = `${brand} ${title}`.toLowerCase();
  if (/baby|rabbit|towel|babynest|sleeper|sokind|belly/.test(text)) return "Baby & barsel";
  if (/klei|olie|rozenwater|ghassoul|argan|hennep|bentoniet/.test(text)) return "Naturlig beauty";
  if (/legging|bra|jacket|sweat|shorts|athletics/.test(text)) return "Activewear";
  return "Livsstil";
}

function parsePrice(value: unknown) {
  if (typeof value === "number") return value;
  const normalized = String(value ?? "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return Number.parseFloat(normalized) || 0;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""])));
}

async function supabaseGet<T>(path: string): Promise<T> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase mangler env");

  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`
    }
  });

  if (!response.ok) throw new Error(`Supabase svarede ${response.status}`);
  return response.json() as Promise<T>;
}

function fromSupabaseProduct(row: SupabaseProductRow): Product {
  return {
    id: row.legacy_id || row.slug,
    title: row.title,
    brand: row.brand,
    category: row.category,
    tags: [],
    description: row.description,
    cost: Number(row.cost) || 0,
    price: Number(row.price) || 0,
    stock: row.stock || 0,
    sku: row.sku || "",
    image: row.image_url || "",
    giftbox: row.giftbox_eligible,
    occasions: row.occasions || [],
    shape: row.shape || "box",
    status: row.status === "live" ? "Live" : "Kladde"
  };
}

function ProductShape({ shape }: { shape: Product["shape"] }) {
  return <span className={`shape ${shape === "bottle" ? "" : shape}`} />;
}

function ProductVisual({ product }: { product: Product }) {
  if (product.image) {
    return (
      <img
        className="product-image"
        src={product.image}
        alt={product.title}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return <ProductShape shape={product.shape} />;
}

function GreenplanetLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`logo-lockup ${compact ? "compact" : ""}`} aria-label="Greenplanet">
      <img
        className="brand-logo"
        src={compact ? "/brand/greenplanet-logo-black-crop.png" : "/brand/greenplanet-logo-white-crop.png"}
        alt="Greenplanet"
      />
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [giftboxCatalog, setGiftboxCatalog] = useState<Giftbox[]>(initialGiftboxes);
  const [policyCatalog, setPolicyCatalog] = useState<Record<PolicyView, PolicyPage>>(defaultPolicyPages);
  const [selected, setSelected] = useState<string[]>(["p3", "p4", "p6"]);
  const [category, setCategory] = useState("Alle");
  const [occasion, setOccasion] = useState("Alle");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [csvText, setCsvText] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPostcode, setCustomerPostcode] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientPostcode, setRecipientPostcode] = useState("");
  const [recipientCity, setRecipientCity] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("Send direkte til modtager");
  const [useCustomerAddressForDelivery, setUseCustomerAddressForDelivery] = useState(true);
  const [shipping, setShipping] = useState("");
  const [message, setMessage] = useState("");
  const [lastOrder, setLastOrder] = useState<SavedOrder | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const categories = useMemo(() => ["Alle", ...Array.from(new Set(products.map((product) => product.category)))], [products]);
  const occasions = useMemo(
    () => ["Alle", ...Array.from(new Set(products.flatMap((product) => product.occasions)))],
    [products]
  );
  const eligibleProducts = products.filter((product) => product.giftbox && product.status === "Live");
  const filteredProducts = category === "Alle" ? products : products.filter((product) => product.category === category);
  const selectedProduct = products.find((product) => product.id === selectedProductId) || null;
  const selectedProductSpecs = selectedProduct ? productSpecs(selectedProduct) : [];
  const filteredBuilderProducts =
    occasion === "Alle" ? eligibleProducts : eligibleProducts.filter((product) => product.occasions.includes(occasion));
  const selectedProducts = selected.map((id) => products.find((product) => product.id === id)).filter(Boolean) as Product[];
  const cartTotal = cart.reduce((sum, line) => sum + line.total, 0);
  const cartProductsTotal = cart.reduce((sum, line) => sum + line.items.reduce((itemSum, item) => itemSum + item.price, 0), 0);
  const cartPackagingTotal = Math.max(0, cartTotal - cartProductsTotal);
  const cartProductCount = cart.reduce((sum, line) => sum + line.items.length, 0);
  const cardTextCount = cart.filter((line) => line.cardText?.trim()).length;
  const isDirectDelivery = deliveryMethod === "Send direkte til modtager";
  const isPickup = deliveryMethod === "Afhentes / aftales";
  const shippingFee = isPickup || cart.length === 0 ? 0 : deliveryShippingPrice;
  const checkoutTotal = cartTotal + shippingFee;
  const shippingLabel = isPickup ? "0 kr." : money(shippingFee);
  const useBillingAsDelivery = deliveryMethod === "Send til mig" && useCustomerAddressForDelivery;
  const deliveryNameLabel = isDirectDelivery ? "Modtagers navn" : "Dit navn";
  const deliveryAddressLabel = isDirectDelivery ? "Modtagers adresse" : "Din adresse";
  const deliverySummaryLabel = isDirectDelivery ? "Modtager" : isPickup ? "Kontaktperson" : "Leveres til";
  const effectiveDeliveryName = useBillingAsDelivery ? customerName : recipientName;
  const effectiveDeliveryAddress = useBillingAsDelivery ? customerAddress : recipientAddress;
  const effectiveDeliveryPostcode = useBillingAsDelivery ? customerPostcode : recipientPostcode;
  const effectiveDeliveryCity = useBillingAsDelivery ? customerCity : recipientCity;
  const [heroIndex, setHeroIndex] = useState(0);
  const averageMargin = products.length
    ? Math.round(products.reduce((sum, product) => sum + margin(product), 0) / products.length)
    : 0;
  const currentPolicy = view in policyCatalog ? policyCatalog[view as PolicyView] : null;
  const heroSlides = [
    {
      title: "Baby First Care",
      text: "Blid babypleje, økologisk tekstil og en lille gave, der føles gennemtænkt.",
      productIds: ["p3", "p5", "p6"]
    },
    {
      title: "Ny Mor Ro",
      text: "Wellness til graviditet og barsel med naturlige olier, rosenvand og små pauser.",
      productIds: ["p4", "p13", "p15"]
    },
    {
      title: "Premium Barsel",
      text: "En større barselsgave med Babyly, SoKind og Summerville organic.",
      productIds: ["p1", "p3", "p10"]
    }
  ];
  const activeHeroSlide = heroSlides[heroIndex];
  const heroSlideCount = heroSlides.length;
  const activeHeroProducts = activeHeroSlide.productIds
    .map((id) => products.find((item) => item.id === id))
    .filter(Boolean) as Product[];

  useEffect(() => {
    const storedCart = window.localStorage.getItem(cartStorageKey);
    if (!storedCart) return;

    try {
      const parsed = JSON.parse(storedCart) as CartLine[];
      if (Array.isArray(parsed)) setCart(parsed);
    } catch {
      window.localStorage.removeItem(cartStorageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    let cancelled = false;

    async function loadSupabaseData() {
      try {
        const [productRows, giftboxRows, linkRows, pageRows] = await Promise.all([
          supabaseGet<SupabaseProductRow[]>(
            "products?select=legacy_id,slug,title,brand,category,description,cost,price,stock,sku,image_url,giftbox_eligible,occasions,shape,status&status=eq.live&order=legacy_id.asc"
          ),
          supabaseGet<SupabaseGiftboxRow[]>(
            "giftboxes?select=legacy_id,slug,title,category,description,note,recipient,occasion,packing,card_text,delivery,why,details&status=eq.live&order=legacy_id.asc"
          ),
          supabaseGet<SupabaseGiftboxLinkRow[]>(
            "giftbox_products?select=sort_order,giftboxes(legacy_id),products(legacy_id)&order=sort_order.asc"
          ),
          supabaseGet<SupabasePageRow[]>("pages?select=slug,title,eyebrow,intro,sections")
        ]);

        if (cancelled) return;

        const loadedProducts = productRows.map(fromSupabaseProduct);
        const productIdsByGiftbox = linkRows.reduce<Record<string, string[]>>((groups, link) => {
          const giftboxId = link.giftboxes?.legacy_id;
          const productId = link.products?.legacy_id;
          if (!giftboxId || !productId) return groups;
          return { ...groups, [giftboxId]: [...(groups[giftboxId] || []), productId] };
        }, {});

        const loadedGiftboxes = giftboxRows.map((row) => ({
          id: row.legacy_id || row.slug,
          title: row.title,
          category: row.category,
          description: row.description,
          productIds: productIdsByGiftbox[row.legacy_id || row.slug] || [],
          note: row.note || "",
          recipient: row.recipient || "",
          occasion: row.occasion || "",
          packing: row.packing || "",
          cardText: row.card_text || "",
          delivery: row.delivery || "",
          why: row.why || "",
          details: row.details || []
        }));

        const loadedPolicies = pageRows.reduce<Record<PolicyView, PolicyPage>>((pages, row) => {
          if (!publicViews.includes(row.slug)) return pages;
          return {
            ...pages,
            [row.slug]: {
              eyebrow: row.eyebrow || pages[row.slug]?.eyebrow || "Info",
              title: row.title,
              intro: row.intro || "",
              sections: row.sections || []
            }
          };
        }, defaultPolicyPages);

        if (loadedProducts.length) setProducts(loadedProducts);
        if (loadedGiftboxes.length) setGiftboxCatalog(loadedGiftboxes);
        setPolicyCatalog(loadedPolicies);
      } catch (error) {
        console.warn("Kunne ikke hente Supabase-data, bruger lokal fallback.", error);
      }
    }

    loadSupabaseData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (view !== "home") return;
    const interval = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroSlideCount);
    }, 5500);
    return () => window.clearInterval(interval);
  }, [heroSlideCount, view]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const orderNumber = params.get("order");
    if (!payment) return;

    if (payment === "success") {
      const storedOrders = window.localStorage.getItem(orderStorageKey);
      let matchingOrder: SavedOrder | null = null;

      try {
        const parsed = storedOrders ? JSON.parse(storedOrders) as SavedOrder[] : [];
        matchingOrder = Array.isArray(parsed) ? parsed.find((order) => order.id === orderNumber) || null : null;
      } catch {
        matchingOrder = null;
      }

      if (matchingOrder) {
        setLastOrder(matchingOrder);
      } else if (orderNumber) {
        setLastOrder({
          id: orderNumber,
          createdAt: new Date().toISOString(),
          lines: [],
          total: 0,
          customer: { name: "", email: "", phone: "", address: "", postcode: "", city: "" },
          delivery: { method: "", recipientName: "", address: "", postcode: "", city: "", requestedDate: "", note: "" }
        });
      }

      resetCheckout();
      setView("confirmation");
      window.history.replaceState({}, "", "/");
    }

    if (payment === "cancelled") {
      setView("orders");
      window.history.replaceState({}, "", "/#orders");
    }
  }, []);

  useEffect(() => {
    function applyHash() {
      const hash = window.location.hash.replace("#", "");
      if (publicViews.includes(hash as (typeof publicViews)[number])) {
        setView(hash as View);
      }
    }

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  function giftboxProducts(giftbox: Giftbox) {
    return giftbox.productIds.map((id) => products.find((product) => product.id === id)).filter(Boolean) as Product[];
  }

  function giftboxTotal(giftbox: Giftbox) {
    return giftboxProducts(giftbox).reduce((sum, product) => sum + product.price, 0) + boxPrice;
  }

  function addGiftboxToCart(giftbox: Giftbox) {
    const items = giftboxProducts(giftbox);
    setCart((current) => [
      ...current,
      {
          id: `cart-${Date.now()}-${giftbox.id}`,
          title: giftbox.title,
          note: giftbox.note,
          cardText: "",
          items,
          total: giftboxTotal(giftbox)
      }
    ]);
    setView("orders");
  }

  function addCustomGiftboxToCart() {
    const total = selectedProducts.reduce((sum, product) => sum + product.price, 0) + boxPrice;
    setCart((current) => [
      ...current,
        {
          id: `cart-${Date.now()}-custom`,
          title: "Byg-selv gaveæske",
          note: message,
          cardText: message,
          items: selectedProducts,
          total
      }
    ]);
    setMessage("");
    setView("orders");
  }

  function addProductToCart(product: Product) {
    setCart((current) => [
      ...current,
        {
          id: `cart-${Date.now()}-${product.id}`,
          title: product.title,
          note: product.brand,
          cardText: "",
          items: [product],
          total: product.price
      }
    ]);
  }

  function updateCartCardText(id: string, cardText: string) {
    setCart((current) => current.map((line) => line.id === id ? { ...line, cardText } : line));
  }

  function resetCheckout() {
    setCart([]);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerPostcode("");
    setCustomerCity("");
    setRecipientName("");
    setRecipientAddress("");
    setRecipientPostcode("");
    setRecipientCity("");
    setDeliveryDate("");
    setDeliveryMethod("Send direkte til modtager");
    setUseCustomerAddressForDelivery(true);
    setShipping("");
  }

  async function submitOrder() {
    if (!cart.length) return;

    const shippingLine: CartLine | null = shippingFee > 0 ? {
      id: `shipping-${Date.now()}`,
      title: "Fragt",
      note: deliveryMethod,
      cardText: "",
      items: [],
      total: shippingFee
    } : null;
    const orderLines = shippingLine ? [...cart, shippingLine] : cart;

    const orderPayload = {
      lines: orderLines,
      total: checkoutTotal,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
        postcode: customerPostcode,
        city: customerCity
      },
      delivery: {
        method: deliveryMethod,
        recipientName: effectiveDeliveryName,
        address: effectiveDeliveryAddress,
        postcode: effectiveDeliveryPostcode,
        city: effectiveDeliveryCity,
        requestedDate: deliveryDate,
        note: shipping
      }
    };

    let orderId = `GP-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const saved = await response.json() as { orderNumber?: string; url?: string };
        if (saved.orderNumber) orderId = saved.orderNumber;

        const order: SavedOrder = {
          id: orderId,
          createdAt: new Date().toISOString(),
          ...orderPayload
        };

        const storedOrders = window.localStorage.getItem(orderStorageKey);
        let orders: SavedOrder[] = [];

        try {
          const parsed = storedOrders ? JSON.parse(storedOrders) : [];
          orders = Array.isArray(parsed) ? parsed : [];
        } catch {
          orders = [];
        }

        window.localStorage.setItem(orderStorageKey, JSON.stringify([order, ...orders]));

        if (saved.url) {
          window.location.href = saved.url;
          return;
        }

        window.alert("Betaling kunne ikke startes. Prøv igen eller kontakt Greenplanet.");
        return;
      } else {
        const details = await response.json().catch(() => ({ error: "Betaling kunne ikke startes" })) as { error?: string };
        window.alert(details.error || "Betaling kunne ikke startes. Prøv igen eller kontakt Greenplanet.");
        return;
      }
    } catch (error) {
      console.warn("Betaling kunne ikke startes.", error);
      window.alert("Betaling kunne ikke startes. Prøv igen eller kontakt Greenplanet.");
      return;
    }
  }

  function importRows() {
    const rows = parseCsv(csvText);
    const imported = rows.map((row, index) => {
      const brand = row.brand || row.Brandnavn || row.Brand || "Ukendt brand";
      const title = row.title || row.Produktnavn || row.Product || row.name || "Unavngivet produkt";
      const inferredCategory = inferCategory(brand, title);
      return {
        id: `import-${Date.now()}-${index}`,
        title,
        brand,
        category: row.category || row.Category || inferredCategory,
        tags: String(row.tags || "").split(";").filter(Boolean),
        description: row.short_description || row.Produktbeskrivelse || row.description || "Importer produkttekst og rediger senere.",
        cost: parsePrice(row.cost_price || row.wholesale_price || row.Engrospris || row.cost),
        price: parsePrice(row.retail_price || row.Udsalgspris || row.price),
        stock: Number(row.stock || row.Antal || 0),
        sku: row.sku || row.SKU || "",
        image: row.image_urls || row["Billed-URL"] || row.image || "",
        giftbox: String(row.giftbox_eligible || (inferredCategory === "Activewear" ? "no" : "yes")).toLowerCase() !== "no",
        occasions: String(
          row.occasions ||
            (inferredCategory === "Baby & barsel"
              ? "Barsel;Baby gave"
              : inferredCategory === "Naturlig beauty"
                ? "Wellness;Rolig weekend"
                : "Gave")
        )
          .split(";")
          .map((item) => item.trim())
          .filter(Boolean),
        shape: (["jar", "box", "pouch", "bottle"] as Product["shape"][])[index % 4],
        status: "Kladde" as const
      };
    });
    setProducts((current) => [...imported, ...current]);
    setCsvText("");
    setView("products");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><GreenplanetLogo /></div>
        <nav className="nav">
          {[
            ["home", "Forside", "01"],
            ["giftboxes", "Gaveæsker", String(giftboxCatalog.length)],
            ["products", "Produkter", String(products.length)],
            ["builder", "Byg selv", String(selected.length)],
            ["orders", "Kurv", String(cart.length)]
          ].map(([id, label, count]) => (
            <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id as View)}>
              {label}<span>{count}</span>
            </button>
          ))}
        </nav>
        <p className="side-note">Naturlige barselsgaver, babygaver og wellnessgaver fra små brands.</p>
      </aside>

      <section className="main">
        <header className="topbar">
          <div className="topbar-title">
            <h1>{view === "product" ? selectedProduct?.title || "Produkt" : viewTitles[view]}</h1>
          </div>
          <button className="cart-pill" onClick={() => setView("orders")}>
            Kurv · {cart.length} · {money(checkoutTotal)}
          </button>
        </header>

        <div className="content">
          {view === "home" && (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <span className="eyebrow">Gaveæsker til baby, barsel og ny mor</span>
                  <h2 className="big-title">Gaver til baby og barsel.</h2>
                  <p className="lead">
                    Smukke gaveæsker til nye familier, nybagte mødre og de første små øjeblikke. Håndplukket fra små brands
                    og pakket pænt, så gaven kan sendes direkte til den, du vil glæde.
                  </p>
                  <div className="actions">
                    <button className="btn primary" onClick={() => setView("giftboxes")}>Find en gaveæske</button>
                    <button className="btn" onClick={() => setView("builder")}>Byg din egen</button>
                    <button className="btn" onClick={() => setView("products")}>Se produkter</button>
                  </div>
                </div>
                <div className="hero-art">
                  <div className="hero-slider">
                    <div className="hero-featured-product">
                      {activeHeroProducts[0] && <ProductVisual product={activeHeroProducts[0]} />}
                    </div>
                    <div className="hero-product-stack">
                      {activeHeroProducts.slice(1).map((product) => (
                        <div className="hero-product-thumb" key={product.id}>
                          <ProductVisual product={product} />
                        </div>
                      ))}
                    </div>
                    <div className="hero-slide-copy">
                      <em>Udvalgt gaveæske {heroIndex + 1}/{heroSlideCount}</em>
                      <span>{activeHeroSlide.title}</span>
                      <strong>{activeHeroSlide.text}</strong>
                    </div>
                    <div className="hero-arrows" aria-label="Hero navigation">
                      <button
                        aria-label="Forrige slide"
                        onClick={() => setHeroIndex((current) => (current - 1 + heroSlideCount) % heroSlideCount)}
                      >
                        ‹
                      </button>
                      <button
                        aria-label="Næste slide"
                        onClick={() => setHeroIndex((current) => (current + 1) % heroSlideCount)}
                      >
                        ›
                      </button>
                    </div>
                    <div className="hero-dots" aria-label="Hero slider">
                      {heroSlides.map((slide, index) => (
                        <button
                          key={slide.title}
                          className={heroIndex === index ? "active" : ""}
                          aria-label={`Vis ${slide.title}`}
                          onClick={() => setHeroIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
              <section className="stats">
                <button className="stat" onClick={() => { setCategory("Baby & barsel"); setView("products"); }}>
                  <strong>Baby</strong><span>Blide produkter til den første tid</span>
                </button>
                <button className="stat" onClick={() => setView("giftboxes")}>
                  <strong>Barsel</strong><span>Gaver til nye familier og nybagte mødre</span>
                </button>
                <button className="stat" onClick={() => { setCategory("Naturlig beauty"); setView("products"); }}>
                  <strong>Wellness</strong><span>Naturlige olier, ler og hudpleje</span>
                </button>
                <button className="stat" onClick={() => setView("giftboxes")}>
                  <strong>{giftboxCatalog.length}</strong><span>kuraterede gaveæsker</span>
                </button>
              </section>
            </>
          )}

          {view === "giftboxes" && (
            <section>
              <div className="section-head"><h2>Gaveæsker</h2><p>Købsklare gaver til baby, barsel og små øjeblikke med ekstra omsorg.</p></div>
              <div className="grid">
                {giftboxCatalog.map((giftbox) => {
                  const items = giftboxProducts(giftbox);
                  return (
                    <article className="card giftbox-card" key={giftbox.id}>
                      <div className="product-visual mini-row">
                        {items.slice(0, 4).map((product, index) => (
                          <div className="selected-mini image-mini" key={product.id} style={{ background: ["#dfeade", "#f1d9d3", "#ead9ad", "#d7d5ea"][index] }}>
                            {product.image ? <img src={product.image} alt={product.title} loading="lazy" /> : product.brand.split(" ")[0]}
                          </div>
                        ))}
                      </div>
                      <div className="card-body">
                        <div className="meta">{giftbox.category} · {items.length} produkter</div>
                        <h3>{giftbox.title}</h3>
                        <p>{giftbox.description}</p>
                        <p><strong>Indhold:</strong> {items.map((item) => item.title).join(", ")}</p>
                        <div className="buy-row">
                          <span className="price">{money(giftboxTotal(giftbox))}</span>
                          <div className="card-actions">
                            <Link className="btn" href={`/giftboxes/${giftbox.id}`}>Se gaveæsken</Link>
                            <button className="btn primary" onClick={() => addGiftboxToCart(giftbox)}>Læg i kurv</button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {view === "products" && (
            <section>
              <div className="section-head">
                <h2>Produkter</h2>
                <div className="filters">
                  {categories.map((item) => <button className={`chip ${category === item ? "active" : ""}`} key={item} onClick={() => setCategory(item)}>{item}</button>)}
                </div>
              </div>
              <div className="grid">
                {filteredProducts.map((product) => (
                  <article className="card" key={product.id}>
                    <div className="product-visual"><ProductVisual product={product} /></div>
                    <div className="card-body">
                      <div className="meta">{product.brand} · {product.category}</div>
                      <h3>{product.title}</h3>
                      <p>{product.description}</p>
                      <div className="buy-row">
                        <span className="price">{money(product.price)}</span>
                        <div className="card-actions">
                          <Link className="btn" href={`/products/${product.id}`}>Se detaljer</Link>
                          <button className="icon-add" onClick={() => addProductToCart(product)}>+</button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {view === "product" && selectedProduct && (
            <section className="product-detail">
              <button className="btn back-btn" onClick={() => setView("products")}>Tilbage til produkter</button>
              <div className="product-detail-media panel">
                <ProductVisual product={selectedProduct} />
              </div>
              <div className="product-detail-info panel">
                <div className="meta">{selectedProduct.brand} · {selectedProduct.category}</div>
                <h2>{selectedProduct.title}</h2>
                <p className="lead">{selectedProduct.description}</p>
                <div className="detail-price">{money(selectedProduct.price)}</div>
                <h3 className="spec-title">Produkt egenskaber</h3>
                <div className="detail-list">
                  {selectedProductSpecs.map((spec) => (
                    <div key={spec.label}><span>{spec.label}</span><strong>{spec.value}</strong></div>
                  ))}
                </div>
                <div className="tag-row">
                  {selectedProduct.occasions.map((item) => <span key={item}>{item}</span>)}
                </div>
                <div className="actions">
                  <button className="btn primary" onClick={() => addProductToCart(selectedProduct)}>Læg i kurv</button>
                  {selectedProduct.giftbox && <button className="btn" onClick={() => {
                    setSelected((current) => current.includes(selectedProduct.id) ? current : [...current, selectedProduct.id].slice(0, 6));
                    setView("builder");
                  }}>Brug i byg-selv</button>}
                </div>
              </div>
            </section>
          )}

          {view === "builder" && (
            <section>
              <div className="section-head">
                <h2>Byg selv</h2>
                <div className="filters">
                  {occasions.map((item) => <button className={`chip ${occasion === item ? "active" : ""}`} key={item} onClick={() => setOccasion(item)}>{item}</button>)}
                </div>
              </div>
              <div className="builder">
                <aside className="panel sticky">
                  <div className="box-preview">
                    <div className="selected-items">
                      {selectedProducts.length ? selectedProducts.map((product) => (
                        <div className="selected-mini image-mini builder-mini" key={product.id} title={product.title}>
                          {product.image ? <img alt={product.title} src={product.image} /> : <span>{product.brand.split(" ")[0]}</span>}
                        </div>
                      )) : (
                        <div className="builder-empty-preview">
                          <strong>Vælg produkter</strong>
                          <span>De vises her i gaveæsken</span>
                        </div>
                      )}
                    </div>
                    <div className="paper" /><div className="crate" />
                  </div>
                  <div className="summary">
                    <div className="builder-selected-list">
                      <strong>Valgt til gaveæsken</strong>
                      {selectedProducts.length ? selectedProducts.map((product) => (
                        <div className="builder-selected-product" key={product.id}>
                          <div className="builder-selected-thumb">
                            {product.image ? <img alt={product.title} src={product.image} /> : <span>{product.brand.slice(0, 1)}</span>}
                          </div>
                          <div>
                            <span>{product.brand}</span>
                            <b>{product.title}</b>
                          </div>
                          <em>{money(product.price)}</em>
                          <button
                            aria-label={`Fjern ${product.title}`}
                            onClick={() => setSelected((current) => current.filter((id) => id !== product.id))}
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      )) : (
                        <p>Vælg op til 6 produkter fra listen.</p>
                      )}
                    </div>
                    <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Korttekst..." />
                    <div className="builder-price-breakdown">
                      <strong>Prisopdeling</strong>
                      {selectedProducts.map((product) => (
                        <div key={product.id}><span>{product.title}</span><em>{money(product.price)}</em></div>
                      ))}
                      {!selectedProducts.length && <p>Vælg produkter for at se prisen.</p>}
                      <div><span>Gaveæske og kort</span><em>{money(boxPrice)}</em></div>
                      <div className="total"><span>Total gaveæske</span><em>{money(selectedProducts.reduce((sum, product) => sum + product.price, 0) + boxPrice)}</em></div>
                    </div>
                    <button className="btn primary" onClick={addCustomGiftboxToCart}>Læg i kurv</button>
                  </div>
                </aside>
                <div className="grid">
                  {filteredBuilderProducts.map((product) => (
                    <article className="card" key={product.id}>
                      <div className="product-visual"><ProductVisual product={product} /></div>
                      <div className="card-body">
                        <div className="meta">{product.brand}</div>
                        <h3>{product.title}</h3>
                        <p>{product.description}</p>
                        <div className="buy-row">
                          <span className="price">{money(product.price)}</span>
                          <button
                            className={`btn ${selected.includes(product.id) ? "primary" : ""}`}
                            onClick={() => setSelected((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id].slice(0, 6))}
                          >
                            {selected.includes(product.id) ? "Valgt" : "Vælg"}
                          </button>
                        </div>
                        <Link className="btn detail-link" href={`/products/${product.id}`}>Se detaljer</Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {view === "import" && (
            <section className="split">
              <div className="panel">
                <h2>Faire-import</h2>
                <textarea value={csvText} onChange={(event) => setCsvText(event.target.value)} placeholder="Indsæt CSV fra Faire..." />
                <button className="btn primary" onClick={importRows}>Importer som kladder</button>
              </div>
              <div className="panel">
                <h3>Admin-flow</h3>
                <p>Importerede varer bliver kladder, så du kan rette tekst, pris og gaveegnethed, før de vises i shoppen.</p>
              </div>
            </section>
          )}

          {view === "orders" && (
            <section className="split">
              <div className="panel">
                <div className="checkout-head">
                  <div>
                    <span className="eyebrow">Checkout</span>
                    <h2>Kurv og bestilling</h2>
                  </div>
                  <span className="checkout-count">{cart.length} gave{cart.length === 1 ? "" : "r"}</span>
                </div>
                {cart.length ? cart.map((line) => (
                  <div className="cart-line" key={line.id}>
                    <div className="summary-row line">
                      <span>{line.title}<small>{line.items.length} produkt{line.items.length === 1 ? "" : "er"}</small></span>
                      <strong>{money(line.total)} <button className="chip" onClick={() => setCart((current) => current.filter((item) => item.id !== line.id))}>Fjern</button></strong>
                    </div>
                    <div className="cart-products">
                      {line.items.map((item) => <span key={`${line.id}-${item.id}`}>{item.brand}: {item.title}</span>)}
                    </div>
                    <div className="cart-breakdown">
                      {line.items.map((item) => (
                        <div key={`${line.id}-price-${item.id}`}>
                          <span>{item.title}</span>
                          <strong>{money(item.price)}</strong>
                        </div>
                      ))}
                      {line.items.length > 0 && (
                        <div>
                          <span>Gaveæske/kasse og kort</span>
                          <strong>{money(Math.max(0, line.total - line.items.reduce((sum, item) => sum + item.price, 0)))}</strong>
                        </div>
                      )}
                    </div>
                    <label className="cart-card-text">
                      <span>Korttekst til denne gave</span>
                      <textarea
                        value={line.cardText || ""}
                        onChange={(event) => updateCartCardText(line.id, event.target.value)}
                        placeholder="Skriv en personlig hilsen, fx Kære Maja, stort tillykke med den lille..."
                      />
                    </label>
                  </div>
                )) : <div className="empty">Kurven er tom.</div>}
                <div className="checkout-totals">
                  <div><span>Produkter</span><strong>{money(cartProductsTotal)}</strong></div>
                  <div><span>Gaveæske/kasse og kort</span><strong>{money(cartPackagingTotal)}</strong></div>
                  <div><span>Subtotal</span><strong>{money(cartTotal)}</strong></div>
                  <div><span>Fragt</span><strong>{shippingLabel}</strong></div>
                  <div className="checkout-total-row"><span>Total inkl. fragt</span><strong>{money(checkoutTotal)}</strong></div>
                </div>
                <div className="checkout-section">
                  <h3><span>1</span> Bestiller og fakturaadresse</h3>
                  <div className="form-grid">
                    <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Navn eller firma" />
                    <input value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="E-mail" />
                    <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="Telefon" />
                    <input className="wide-field" value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} placeholder="Bestillers adresse" />
                    <input value={customerPostcode} onChange={(event) => setCustomerPostcode(event.target.value)} placeholder="Postnr." />
                    <input value={customerCity} onChange={(event) => setCustomerCity(event.target.value)} placeholder="By" />
                  </div>
                </div>
                <div className="checkout-section">
                  <h3><span>2</span> Levering</h3>
                  <div className="form-grid">
                    <select value={deliveryMethod} onChange={(event) => setDeliveryMethod(event.target.value)}>
                      <option>Send direkte til modtager</option>
                      <option>Send til mig</option>
                      <option>Afhentes / aftales</option>
                    </select>
                    {!useBillingAsDelivery && <input value={recipientName} onChange={(event) => setRecipientName(event.target.value)} placeholder={deliveryNameLabel} />}
                    {deliveryMethod === "Send til mig" && (
                      <label className="checkbox-row wide-field">
                        <input
                          type="checkbox"
                          checked={useCustomerAddressForDelivery}
                          onChange={(event) => setUseCustomerAddressForDelivery(event.target.checked)}
                        />
                        <span>Brug bestillers adresse som leveringsadresse</span>
                      </label>
                    )}
                    {!isPickup && !useBillingAsDelivery && <input className="wide-field" value={recipientAddress} onChange={(event) => setRecipientAddress(event.target.value)} placeholder={deliveryAddressLabel} />}
                    {!isPickup && !useBillingAsDelivery && <input value={recipientPostcode} onChange={(event) => setRecipientPostcode(event.target.value)} placeholder="Postnr." />}
                    {!isPickup && !useBillingAsDelivery && <input value={recipientCity} onChange={(event) => setRecipientCity(event.target.value)} placeholder="By" />}
                    <input className="wide-field" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} placeholder={isPickup ? "Ønsket afhentningsdato" : "Ønsket leveringsdato"} />
                  </div>
                  <p className="checkout-help">
                    {isDirectDelivery
                      ? "Gaven sendes direkte til modtageren, uden prisbilag."
                      : isPickup
                        ? "Vi aftaler afhentning eller anden levering direkte med dig."
                        : "Gaven sendes til dig, så du selv kan give den videre."}
                  </p>
                  <textarea value={shipping} onChange={(event) => setShipping(event.target.value)} placeholder="Leveringsnote, fx ring ikke på, stil ved døren, send uden prisbilag..." />
                </div>
                <div className="checkout-section">
                  <h3><span>3</span> Bekræft</h3>
                  <p className="checkout-help">Du kan se fragt og samlet total, før du går til sikker betaling. Kortteksterne følger de enkelte gaver.</p>
                </div>
                <button className="btn primary" onClick={submitOrder}>
                  Gå til betaling
                </button>
              </div>
              <div className="panel order-summary-panel">
                <h2>Ordreoversigt</h2>
                <div className="summary-box">
                  <div><span>Gaver i kurv</span><strong>{cart.length}</strong></div>
                  <div><span>Produkter i alt</span><strong>{cartProductCount}</strong></div>
                  <div><span>Korttekster</span><strong>{cardTextCount}/{cart.length}</strong></div>
                  <div><span>Produkter</span><strong>{money(cartProductsTotal)}</strong></div>
                  <div><span>Gaveæske/kasse og kort</span><strong>{money(cartPackagingTotal)}</strong></div>
                  <div><span>Subtotal</span><strong>{money(cartTotal)}</strong></div>
                  <div><span>Fragt</span><strong>{shippingLabel}</strong></div>
                  <div className="summary-total"><span>Total</span><strong>{money(checkoutTotal)}</strong></div>
                </div>
                <div className="order-preview">
                  <div><span>Bestiller</span><strong>{customerName || "Ikke udfyldt"}</strong></div>
                  <div><span>Kontakt</span><strong>{customerEmail || customerPhone ? [customerEmail, customerPhone].filter(Boolean).join(" · ") : "Ikke udfyldt"}</strong></div>
                  <div><span>Bestilleradresse</span><strong>{[customerAddress, customerPostcode, customerCity].filter(Boolean).join(", ") || "Ikke udfyldt"}</strong></div>
                  <div><span>Levering</span><strong>{deliveryMethod}</strong></div>
                  <div><span>{deliverySummaryLabel}</span><strong>{effectiveDeliveryName || "Ikke udfyldt"}</strong></div>
                  {!isPickup && <div><span>Leveringsadresse</span><strong>{[effectiveDeliveryAddress, effectiveDeliveryPostcode, effectiveDeliveryCity].filter(Boolean).join(", ") || "Ikke udfyldt"}</strong></div>}
                  <div><span>Ønsket dato</span><strong>{deliveryDate || "Ikke angivet"}</strong></div>
                  <div><span>Total inkl. fragt</span><strong>{money(checkoutTotal)}</strong></div>
                </div>
                <div className="checkout-note">
                  <strong>Sikker betaling</strong>
                  <span>Din ordre gemmes, og du sendes videre til Stripe for at betale sikkert med kort.</span>
                </div>
              </div>
            </section>
          )}

          {view === "confirmation" && lastOrder && (
            <section className="split">
              <div className="panel confirmation-panel">
                <span className="eyebrow">Bestilling sendt</span>
                <h2>Tak for din bestilling</h2>
                <p>Vi har modtaget din betaling og bestilling som {lastOrder.id}. Greenplanet pakker gaven og følger op på levering.</p>
                <div className="order-preview">
                  <div><span>Ordrenr.</span><strong>{lastOrder.id}</strong></div>
                  <div><span>Bestiller</span><strong>{lastOrder.customer.name || "Ikke udfyldt"}</strong></div>
                  <div><span>Kontakt</span><strong>{[lastOrder.customer.email, lastOrder.customer.phone].filter(Boolean).join(" · ") || "Ikke udfyldt"}</strong></div>
                  <div><span>Bestilleradresse</span><strong>{[lastOrder.customer.address, lastOrder.customer.postcode, lastOrder.customer.city].filter(Boolean).join(", ") || "Ikke udfyldt"}</strong></div>
                  <div><span>Levering</span><strong>{lastOrder.delivery.method}</strong></div>
                  <div><span>Modtager</span><strong>{lastOrder.delivery.recipientName || "Ikke udfyldt"}</strong></div>
                  <div><span>Adresse</span><strong>{[lastOrder.delivery.address, lastOrder.delivery.postcode, lastOrder.delivery.city].filter(Boolean).join(", ") || "Ikke udfyldt"}</strong></div>
                  <div><span>Total</span><strong>{money(lastOrder.total)}</strong></div>
                </div>
                <div className="actions">
                  <button className="btn primary" onClick={() => setView("home")}>Til forsiden</button>
                  <button className="btn" onClick={() => setView("products")}>Køb mere</button>
                </div>
              </div>
              <div className="panel">
                <h2>Ordrelinjer</h2>
                {lastOrder.lines.map((line) => (
                  <div className="cart-line" key={line.id}>
                    <div className="summary-row line">
                      <span>{line.title}<small>{line.items.length ? `${line.items.length} produkt${line.items.length === 1 ? "" : "er"}` : "levering"}</small></span>
                      <strong>{money(line.total)}</strong>
                    </div>
                    {line.cardText && <p className="card-note">Korttekst: {line.cardText}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {currentPolicy && (
            <section className="policy-page panel">
              <span className="eyebrow">{currentPolicy.eyebrow}</span>
              <h2>{currentPolicy.title}</h2>
              <p className="lead">{currentPolicy.intro}</p>
              <div className="policy-grid">
                {currentPolicy.sections.map((section) => (
                  <article className="policy-block" key={section.title}>
                    <h3>{section.title}</h3>
                    <p>{section.body}</p>
                  </article>
                ))}
              </div>
              <div className="policy-note">
                <strong>Spørgsmål?</strong>
                <span>Kontakt Greenplanet, hvis du er i tvivl om levering, returnering, personoplysninger eller en konkret ordre.</span>
              </div>
            </section>
          )}
        </div>
        <footer className="site-footer">
          <div className="footer-brand">
            <strong>{companyInfo.name}</strong>
            <p>Gaveæsker og udvalgte produkter til baby, barsel og ny mor.</p>
            <p className="footer-company">
              CVR {companyInfo.cvr}<br />
              {companyInfo.address}, {companyInfo.postcode} {companyInfo.city}
            </p>
            <div className="social-icons" aria-label="Sociale medier">
              <a href="#" aria-label="Instagram">ig</a>
              <a href="#" aria-label="Facebook">fb</a>
              <a href="#" aria-label="E-mail">@</a>
            </div>
          </div>
          <div className="footer-links">
            <div>
              <span>Shop</span>
              <button onClick={() => setView("giftboxes")}>Gaveæsker</button>
              <button onClick={() => setView("products")}>Produkter</button>
              <button onClick={() => setView("builder")}>Byg selv</button>
            </div>
            <div>
              <span>Kundeservice</span>
              <button onClick={() => setView("contact")}>Kontakt</button>
              <button onClick={() => setView("delivery")}>Levering</button>
              <button onClick={() => setView("returns")}>Returnering</button>
            </div>
            <div>
              <span>Legal</span>
              <button onClick={() => setView("legal")}>Legal</button>
              <button onClick={() => setView("terms")}>Handelsbetingelser</button>
              <button onClick={() => setView("privacy")}>Privatlivspolitik</button>
              <button onClick={() => setView("cookies")}>Cookiepolitik</button>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}

const viewTitles: Record<View, string> = {
  home: "Forside",
  giftboxes: "Gaveæsker",
  products: "Produkter",
  builder: "Byg selv",
  import: "Faire-import",
  orders: "Kurv",
  product: "Produkt",
  confirmation: "Tak for din bestilling",
  contact: "Kontakt",
  delivery: "Levering",
  returns: "Returnering",
  legal: "Legal",
  terms: "Handelsbetingelser",
  privacy: "Privatlivspolitik",
  cookies: "Cookiepolitik"
};

const defaultPolicyPages: Record<PolicyView, PolicyPage> = {
  contact: {
    eyebrow: "Kundeservice",
    title: "Kontakt Greenplanet",
    intro: "Har du spørgsmål til en gaveæske, levering direkte til modtager eller hjælp til at sammensætte en gave, kan du kontakte os her.",
    sections: [
      { title: "Kontaktoplysninger", body: `E-mail: ${companyInfo.email}. CVR: ${companyInfo.cvr}. Adresse: ${companyInfo.address}, ${companyInfo.postcode} ${companyInfo.city}. Vi svarer normalt inden for 1-2 hverdage.` },
      { title: "Hjælp til gavevalg", body: "Skriv gerne anledning, budget, ønsket leveringsdato og om gaven skal sendes direkte til modtager. Så kan vi foreslå en passende gaveæske eller et byg-selv udvalg." },
      { title: "Ordre og ændringer", body: "Hvis du vil ændre en bestilling, så kontakt os hurtigst muligt. Når en gave er pakket eller afsendt, kan ændringer være begrænsede." }
    ]
  },
  delivery: {
    eyebrow: "Kundeservice",
    title: "Levering",
    intro: "Greenplanet kan sende gaveæsker direkte til modtager eller til dig, hvis du selv vil overrække gaven.",
    sections: [
      { title: "Levering til modtager", body: "Ved checkout kan du vælge modtagers navn, adresse, ønsket leveringsdato og en leveringsnote. Vi sender uden prisbilag, når gaven sendes direkte." },
      { title: "Leveringstid", body: "Lagervarer pakkes som udgangspunkt inden for 1-3 hverdage efter ordrebekræftelse. Den forventede leveringsdato fremgår af den bekræftelse, du modtager fra Greenplanet." },
      { title: "Fragt og levering", body: "Fragtprisen vises i checkout, før du går til betaling. Levering koster 49 kr., mens afhentning eller særskilt aftalt levering vises som 0 kr. i checkout." },
      { title: "Forsinkelse eller fejl", body: "Hvis pakken bliver forsinket eller beskadiget under levering, hjælper vi med at finde en løsning. Kontakt os med ordrenummer og gerne billeder ved transportskade." }
    ]
  },
  returns: {
    eyebrow: "Kundeservice",
    title: "Returnering og fortrydelse",
    intro: "Her er et udkast til returtekst for webshoppen. Den bør gennemgås før lancering, især hvis sortimentet kommer til at indeholde forseglede plejeprodukter eller speciallavede gaveæsker.",
    sections: [
      { title: "Fortrydelsesret", body: "Som udgangspunkt har private kunder 14 dages fortrydelsesret ved køb online. Fristen regnes normalt fra den dag, varen modtages." },
      { title: "Sådan returnerer du", body: "Kontakt os først med ordrenummer, navn og hvilke varer du ønsker at returnere. Varen skal returneres forsvarligt pakket og i væsentligt samme stand." },
      { title: "Undtagelser", body: "Forseglede pleje- og hygiejneprodukter kan miste fortrydelsesretten, hvis forseglingen brydes. Specialtilpassede gaveæsker eller personlige kort kan også være undtaget." },
      { title: "Tilbagebetaling", body: "Når vi har modtaget og kontrolleret returneringen, tilbagebetaler vi beløbet til samme betalingsmiddel, medmindre andet er aftalt." }
    ]
  },
  legal: {
    eyebrow: "Legal",
    title: "Legal",
    intro: "Her finder du Greenplanets juridiske oplysninger, handelsbetingelser, privatlivspolitik og cookiepolitik samlet ét sted.",
    sections: [
      { title: "Virksomhedsoplysninger", body: `${companyInfo.name}, CVR ${companyInfo.cvr}, ${companyInfo.address}, ${companyInfo.postcode} ${companyInfo.city}, e-mail ${companyInfo.email}.` },
      { title: "Handelsbetingelser", body: "Handelsbetingelserne gælder for køb og bestillinger hos Greenplanet. De beskriver blandt andet ordreproces, betaling, levering, fortrydelsesret, reklamation og klageadgang." },
      { title: "Privatlivspolitik", body: "Privatlivspolitikken beskriver, hvordan Greenplanet behandler kunders og modtageres personoplysninger i forbindelse med bestilling, levering, kundeservice og bogføring." },
      { title: "Cookiepolitik", body: "Cookiepolitikken beskriver brugen af nødvendige cookies og eventuelle cookies til statistik eller marketing, hvis sådanne teknologier aktiveres på webshoppen." }
    ]
  },
  terms: {
    eyebrow: "Legal",
    title: "Handelsbetingelser",
    intro: "Disse handelsbetingelser gælder for køb og bestillinger hos Greenplanet.",
    sections: [
      { title: "Virksomhed", body: `${companyInfo.name}, CVR ${companyInfo.cvr}, ${companyInfo.address}, ${companyInfo.postcode} ${companyInfo.city}, e-mail ${companyInfo.email}.` },
      { title: "Bestilling og aftale", body: "Når du gennemfører betaling i checkout, modtager Greenplanet dine ordreoplysninger og den samlede pris inkl. fragt. Aftalen er bindende, når betalingen er gennemført, og du har modtaget ordrebekræftelse." },
      { title: "Priser og betaling", body: "Alle priser vises i danske kroner. Fragt vises i checkout, før du går til betaling. Betaling gennemføres sikkert via Stripe, og ordren behandles, når betalingen er registreret." },
      { title: "Produkter og gaveæsker", body: "Greenplanet sælger gaveæsker og udvalgte produkter til baby, barsel og personlig pleje. Indhold, farver og emballage kan variere en smule afhængigt af lagerstatus. Hvis et produkt ikke kan leveres, kontakter vi dig med forslag til erstatning eller ændring af ordren." },
      { title: "Levering", body: "Gaver kan sendes direkte til modtager eller til bestiller. Ved direkte gavelevering sendes pakken uden prisbilag, når det er muligt. Levering koster 49 kr., medmindre afhentning eller anden løsning er aftalt." },
      { title: "Fortrydelsesret", body: "Som forbruger har du som udgangspunkt 14 dages fortrydelsesret ved køb online. Fristen regnes normalt fra den dag, du eller en valgt modtager får varen i fysisk besiddelse. Du skal give Greenplanet besked inden fristens udløb, hvis du vil fortryde købet." },
      { title: "Returnering", body: "Ved fortrydelse skal varen returneres uden unødig forsinkelse og senest 14 dage efter, at du har givet besked om fortrydelse. Varen skal returneres forsvarligt pakket og i væsentligt samme stand. Du betaler selv returfragten, medmindre andet er aftalt." },
      { title: "Undtagelser", body: "Forseglede pleje- og hygiejneprodukter kan miste fortrydelsesretten, hvis forseglingen er brudt. Personlige korttekster, specialpakkede gaveæsker eller varer, der er fremstillet eller tilpasset efter dine specifikke ønsker, kan være undtaget fra fortrydelsesretten." },
      { title: "Reklamation", body: "Købelovens regler om mangler gælder. Kontakt Greenplanet hurtigst muligt, hvis en vare er beskadiget, forkert eller mangelfuld. Send ordrenummer, beskrivelse og gerne billeder, så vi kan vurdere sagen og finde en løsning." },
      { title: "Klageadgang", body: "Hvis vi ikke finder en løsning, kan du klage til Nævnenes Hus, Toldboden 2, 8800 Viborg, via naevneneshus.dk. EU-Kommissionens online klageportal kan også anvendes ved køb på tværs af EU." }
    ]
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privatlivspolitik",
    intro: "Vi behandler personoplysninger for at kunne håndtere bestillinger, levering, kundeservice og drift af webshoppen.",
    sections: [
      { title: "Dataansvarlig", body: `${companyInfo.name}, CVR ${companyInfo.cvr}, ${companyInfo.address}, ${companyInfo.postcode} ${companyInfo.city}, e-mail ${companyInfo.email}, er dataansvarlig for behandlingen af personoplysninger på webshoppen.` },
      { title: "Hvilke oplysninger vi behandler", body: "Vi kan behandle navn, e-mail, telefonnummer, fakturaadresse, leveringsadresse, modtagernavn, korttekst, ordreindhold og eventuelle leveringsnoter." },
      { title: "Formål og grundlag", body: "Oplysninger bruges til at behandle bestillinger, pakke og levere gaver, sende ordrebekræftelser, yde kundeservice, håndtere reklamationer og opfylde bogførings- og dokumentationskrav. Behandlingen sker blandt andet for at kunne opfylde en aftale, overholde retlige forpligtelser og varetage Greenplanets legitime interesse i drift og kundeservice." },
      { title: "Modtageroplysninger", body: "Hvis du sender en gave direkte til en anden person, behandler vi modtagerens navn, adresse og eventuelle leveringsnoter for at kunne levere gaven. Skriv ikke følsomme oplysninger i korttekst eller leveringsnote." },
      { title: "Deling", body: "Nødvendige oplysninger kan deles med fragtleverandører, betalingsudbydere, regnskabssystemer, hostingudbydere og tekniske leverandører, der hjælper med drift af webshoppen. Leverandører må kun behandle oplysninger efter aftale og til de relevante formål." },
      { title: "Opbevaring", body: "Oplysninger opbevares kun så længe det er nødvendigt for formålet eller påkrævet efter lovgivning. Regnskabsoplysninger opbevares som udgangspunkt i 5 år efter bogføringsreglerne." },
      { title: "Dine rettigheder", body: "Du kan kontakte Greenplanet for at anmode om indsigt, rettelse, sletning, begrænsning, dataportabilitet eller indsigelse, når betingelserne for det er opfyldt. Du kan også klage til Datatilsynet." }
    ]
  },
  cookies: {
    eyebrow: "Legal",
    title: "Cookiepolitik",
    intro: "Cookiepolitikken beskriver, hvordan Greenplanet kan bruge cookies og lignende teknologier på webshoppen.",
    sections: [
      { title: "Hvad er cookies?", body: "Cookies er små tekstfiler, der gemmes på din enhed, når du besøger en hjemmeside. De kan bruges til at få siden til at fungere, huske valg eller måle brug af siden." },
      { title: "Nødvendige cookies", body: "Greenplanet kan bruge nødvendige cookies og lokal lagring til grundlæggende funktioner som kurv, checkout, sikkerhed og teknisk drift. Disse er nødvendige for, at webshoppen kan fungere." },
      { title: "Statistik og analyse", body: "Hvis Greenplanet bruger statistik- eller analyseværktøjer, sker det for at forstå besøg, populære produkter og tekniske fejl. Ikke-nødvendige cookies bruges kun, når det relevante samtykke er indhentet." },
      { title: "Marketing", body: "Marketingcookies bruges kun, hvis Greenplanet senere tilføjer annoncering, tracking eller sociale medier-integrationer, og kun efter relevant samtykke." },
      { title: "Ændring af samtykke", body: "Du skal kunne ændre eller trække dit samtykke tilbage igen, hvis der bruges samtykkekrævende cookies. Nødvendige cookies kan normalt ikke fravælges, fordi de får siden til at fungere." }
    ]
  }
};
