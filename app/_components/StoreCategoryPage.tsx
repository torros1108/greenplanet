import Link from "next/link";
import type { Product } from "@/lib/data";

const siteUrl = "https://www.greenplanet.dk";

function money(value: number) {
  return `${Math.round(value)} kr.`;
}

export function StoreSidebar({ current }: { current: "gaveaesker" | "babygaver" | "wellness" | "move" | "firmagaver" }) {
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
        <Link className={current === "firmagaver" ? "active" : ""} href="/firmagaver">Firmagaver</Link>
        <Link href="/#builder">Byg selv</Link>
        <Link href="/#orders">Kurv</Link>
      </nav>
      <p className="side-note">Personlige gaver, boligdesign og activewear fra udvalgte brands.</p>
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
  guideTitle: string;
  guideIntro: string;
  guide: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
};

export default function StoreCategoryPage({ current, eyebrow, title, intro, supportingText, products, guideTitle, guideIntro, guide, faqs }: StoreCategoryPageProps) {
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
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer }
        }))
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
                <h2 id="category-products-title">Se produkterne</h2>
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
          <section className="category-guide" aria-labelledby="category-guide-title">
            <div className="category-guide-intro">
              <span className="section-eyebrow">Guide</span>
              <h2 id="category-guide-title">{guideTitle}</h2>
              <p>{guideIntro}</p>
            </div>
            <div className="category-guide-grid">
              {guide.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>
          <section className="category-faq" aria-labelledby="category-faq-title">
            <div>
              <span className="section-eyebrow">Spørgsmål og svar</span>
              <h2 id="category-faq-title">Det spørger kunderne om</h2>
            </div>
            <div className="category-faq-list">
              {faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
