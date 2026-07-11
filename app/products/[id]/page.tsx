import Link from "next/link";
import { notFound } from "next/navigation";
import { initialProducts, productSpecs } from "@/lib/data";
import { AddToCartButton } from "./AddToCartButton";

function money(value: number) {
  return `${Math.round(value)} kr.`;
}

function visibleProductCount() {
  return initialProducts.reduce((count, product) => {
    const variantCount = product.variants?.filter((variant) => variant.status !== "archived").length || 0;
    return count + (variantCount || 1);
  }, 0);
}

export function generateStaticParams() {
  return initialProducts.map((product) => ({ id: product.id }));
}

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = initialProducts.find((item) => item.id === id);
  if (!product) return { title: "Produkt | Greenplanet" };

  return {
    title: `${product.title} | Greenplanet`,
    description: product.description
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = initialProducts.find((item) => item.id === id);
  if (!product) notFound();
  const specs = productSpecs(product);

  return (
    <main className="app-shell product-page-shell">
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
        <header className="topbar">
          <div className="topbar-title">
            <h1>{product.title}</h1>
          </div>
          <Link className="cart-pill" href="/#orders">Kurv</Link>
        </header>

        <div className="content">
          <section className="product-detail">
            <Link className="btn back-btn" href="/#products">Tilbage til produkter</Link>
            <div className="product-detail-media panel">
              {product.image ? <img className="product-image" src={product.image} alt={product.title} /> : <span className={`shape ${product.shape}`} />}
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
