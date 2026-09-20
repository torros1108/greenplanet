import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { initialProducts, productSpecs, type Product, type ProductVariant } from "@/lib/data";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";
import { AddToCartButton } from "./AddToCartButton";

const siteUrl = "https://www.greenplanet.dk";
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
  variants?: ProductVariant[] | null;
  image_url: string | null;
  images?: string[] | null;
  giftbox_eligible: boolean;
  occasions: string[] | null;
  shape: Product["shape"];
  specs?: { label: string; value: string }[] | null;
};

function mapProduct(row: SupabaseProductRow): Product {
  return {
    id: row.legacy_id || row.slug,
    title: row.title,
    brand: row.brand,
    category: row.category,
    tags: [],
    description: row.description,
    specs: row.specs || undefined,
    images: row.images || undefined,
    cost: Number(row.cost),
    price: Number(row.price),
    stock: row.stock,
    sku: row.sku || row.slug,
    image: row.image_url || undefined,
    variants: row.variants || undefined,
    giftbox: row.giftbox_eligible,
    occasions: row.occasions || [],
    shape: row.shape || "box",
    status: "Live"
  };
}

const productSelect = "legacy_id,slug,title,brand,category,description,cost,price,stock,sku,variants,image_url,images,giftbox_eligible,occasions,shape,specs";

const getProduct = cache(async (id: string) => {
  try {
    const rows = await supabaseAdminRequest<SupabaseProductRow[]>(
      `products?select=${productSelect}&legacy_id=eq.${encodeURIComponent(id)}&status=eq.live&limit=1`
    );
    if (rows[0]) return mapProduct(rows[0]);
  } catch {
    // Local fallback keeps builds and previews working without Supabase credentials.
  }
  return initialProducts.find((item) => item.id === id) || null;
});

const getMoveProducts = cache(async () => {
  try {
    const rows = await supabaseAdminRequest<SupabaseProductRow[]>(
      `products?select=${productSelect}&category=eq.Move&status=eq.live&order=legacy_id.asc`
    );
    return rows.map(mapProduct);
  } catch {
    return initialProducts.filter((item) => item.category === "Move");
  }
});


function money(value: number) {
  return `${Math.round(value)} kr.`;
}

function moveSeries(title: string) {
  return title
    .replace(/\s+(kompressionsleggings|løbeleggings|leggings|sports-bh|løbetop)$/i, "")
    .trim()
    .toLowerCase();
}


function productGalleryImages(product: (typeof initialProducts)[number]) {
  const images = [product.image, ...(product.images || []), ...(product.variants || []).map((variant) => variant.image)]
    .filter(Boolean) as string[];
  return Array.from(new Set(images));
}

function absoluteUrl(url?: string) {
  if (!url) return `${siteUrl}/brand/greenplanet-logo-mint.png`;
  if (url.startsWith("http")) return url;
  return `${siteUrl}${url}`;
}

function availability(stock: number) {
  return stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
}

export function generateStaticParams() {
  return initialProducts.map((product) => ({ id: product.id }));
}

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Produkt", robots: { index: false, follow: false } };

  const title = `${product.title} fra ${product.brand}`;
  const description = `${product.description} Køb som enkeltprodukt eller brug det i en personlig Greenplanet gaveæske.`;
  const url = `/products/${product.id}`;

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
      images: product.image ? [{ url: product.image, alt: product.title }] : ["/brand/greenplanet-logo-mint.png"]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Greenplanet`,
      description,
      images: product.image ? [product.image] : ["/brand/greenplanet-logo-mint.png"]
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const specs = productSpecs(product);
  const images = productGalleryImages(product);
  const liveVariants = product.variants?.filter((variant) => variant.status !== "archived") || [];
  const moveProducts = product.category === "Move" ? await getMoveProducts() : [];
  const matchingProducts = moveProducts.filter((item) => item.id !== product.id && moveSeries(item.title) === moveSeries(product.title));
  const categoryHref = product.category === "Move" ? "/#move" : product.category === "Naturlig beauty" ? "/#wellness" : product.category === "Baby & barsel" ? "/#baby" : "/#products";
  const categoryLabel = product.category === "Naturlig beauty" ? "Velvære" : product.category;
  const productStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${siteUrl}/products/${product.id}#product`,
        name: product.title,
        description: product.description,
        sku: product.sku,
        image: images.length ? images.map(absoluteUrl) : [absoluteUrl(product.image)],
        brand: {
          "@type": "Brand",
          name: product.brand
        },
        category: product.category,
        additionalProperty: specs.map((spec) => ({
          "@type": "PropertyValue",
          name: spec.label,
          value: spec.value
        })),
        offers: liveVariants.length
          ? liveVariants.map((variant) => ({
              "@type": "Offer",
              sku: variant.sku,
              name: `${product.title} - ${variant.title}`,
              price: variant.price.toFixed(2),
              priceCurrency: "DKK",
              availability: availability(variant.stock),
              itemCondition: "https://schema.org/NewCondition",
              url: `${siteUrl}/products/${product.id}`
            }))
          : {
              "@type": "Offer",
              sku: product.sku,
              price: product.price.toFixed(2),
              priceCurrency: "DKK",
              availability: availability(product.stock),
              itemCondition: "https://schema.org/NewCondition",
              url: `${siteUrl}/products/${product.id}`
            }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/products/${product.id}#breadcrumb`,
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
            name: "Produkter",
            item: `${siteUrl}/#products`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.title,
            item: `${siteUrl}/products/${product.id}`
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />
      <aside className="sidebar">
        <div className="brand">
          <Link className="logo-lockup" href="/" aria-label="Greenplanet forside">
            <img className="brand-logo" src="/brand/greenplanet-logo-white-crop.png" alt="Greenplanet" />
          </Link>
        </div>
        <nav className="nav">
          <Link href="/">Forside</Link>
          <Link href="/#giftboxes">Gaveæsker</Link>
          <Link className={product.category === "Baby & barsel" ? "active" : undefined} href="/#baby">Baby & barsel</Link>
          <Link className={product.category === "Naturlig beauty" ? "active" : undefined} href="/#wellness">Velvære</Link>
          <Link className={product.category === "Move" ? "active" : undefined} href="/#move">Move</Link>
          <Link href="/#builder">Byg selv</Link>
        </nav>
        <p className="side-note">Barselsgaver, babygaver, wellness og activewear fra udvalgte brands.</p>
      </aside>

      <section className="main">
        <div className="content">
          <section className="product-detail">
            <Link className="btn back-btn" href={categoryHref}>Tilbage til {categoryLabel}</Link>
            <div className="product-detail-media panel">
              {images.length ? (
                <div className="product-gallery">
                  <div className="gallery-main visual-frame">
                    <img className="product-image" src={images[0]} alt={product.title} />
                  </div>
                  {images.length > 1 && (
                    <div className="gallery-thumbs" aria-label="Produktbilleder">
                      {images.map((image, index) => (
                        <span className={`gallery-thumb ${index === 0 ? "active" : ""}`} key={image}>
                          <img src={image} alt="" />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : <span className={`shape ${product.shape}`} />}
            </div>
            <div className="product-detail-info panel">
              <div className="meta">{product.brand} · {product.category}</div>
              <h2>{product.title}</h2>
              <p className="lead">{product.description}</p>
              <div className="detail-price">{money(product.price)}</div>
              <div className="purchase-panel">
                <AddToCartButton product={product} />
                {product.giftbox && <Link className="btn" href="/#builder">Brug i byg-selv</Link>}
              </div>
              {matchingProducts.length > 0 && (
                <section className="matching-products" aria-labelledby="matching-products-title">
                  <div className="matching-products-head">
                    <span className="section-eyebrow">Samme serie</span>
                    <h3 id="matching-products-title">Passer sammen med</h3>
                  </div>
                  <div className="matching-products-list">
                    {matchingProducts.map((item) => (
                      <Link className="matching-product" href={`/products/${item.id}`} key={item.id}>
                        <span className="matching-product-image visual-frame"><img className="product-image" src={item.image} alt={item.title} /></span>
                        <span className="matching-product-copy"><strong>{item.title}</strong><em>{money(item.price)}</em></span>
                        <span className="matching-product-action">Se produkt</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
              <h3 className="spec-title">Produkt egenskaber</h3>
              <div className="detail-list">
                {specs.map((spec) => (
                  <div key={spec.label}><span>{spec.label}</span><strong>{spec.value}</strong></div>
                ))}
              </div>
              <div className="tag-row">
                {product.occasions.map((item) => <span key={item}>{item}</span>)}
              </div>

            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
