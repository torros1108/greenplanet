import Link from "next/link";
import type { Product } from "@/lib/data";

const siteUrl = "https://www.greenplanet.dk";

function money(value: number) {
  return `${Math.round(value)} kr.`;
}

export function StoreSidebar({ current }: { current: "gaveaesker" | "babygaver" | "wellness" | "move" }) {
  return (
    <aside className="sidebar category-sidebar">
      <div className="brand">
        <Link className="logo-lockup" href="/" aria-label="Greenplanet forside">
          <img className="brand-logo" src="/brand/greenplanet-logo-white-crop.png" alt="Greenplanet" />
        </Link>
      </div>
      <nav className="nav" aria-label="Shop">
        <Link href="/">Forside</Link>
        <Link className={current === "gaveaesker" ? "active" : ""} href="/gaveaesker">Gaveæsker</Link>
        <Link className={current === "babygaver" ? "active" : ""} href="/babygaver">Baby &amp; barsel</Link>
        <Link className={current === "wellness" ? "active" : ""} href="/wellness">Velvære</Link>
        <Link className={current === "move" ? "active" : ""} href="/move">Move</Link>
        <Link href="/#builder">Byg selv</Link>
        <Link href="/#orders">Kurv</Link>
      </nav>
      <p className="side-note">Barselsgaver, babygaver, wellness og activewear fra udvalgte brands.</p>
    </aside>
  );
}

type StoreCategoryPageProps = {
  current: "babygaver" | "wellness" | "move";
  eyebrow: string;
  title: string;
  intro: string;
  supportingText: string;
  products: Product[];
};

export default function StoreCategoryPage({ current, eyebrow, title, intro, supportingText, products }: StoreCategoryPageProps) {
  const pageUrl = `${siteUrl}/${current}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#collection`,
        name: title,
        description: intro,
        url: pageUrl,
        mainEntity: { "@id": `${pageUrl}#products` }
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#products`,
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}/products/${product.id}`,
          name: product.title
        }))
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Forside", item: siteUrl },
          { "@type": "ListItem", position: 2, name: title, item: pageUrl }
        ]
      }
    ]
  };

  return (
    <main className="app-shell category-page-shell">
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <StoreSidebar current={current} />
      <section className="main">
        <div className="content category-page-content">
          <header className="category-hero">
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p className="lead">{intro}</p>
            <p>{supportingText}</p>
          </header>
          <section aria-labelledby="category-products-title">
            <div className="section-head">
              <div>
                <span className="section-eyebrow">Udvalget</span>
                <h2 id="category-products-title">{products.length} produkter</h2>
              </div>
            </div>
            <div className="grid category-product-grid">
              {products.map((product) => (
                <article className="card" key={product.id}>
                  <Link className="product-visual category-product-image" href={`/products/${product.id}`} aria-label={`Se ${product.title}`}>
                    {product.image ? <img className="product-image" src={product.image} alt={product.title} loading="lazy" /> : <span className={`shape ${product.shape}`} />}
                  </Link>
                  <div className="card-body">
                    <div className="meta">{product.brand} · {product.category}</div>
                    <h3><Link href={`/products/${product.id}`}>{product.title}</Link></h3>
                    <p>{product.description}</p>
                    <div className="buy-row">
                      <span className="price">{money(product.price)}</span>
                      <Link className="btn primary" href={`/products/${product.id}`}>Se produkt</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
