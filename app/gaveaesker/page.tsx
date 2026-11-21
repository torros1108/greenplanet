import type { Metadata } from "next";
import { GiftboxCard } from "@/app/_components/GiftboxCard";
import { StoreSidebar } from "@/app/_components/StoreCategoryPage";
import { StoreFooter } from "@/app/_components/StoreFooter";
import { getGiftboxDetail, loadPublicRouteIds } from "@/lib/storefrontServer";
import { isProductAvailable } from "@/lib/catalogRules";

const siteUrl = "https://www.greenplanet.dk";

export const metadata: Metadata = {
  title: "Gaveæsker til barsel, baby og nybagt mor",
  description: "Find færdige gaveæsker til barsel, babyshower, nybagt mor og wellness. Tilføj personlig hilsen og send direkte til modtageren.",
  alternates: { canonical: "/gaveaesker" },
  openGraph: {
    title: "Gaveæsker til barsel og baby | Greenplanet",
    description: "Færdige gaveæsker med personlig hilsen og direkte levering.",
    url: "/gaveaesker",
    images: [{ url: "/greenplanet-premium-hero.png", width: 1536, height: 1024, alt: "Greenplanet gaveæske med personlig hilsen" }]
  }
};


export default async function GiftboxCollectionPage() {
  const { giftboxIds } = await loadPublicRouteIds();
  const details = (await Promise.all(giftboxIds.map(getGiftboxDetail))).filter(Boolean);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/gaveaesker#collection`,
        name: "Gaveæsker til barsel, baby og nybagt mor",
        description: "Færdige gaveæsker med udvalgte produkter, personlig hilsen og direkte levering.",
        url: `${siteUrl}/gaveaesker`,
        mainEntity: { "@id": `${siteUrl}/gaveaesker#products` }
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/gaveaesker#products`,
        name: "Greenplanet gaveæsker",
        numberOfItems: details.length,
        itemListElement: details.map((detail, index) => ({ "@type": "ListItem", position: index + 1, name: detail!.giftbox.title, url: `${siteUrl}/giftboxes/${detail!.giftbox.id}` }))
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Forside", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Gaveæsker", item: `${siteUrl}/gaveaesker` }
        ]
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "Kan jeg skrive en personlig hilsen?", acceptedAnswer: { "@type": "Answer", text: "Ja. Du kan skrive kortteksten, før gaveæsken lægges i kurven, og redigere den igen i kurven." } },
          { "@type": "Question", name: "Kan gaveæsken sendes direkte til modtageren?", acceptedAnswer: { "@type": "Answer", text: "Ja. Angiv modtagerens navn og adresse i checkout. Gaven sendes uden prisbilag." } },
          { "@type": "Question", name: "Hvad koster gaveæsken?", acceptedAnswer: { "@type": "Answer", text: "Den samlede pris består af produkterne og selve gaveæsken. Fragt vises særskilt i kurven og checkout." } }
        ]
      }
    ]
  };

  return (
    <main className="app-shell category-page-shell">
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <StoreSidebar current="gaveaesker" />
      <section className="main">
        <div className="content category-page-content">
          <section className="giftbox-section" aria-labelledby="giftbox-list-title">
            <header className="giftbox-intro">
              <span className="eyebrow">Klar til at give</span>
              <h1>Gaveæsker til barsel, baby og nybagt mor</h1>
              <p>Vælg en færdig gaveæske med udvalgte produkter, personlig korttekst og mulighed for levering direkte til modtageren.</p>
            </header>
            <h2 className="giftbox-list-title" id="giftbox-list-title">Udvalget</h2>
            <div className="giftbox-grid">
              {details.map((detail) => {
                const { giftbox, items, boxPrice } = detail!;
                const total = items.reduce((sum, item) => sum + item.price, 0) + boxPrice;
                const available = items.length > 0 && items.length === giftbox.productIds.length && items.every(isProductAvailable);
                return (
                  <GiftboxCard key={giftbox.id} giftbox={giftbox} items={items} total={total} available={available} />
                );
              })}
            </div>
          </section>
          <p className="category-supporting-copy">Prisen viser både indhold og gaveæske. På den enkelte gaveæske kan du se alle produkter, varianter og den samlede pris, før du lægger den i kurven.</p>
          <section className="category-guide" aria-labelledby="giftbox-guide-title">
            <div className="category-guide-intro">
              <span className="section-eyebrow">Gaveguide</span>
              <h2 id="giftbox-guide-title">En gaveæske, der er nem at sende</h2>
              <p>Vælg en færdig gaveæske, når du gerne vil sende en samlet barselsgave eller babygave uden selv at skulle finde indpakning og kort.</p>
            </div>
            <div className="category-guide-grid">
              <article><h3>Se hele indholdet</h3><p>Åbn gaveæsken for at se hvert produkt, de valgte varianter og prisfordelingen, før du bestiller.</p></article>
              <article><h3>Tilføj din hilsen</h3><p>Skriv en personlig korttekst til familien eller modtageren. Teksten kan redigeres igen i kurven.</p></article>
              <article><h3>Vælg leveringen</h3><p>Send til dig selv eller direkte til modtageren. Fragt og samlet pris vises inden betaling.</p></article>
            </div>
          </section>
          <section className="category-faq" aria-labelledby="giftbox-faq-title">
            <div><span className="section-eyebrow">Spørgsmål og svar</span><h2 id="giftbox-faq-title">Før du bestiller</h2></div>
            <div className="category-faq-list">
              <details><summary>Kan jeg skrive en personlig hilsen?</summary><p>Ja. Du kan skrive kortteksten, før gaveæsken lægges i kurven, og redigere den igen i kurven.</p></details>
              <details><summary>Kan gaveæsken sendes direkte til modtageren?</summary><p>Ja. Angiv modtagerens navn og adresse i checkout. Gaven sendes uden prisbilag.</p></details>
              <details><summary>Hvad koster gaveæsken?</summary><p>Den samlede pris består af produkterne og selve gaveæsken. Fragt vises særskilt i kurven og checkout.</p></details>
            </div>
          </section>
        </div>
        <StoreFooter />
      </section>
    </main>
  );
}
