import type { Metadata } from "next";
import Link from "next/link";
import { StoreSidebar } from "@/app/_components/StoreCategoryPage";
import { giftboxes } from "@/lib/data";
import { getGiftboxDetail } from "@/lib/storefrontServer";

const siteUrl = "https://www.greenplanet.dk";

export const metadata: Metadata = {
  title: "Gaveæsker til barsel, baby og nybagt mor",
  description: "Find færdige gaveæsker til barsel, babyshower, nybagt mor og wellness. Tilføj personlig hilsen og send direkte til modtageren.",
  alternates: { canonical: "/gaveaesker" },
  openGraph: { title: "Gaveæsker til barsel og baby | Greenplanet", description: "Færdige gaveæsker med personlig hilsen og direkte levering.", url: "/gaveaesker" }
};

function money(value: number) {
  return `${Math.round(value)} kr.`;
}

export default async function GiftboxCollectionPage() {
  const details = (await Promise.all(giftboxes.map((giftbox) => getGiftboxDetail(giftbox.id)))).filter(Boolean);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Greenplanet gaveæsker",
    numberOfItems: details.length,
    itemListElement: details.map((detail, index) => ({ "@type": "ListItem", position: index + 1, name: detail!.giftbox.title, url: `${siteUrl}/giftboxes/${detail!.giftbox.id}` }))
  };

  return (
    <main className="app-shell category-page-shell">
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <StoreSidebar current="gaveaesker" />
      <section className="main">
        <div className="content category-page-content">
          <header className="category-hero">
            <span className="eyebrow">Klar til at give</span>
            <h1>Gaveæsker til barsel, baby og nybagt mor</h1>
            <p className="lead">Vælg en færdig gaveæske med udvalgte produkter, personlig korttekst og mulighed for levering direkte til modtageren.</p>
            <p>Prisen viser både indhold og gaveæske. På den enkelte gaveæske kan du se alle produkter, varianter og den samlede pris, før du lægger den i kurven.</p>
          </header>
          <section aria-labelledby="giftbox-list-title">
            <div className="section-head"><div><span className="section-eyebrow">Udvalget</span><h2 id="giftbox-list-title">{details.length} gaveæsker</h2></div></div>
            <div className="grid category-product-grid">
              {details.map((detail) => {
                const { giftbox, items, boxPrice } = detail!;
                const total = items.reduce((sum, item) => sum + item.price, 0) + boxPrice;
                const image = items.find((item) => item.image)?.image;
                return (
                  <article className="card" key={giftbox.id}>
                    <Link className="product-visual category-product-image" href={`/giftboxes/${giftbox.id}`} aria-label={`Se ${giftbox.title}`}>
                      {image ? <img className="product-image" src={image} alt={giftbox.title} loading="lazy" /> : <span className="giftbox-mark">G</span>}
                    </Link>
                    <div className="card-body">
                      <div className="meta">{giftbox.category} · {items.length} produkter</div>
                      <h3><Link href={`/giftboxes/${giftbox.id}`}>{giftbox.title}</Link></h3>
                      <p>{giftbox.description}</p>
                      <div className="buy-row"><span className="price">{money(total)}</span><Link className="btn primary" href={`/giftboxes/${giftbox.id}`}>Se gaveæsken</Link></div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
