import type { Metadata } from "next";
import Link from "next/link";
import { StoreSidebar } from "@/app/_components/StoreCategoryPage";
import { getGiftboxDetail } from "@/lib/storefrontServer";
import CorporateGiftInquiry from "./CorporateGiftInquiry";

const siteUrl = "https://www.greenplanet.dk";
const corporateGiftboxIds = ["g2", "g3", "g4", "g5"];

export const metadata: Metadata = {
  title: "Firmagaver til medarbejdere og samarbejdspartnere",
  description: "Vælg en købsklar barselsgave, babygave eller wellnessgave til en medarbejder. Få tilbud på flere firmagaver, personlig hilsen og direkte levering.",
  alternates: { canonical: "/firmagaver" },
  openGraph: {
    title: "Firmagaver til medarbejdere | Greenplanet",
    description: "Køb en færdig medarbejdergave, eller få et samlet tilbud på flere firmagaver med personlig hilsen og levering.",
    url: "/firmagaver"
  }
};

function money(value: number) {
  return `${Math.round(value)} kr.`;
}

export default async function CorporateGiftsPage() {
  const giftboxDetails = (await Promise.all(corporateGiftboxIds.map((id) => getGiftboxDetail(id)))).filter(Boolean);
  const heroImages = giftboxDetails.flatMap((detail) => detail!.items.map((item) => item.image).filter(Boolean)).slice(0, 4) as string[];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: "Firmagaver fra Greenplanet",
        provider: { "@type": "Organization", name: "Greenplanet", url: siteUrl },
        areaServed: "DK",
        description: "Købsklare medarbejdergaver og firmagaver med personlig hilsen og fleksibel levering.",
        url: `${siteUrl}/firmagaver`
      },
      {
        "@type": "ItemList",
        name: "Firmagaver til medarbejdere",
        numberOfItems: giftboxDetails.length,
        itemListElement: giftboxDetails.map((detail, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: detail!.giftbox.title,
          url: `${siteUrl}/giftboxes/${detail!.giftbox.id}`
        }))
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "Kan firmagaven sendes direkte til medarbejderen?", acceptedAnswer: { "@type": "Answer", text: "Ja. Enkeltgaver kan bestilles online og sendes direkte til medarbejderen med personlig hilsen og uden prisbilag." } },
          { "@type": "Question", name: "Kan virksomheden bestille flere gaver samlet?", acceptedAnswer: { "@type": "Answer", text: "Ja. Send en forespørgsel med antal, budget og leveringsønsker, så vender Greenplanet tilbage med en samlet løsning og pris." } },
          { "@type": "Question", name: "Kan vi få virksomhedens egen tekst på kortet?", acceptedAnswer: { "@type": "Answer", text: "Ja. Ved enkeltkøb skrives hilsenen ved bestilling. Ved større bestillinger aftales korttekst og eventuel firmatilpasning i tilbuddet." } }
        ]
      }
    ]
  };

  return (
    <main className="app-shell category-page-shell corporate-page-shell">
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <StoreSidebar current="firmagaver" />
      <section className="main">
        <div className="content corporate-page-content">
          <header className="corporate-hero">
            <div className="corporate-hero-copy">
              <span className="eyebrow">Firmagaver uden besvær</span>
              <h1>Gaver til medarbejdere, der er nemme at vælge og sende</h1>
              <p className="lead">Bestil en barsels-, baby- eller wellnessgave direkte, eller få et samlet tilbud, når flere medarbejdere eller samarbejdspartnere skal have en gave.</p>
              <div className="actions">
                <Link className="btn primary" href="#firmagave-udvalg">Se købsklare gaver</Link>
                <Link className="btn corporate-secondary" href="#firmagave-forespoergsel">Få et samlet tilbud</Link>
              </div>
            </div>
            <div className="corporate-hero-mosaic" aria-label="Udvalgte medarbejdergaver">
              {heroImages.map((image, index) => <div className={`corporate-hero-tile tile-${index + 1}`} key={`${image}-${index}`}><img src={image} alt="Produkt i en Greenplanet firmagave" /></div>)}
              <div className="corporate-hero-seal"><span>Personlig hilsen</span><strong>Direkte levering</strong></div>
            </div>
          </header>

          <section className="corporate-benefits" aria-label="Fordele ved firmagaver fra Greenplanet">
            <article><strong>Køb én gave med det samme</strong><span>Se indhold og pris, skriv kortet og betal sikkert online.</span></article>
            <article><strong>Send direkte til medarbejderen</strong><span>Vi sender uden prisbilag og lægger virksomhedens hilsen ved.</span></article>
            <article><strong>Få én løsning til flere</strong><span>Ved større antal samler vi pris, korttekst og levering i et tilbud.</span></article>
          </section>

          <section className="corporate-products" id="firmagave-udvalg" aria-labelledby="firmagave-title">
            <div className="corporate-section-head">
              <div><span className="section-eyebrow">Kan bestilles nu</span><h2 id="firmagave-title">Købsklare medarbejdergaver</h2></div>
              <p>Prisen omfatter produkterne, gaveæske og kort. Åbn en gave for at se hele indholdet, vælge varianter og bestille direkte.</p>
            </div>
            <div className="corporate-gift-grid">
              {giftboxDetails.map((detail) => {
                const { giftbox, items, boxPrice } = detail!;
                const total = items.reduce((sum, item) => sum + item.price, 0) + boxPrice;
                return (
                  <article className="corporate-gift-card" key={giftbox.id}>
                    <Link className="corporate-gift-media" href={`/giftboxes/${giftbox.id}`} aria-label={`Se ${giftbox.title}`}>
                      {items.slice(0, 3).map((item, index) => item.image && <span className={`gift-media-${index + 1}`} key={item.id}><img src={item.image} alt={item.title} loading="lazy" /></span>)}
                    </Link>
                    <div className="corporate-gift-copy">
                      <span>{giftbox.category} · {items.length} produkter</span>
                      <h3><Link href={`/giftboxes/${giftbox.id}`}>{giftbox.title}</Link></h3>
                      <p>{giftbox.description}</p>
                      <p className="corporate-gift-contents"><strong>I æsken:</strong> {items.map((item) => item.title).join(", ")}</p>
                      <div className="corporate-gift-action"><strong>{money(total)}</strong><Link className="btn primary" href={`/giftboxes/${giftbox.id}`}>Se og bestil</Link></div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="corporate-process" aria-labelledby="corporate-process-title">
            <div><span className="section-eyebrow">Vælg bestillingsform</span><h2 id="corporate-process-title">Fra enkeltgave til fast gaveordning</h2></div>
            <ol>
              <li><span>1</span><strong>En enkelt medarbejdergave</strong><p>Vælg en købsklar gaveæske ovenfor, tilføj hilsen og betal online.</p></li>
              <li><span>2</span><strong>Flere gaver på én gang</strong><p>Fortæl os antal, budget og adresser. Du får en samlet pris og leveringsplan.</p></li>
              <li><span>3</span><strong>Fast gaveordning</strong><p>Få en enkel løsning til barsel, jubilæum, tak eller mærkedage gennem året.</p></li>
            </ol>
          </section>

          <section className="corporate-faq" aria-labelledby="corporate-faq-title">
            <div><span className="section-eyebrow">Praktisk</span><h2 id="corporate-faq-title">Det har virksomheden brug for at vide</h2></div>
            <div className="corporate-faq-list">
              <details><summary>Kan gaven sendes direkte til medarbejderen?</summary><p>Ja. Enkeltgaver kan bestilles online med modtagerens navn og adresse. Vi sender uden prisbilag og vedlægger jeres hilsen.</p></details>
              <details><summary>Kan vi bestille til flere adresser?</summary><p>Ja. Brug forespørgslen ved flere modtagere, så aftaler vi adresser, leveringstid og en samlet pris, før bestillingen sættes i gang.</p></details>
              <details><summary>Kan vi vælge budget pr. gave?</summary><p>Ja. Skriv budget og antal i formularen. Vi foreslår en løsning med tydeligt indhold og samlet pris.</p></details>
              <details><summary>Kan Greenplanet hjælpe med firmajulegaver?</summary><p>Ja. Julegaver og større sæsonbestillinger sammensættes efter budget, antal og ønsket levering. Sortiment og lager bekræftes i tilbuddet.</p></details>
            </div>
          </section>

          <section className="corporate-inquiry" id="firmagave-forespoergsel" aria-labelledby="corporate-inquiry-title">
            <div className="corporate-inquiry-copy">
              <span className="section-eyebrow">Flere gaver eller særlige ønsker</span>
              <h2 id="corporate-inquiry-title">Få en konkret pris og leveringsplan</h2>
              <p>Skriv antal, budget og anledning. Vi svarer personligt med forslag, tilgængelighed og en samlet pris, før I beslutter jer.</p>
              <a href="mailto:hello@greenplanet.dk">hello@greenplanet.dk</a>
            </div>
            <CorporateGiftInquiry />
          </section>
        </div>
      </section>
    </main>
  );
}
