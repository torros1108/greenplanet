import Link from "next/link";
import { notFound } from "next/navigation";
import { giftboxes, initialProducts, type Product } from "@/lib/data";
import { AddGiftboxToCartButton } from "./AddGiftboxToCartButton";

const boxPrice = 49;

function money(value: number) {
  return `${Math.round(value)} kr.`;
}

function giftboxItems(productIds: string[]) {
  return productIds
    .map((id) => initialProducts.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
}

export function generateStaticParams() {
  return giftboxes.map((giftbox) => ({ id: giftbox.id }));
}

type GiftboxPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: GiftboxPageProps) {
  const { id } = await params;
  const giftbox = giftboxes.find((item) => item.id === id);
  if (!giftbox) return { title: "Gaveæske | Greenplanet" };

  return {
    title: `${giftbox.title} | Greenplanet`,
    description: giftbox.description
  };
}

export default async function GiftboxPage({ params }: GiftboxPageProps) {
  const { id } = await params;
  const giftbox = giftboxes.find((item) => item.id === id);
  if (!giftbox) notFound();

  const items = giftboxItems(giftbox.productIds);
  const total = items.reduce((sum, product) => sum + product.price, 0) + boxPrice;

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
          <Link className="active" href="/#giftboxes">Gaveæsker<span>{giftboxes.length}</span></Link>
          <Link href="/#products">Produkter<span>{initialProducts.length}</span></Link>
          <Link href="/#builder">Byg selv<span>03</span></Link>
        </nav>
        <p className="side-note">Naturlige barselsgaver, babygaver og wellnessgaver fra små brands.</p>
      </aside>

      <section className="main">
        <header className="topbar">
          <div className="topbar-title">
            <h1>{giftbox.title}</h1>
          </div>
        </header>

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
            </div>
            <div className="product-detail-info panel">
              <div className="meta">{giftbox.category} · {items.length} produkter</div>
              <h2>{giftbox.title}</h2>
              <p className="lead">{giftbox.description}</p>
              <div className="detail-price">{money(total)}</div>
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
              <h3 className="included-title">Det er i æsken</h3>
              <div className="included-products">
                {items.map((product) => (
                  <Link className="included-product" href={`/products/${product.id}`} key={product.id}>
                    <span>{product.brand}</span>
                    <strong>{product.title}</strong>
                    <em>{money(product.price)}</em>
                  </Link>
                ))}
              </div>
              <div className="actions">
                <AddGiftboxToCartButton id={giftbox.id} title={giftbox.title} note={giftbox.note} items={items} total={total} />
                <Link className="btn" href="/#builder">Byg din egen</Link>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
