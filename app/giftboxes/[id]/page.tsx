import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { giftboxes, initialProducts, productSpecs, type Product } from "@/lib/data";
import { AddGiftboxToCartButton } from "./AddGiftboxToCartButton";

const boxPrice = 49;
const siteUrl = "https://www.greenplanet.dk";

function money(value: number) {
  return `${Math.round(value)} kr.`;
}

function giftboxItems(productIds: string[]) {
  return productIds
    .map((id) => initialProducts.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
}


function absoluteUrl(url?: string) {
  if (!url) return `${siteUrl}/brand/greenplanet-logo-mint.png`;
  if (url.startsWith("http")) return url;
  return `${siteUrl}${url}`;
}

export function generateStaticParams() {
  return giftboxes.map((giftbox) => ({ id: giftbox.id }));
}

type GiftboxPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: GiftboxPageProps): Promise<Metadata> {
  const { id } = await params;
  const giftbox = giftboxes.find((item) => item.id === id);
  const items = giftbox ? giftboxItems(giftbox.productIds) : [];
  const image = items.find((item) => item.image)?.image;
  const title = giftbox ? `${giftbox.title} gaveæske` : "Gaveæske";
  const description = giftbox ? `${giftbox.description} Pakkes som gaveæske med personlig hilsen og mulighed for direkte levering.` : "Naturlige gaveæsker fra Greenplanet.";
  const url = giftbox ? `/giftboxes/${giftbox.id}` : "/giftboxes";
  if (!giftbox) return { title: "Gaveæske", robots: { index: false, follow: false } };

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      type: "website",
      url: `${siteUrl}${url}`,
      title: `${title} | Greenplanet`,
      description,
      images: image ? [{ url: image, alt: giftbox.title }] : ["/brand/greenplanet-logo-mint.png"]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Greenplanet`,
      description,
      images: image ? [image] : ["/brand/greenplanet-logo-mint.png"]
    }
  };
}

export default async function GiftboxPage({ params }: GiftboxPageProps) {
  const { id } = await params;
  const giftbox = giftboxes.find((item) => item.id === id);
  if (!giftbox) notFound();

  const items = giftboxItems(giftbox.productIds);
  const total = items.reduce((sum, product) => sum + product.price, 0) + boxPrice;
  const productsTotal = items.reduce((sum, product) => sum + product.price, 0);
  const image = items.find((item) => item.image)?.image;
  const giftboxStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${siteUrl}/giftboxes/${giftbox.id}#product`,
        name: `${giftbox.title} gaveæske`,
        description: giftbox.description,
        image: [absoluteUrl(image)],
        brand: {
          "@type": "Brand",
          name: "Greenplanet"
        },
        category: giftbox.category,
        isRelatedTo: items.map((product) => ({
          "@type": "Product",
          name: product.title,
          sku: product.sku,
          brand: {
            "@type": "Brand",
            name: product.brand
          },
          url: `${siteUrl}/products/${product.id}`
        })),
        offers: {
          "@type": "Offer",
          price: total.toFixed(2),
          priceCurrency: "DKK",
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          url: `${siteUrl}/giftboxes/${giftbox.id}`
        }
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/giftboxes/${giftbox.id}#contents`,
        name: `Indhold i ${giftbox.title}`,
        itemListElement: items.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}/products/${product.id}`,
          name: product.title
        }))
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/giftboxes/${giftbox.id}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Forside",
            item: siteUrl
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Gaveæsker",
            item: `${siteUrl}/#giftboxes`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: giftbox.title,
            item: `${siteUrl}/giftboxes/${giftbox.id}`
          }
        ]
      }
    ]
  };

  return (
    <main className="app-shell product-page-shell">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(giftboxStructuredData) }}
      />
      <aside className="sidebar">
        <div className="brand">
          <Link className="logo-lockup" href="/" aria-label="Greenplanet forside">
            <img className="brand-logo" src="/brand/greenplanet-logo-white-crop.png" alt="Greenplanet" />
          </Link>
        </div>
        <nav className="nav">
          <Link href="/">Forside</Link>
          <Link className="active" href="/#giftboxes">Gaveæsker</Link>
          <Link href="/#products">Produkter</Link>
          <Link href="/#builder">Byg selv</Link>
        </nav>
        <p className="side-note">Naturlige barselsgaver, babygaver og wellnessgaver fra små brands.</p>
      </aside>

      <section className="main">
        <div className="content">
          <section className="product-detail">
            <Link className="btn back-btn" href="/#giftboxes">Tilbage til gaveæsker</Link>
            <div className="product-detail-media giftbox-detail-media panel">
              <div className="giftbox-collage">
                {items.map((product, index) => (
                  <Link
                    className={`giftbox-collage-item giftbox-collage-item-${index + 1}`}
                    href={`/products/${product.id}`}
                    key={product.id}
                  >
                    {product.image ? <img src={product.image} alt={product.title} /> : <span className={`shape ${product.shape}`} />}
                  </Link>
                ))}
              </div>
              <div className="giftbox-media-note">
                <strong>{items.length} produkter i æsken</strong>
                <span>Indhold {money(productsTotal)} · gaveæske {money(boxPrice)}</span>
              </div>
            </div>
            <div className="product-detail-info panel">
              <div className="meta">{giftbox.category} · {items.length} produkter</div>
              <h2>{giftbox.title}</h2>
              <p className="lead">{giftbox.description}</p>
              <div className="detail-price">{money(total)}</div>
              <div className="purchase-panel">
                <AddGiftboxToCartButton id={giftbox.id} title={giftbox.title} note={giftbox.note} items={items} total={total} />
                <Link className="btn" href="/#builder">Byg din egen</Link>
              </div>
              <div className="giftbox-detail-grid">
                <div className="giftbox-info-box">
                  <span>Passer til</span>
                  <strong>{giftbox.recipient}</strong>
                </div>
                <div className="giftbox-info-box">
                  <span>Anledning</span>
                  <strong>{giftbox.occasion}</strong>
                </div>
              </div>
              <div className="detail-list">
                <div><span>Gaveæske</span><strong>{money(boxPrice)}</strong></div>
                <div><span>Indhold</span><strong>{items.length} produkter</strong></div>
                <div><span>Kategori</span><strong>{giftbox.category}</strong></div>
                <div><span>Pakning</span><strong>{giftbox.packing}</strong></div>
                <div><span>Kort</span><strong>{giftbox.cardText}</strong></div>
                <div><span>Levering</span><strong>{giftbox.delivery}</strong></div>
              </div>
              <div className="giftbox-story">
                <h3>Hvorfor denne gaveæske?</h3>
                <p>{giftbox.why}</p>
                <div className="giftbox-bullets">
                  {giftbox.details.map((detail) => <span key={detail}>{detail}</span>)}
                </div>
              </div>
              <div className="included-title-row">
                <div>
                  <h3 className="included-title">Indhold i gaveæsken</h3>
                  <p>Produkterne er valgt, så æsken føles samlet, brugbar og klar til at give videre.</p>
                </div>
                <strong>{money(productsTotal)}</strong>
              </div>
              <div className="included-products">
                {items.map((product, index) => {
                  const facts = productSpecs(product).slice(0, 2);
                  return (
                  <Link className="included-product" href={`/products/${product.id}`} key={product.id}>
                    <span className="included-product-image">
                      {product.image ? <img src={product.image} alt={product.title} /> : <span className={`shape ${product.shape}`} />}
                    </span>
                    <span className="included-product-copy">
                      <span className="included-product-brand">0{index + 1} · {product.brand}</span>
                      <strong>{product.title}</strong>
                      <small>{product.description}</small>
                      <span className="included-product-facts">
                        {facts.map((spec) => (
                          <span key={`${product.id}-${spec.label}`}>
                            <b>{spec.label}</b>
                            <em>{spec.value}</em>
                          </span>
                        ))}
                      </span>
                    </span>
                    <span className="included-product-price">{money(product.price)}</span>
                  </Link>
                  );
                })}
                <div className="giftbox-packaging-summary">
                  <div>
                    <span>Pakning</span>
                    <strong>Greenplanet gaveæske</strong>
                    <p>{giftbox.packing}</p>
                  </div>
                  <em>{money(boxPrice)}</em>
                </div>
              </div>

            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
