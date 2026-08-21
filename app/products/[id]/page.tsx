import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { initialProducts, productSpecs } from "@/lib/data";
import { AddToCartButton } from "./AddToCartButton";

const siteUrl = "https://www.greenplanet.dk";

function money(value: number) {
  return `${Math.round(value)} kr.`;
}

function visibleProductCount() {
  return initialProducts.reduce((count, product) => {
    const variantCount = product.variants?.filter((variant) => variant.status !== "archived").length || 0;
    return count + (variantCount || 1);
  }, 0);
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
  const product = initialProducts.find((item) => item.id === id);
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
  const product = initialProducts.find((item) => item.id === id);
  if (!product) notFound();
  const specs = productSpecs(product);
  const images = productGalleryImages(product);
  const liveVariants = product.variants?.filter((variant) => variant.status !== "archived") || [];
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
          <Link href="/">Forside<span>01</span></Link>
          <Link href="/#giftboxes">Gaveæsker<span>5</span></Link>
          <Link className="active" href="/#products">Produkter<span>{visibleProductCount()}</span></Link>
          <Link href="/#builder">Byg selv<span>03</span></Link>
        </nav>
        <p className="side-note">Naturlige barselsgaver, babygaver og wellnessgaver fra små brands.</p>
      </aside>

      <section className="main">
        <div className="content">
          <section className="product-detail">
            <Link className="btn back-btn" href="/#products">Tilbage til produkter</Link>
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
              <h3 className="spec-title">Produkt egenskaber</h3>
              <div className="detail-list">
                {specs.map((spec) => (
                  <div key={spec.label}><span>{spec.label}</span><strong>{spec.value}</strong></div>
                ))}
              </div>
              <div className="tag-row">
                {product.occasions.map((item) => <span key={item}>{item}</span>)}
              </div>
              <div className="actions">
                <AddToCartButton product={product} />
                {product.giftbox && <Link className="btn" href="/#builder">Brug i byg-selv</Link>}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
