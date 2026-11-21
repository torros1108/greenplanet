import type { Metadata } from "next";
import { isProductAvailable } from "@/lib/catalogRules";
import Link from "next/link";
import { notFound } from "next/navigation";
import { giftboxes, productSpecs } from "@/lib/data";
import { AddGiftboxToCartButton } from "./AddGiftboxToCartButton";
import { getGiftboxDetail } from "@/lib/storefrontServer";
import { StoreSidebar } from "@/app/_components/StoreSidebar";
import { StoreFooter } from "@/app/_components/StoreFooter";

const siteUrl = "https://www.greenplanet.dk";
const shippingDetails = {
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: "49.00", currency: "DKK" },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "DK" }
};
const returnPolicy = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "DK",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/ReturnFeesCustomerResponsibility"
};



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
  const detail = await getGiftboxDetail(id);
  const giftbox = detail?.giftbox;
  const items = detail?.items || [];
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
  const detail = await getGiftboxDetail(id);
  if (!detail) notFound();
  const { giftbox, items, boxPrice } = detail;
  const total = items.reduce((sum, product) => sum + product.price, 0) + boxPrice;
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
          availability: items.length > 0 && items.length === giftbox.productIds.length && items.every(isProductAvailable) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          url: `${siteUrl}/giftboxes/${giftbox.id}`,
          shippingDetails,
          hasMerchantReturnPolicy: returnPolicy
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
            item: `${siteUrl}/gaveaesker`
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
      <StoreSidebar current="gaveaesker" />

      <section className="main">
        <div className="content">
          <section className="product-detail giftbox-detail">
            <Link className="btn back-btn" href="/gaveaesker">Tilbage til gaveæsker</Link>
            <div className="product-detail-media giftbox-detail-media panel">
              <div className="giftbox-collage">
                {items.map((product, index) => (
                  <div
                    className={`giftbox-collage-item giftbox-collage-item-${index + 1}`}
                    key={product.id}
                  >
                    {product.image ? <img src={product.image} alt={product.title} /> : <span className={`shape ${product.shape}`} aria-hidden="true" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="product-detail-info panel">
              <div className="meta">Gaveæske · {giftbox.category}</div>
              <h1>{giftbox.title}</h1>
              <p className="lead">{giftbox.description}</p>
              {items.length > 0 && <a className="detail-text-link" href="#gaveaeskens-indhold">Se indholdet ({items.length} produkter)</a>}
              <div className="purchase-panel">
                <AddGiftboxToCartButton id={giftbox.id} title={giftbox.title} note={giftbox.note} items={items} expectedItemCount={giftbox.productIds.length} total={total} boxPrice={boxPrice} />
                <p className="giftbox-purchase-note">Tilføj en personlig hilsen i kurven. Gaven kan sendes direkte til modtageren.</p>
              </div>
              {items.length > 0 && (
                <section id="gaveaeskens-indhold" className="giftbox-contents" aria-labelledby="gaveaeskens-indhold-titel" tabIndex={-1}>
                  <h2 className="included-title" id="gaveaeskens-indhold-titel">Indhold i gaveæsken</h2>
                  <div className="included-products">
                    {items.map((product) => {
                      const facts = productSpecs(product).slice(0, 2);
                      return (
                        <article className="included-product" key={product.id}>
                          <span className="included-product-image">
                            {product.image ? <img src={product.image} alt="" loading="lazy" /> : <span className={`shape ${product.shape}`} aria-hidden="true" />}
                          </span>
                          <div className="included-product-copy">
                            <span className="included-product-brand">{product.brand}</span>
                            <h3>{product.title}</h3>
                            <small>{product.description}</small>
                            <span className="included-product-facts">
                              {facts.map((spec) => (
                                <span key={spec.label}>
                                  <b>{spec.label}</b>
                                  <em>{spec.value}</em>
                                </span>
                              ))}
                            </span>
                            <Link className="detail-text-link" href={`/products/${product.id}`} aria-label={`Se produkt: ${product.title}`}>Se produkt</Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}
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
                <div><span>Pakning</span><strong>{giftbox.packing}</strong></div>
                <div><span>Levering</span><strong>{giftbox.delivery}</strong></div>
              </div>
              <div className="giftbox-story">
                <h2 className="included-title">Hvorfor denne gaveæske?</h2>
                <p>{giftbox.why}</p>
                <div className="giftbox-bullets">
                  {giftbox.details.map((detail) => <span key={detail}>{detail}</span>)}
                </div>
              </div>
              <Link className="detail-text-link" href="/#builder">Byg din egen gaveæske</Link>
            </div>
          </section>
        </div>
        <StoreFooter />
      </section>
    </main>
  );
}
