import type { Metadata } from "next";
import Link from "next/link";
import { StoreSidebar } from "@/app/_components/StoreCategoryPage";
import CorporateGiftInquiry from "./CorporateGiftInquiry";

const siteUrl = "https://www.greenplanet.dk";
const annaImage = "https://cdn.faire.com/fastly/683206c3fcb33ae803e790578192939dfbf4c29f8a2f8cee00dfd1a4b66dbaeb.jpeg?bg-color=FFFFFF&dpr=1&fit=crop&format=jpg&height=900&precrop=590%2C591%2Cx0%2Cy29%2Csafe&width=900";
const valenciaImage = "https://cdn.faire.com/fastly/49a6e6f0a774699ed444336b45ba08724e76943072c28235c10aa88a14a64e9f.jpeg?bg-color=FFFFFF&dpr=1&fit=crop&format=jpg&height=900&width=900";

const products = [
  {
    name: "Anna keramikvase",
    subtitle: "Hvid med sandfinish",
    description: "En håndlavet, vandtæt vase i et enkelt skandinavisk formsprog. Keramikken er fremstillet med solenergi og leveres i gaveæske.",
    facts: ["Ø 9 × H 16 cm", "Håndlavet keramik", "Vandtæt"],
    image: annaImage,
    tone: "light"
  },
  {
    name: "Terra bakke",
    subtitle: "Caffe",
    description: "En stor, taktil bakke af genanvendt papir med naturlig latex på indersiden. Et varmt og anvendeligt designobjekt til hjemmet.",
    facts: ["Ø 28 × H 10 cm", "Genanvendt papir", "Fair Trade-projekt"],
    image: "",
    tone: "caffe"
  },
  {
    name: "Valencia Duo",
    subtitle: "Vase og lysestage i mauve taupe",
    description: "Mundblæst i genanvendt glas og skabt til flere funktioner: brug den som vase, lysestage eller dekorativ opbevaring.",
    facts: ["Ø 10 × H 17 cm", "100 % genanvendt glas", "Mundblæst"],
    image: valenciaImage,
    tone: "mauve"
  }
];

export const metadata: Metadata = {
  title: "Firmajulegaver og firmagaver med boligdesign",
  description: "Kuraterede firmajulegaver med skandinavisk boligdesign. Få et tilbud på medarbejdergaver med personlig hilsen, gaveindpakning og samlet eller individuel levering.",
  alternates: { canonical: "/firmagaver" },
  openGraph: {
    title: "Firmajulegaver med skandinavisk boligdesign | Greenplanet",
    description: "Deko og boligartikler samlet som firmajulegaver med mulighed for personlig hilsen og levering.",
    url: "/firmagaver",
    images: [{ url: annaImage, alt: "Anna keramikvase som firmagave" }]
  }
};

export default function CorporateGiftsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: "Firmajulegaver fra Greenplanet",
        provider: { "@type": "Organization", name: "Greenplanet", url: siteUrl },
        areaServed: "DK",
        description: "Kuraterede firmajulegaver med boligdesign, personlig hilsen og fleksibel levering.",
        url: `${siteUrl}/firmagaver`
      },
      {
        "@type": "ItemList",
        name: "Udvalg til firmajulegaver",
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: product.name }))
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
              <span className="eyebrow">Firmagaver til jul</span>
              <h1>Boligdesign, der bliver stående efter jul</h1>
              <p className="lead">Giv medarbejdere eller samarbejdspartnere en brugbar gave med skandinavisk udtryk. Vi sammensætter antal, indpakning og levering efter jeres behov.</p>
              <div className="actions">
                <Link className="btn primary" href="#firmagave-forespoergsel">Få et tilbud</Link>
                <Link className="btn corporate-secondary" href="#firmagave-udvalg">Se udvalget</Link>
              </div>
            </div>
            <div className="corporate-hero-stilllife" aria-label="Udvalgte boligprodukter">
              <div className="corporate-hero-card corporate-hero-card-anna"><img src={annaImage} alt="Hvid Anna keramikvase" /></div>
              <div className="corporate-hero-card corporate-hero-card-valencia"><img src={valenciaImage} alt="Valencia Duo i genanvendt glas" /></div>
              <div className="corporate-hero-tray" aria-hidden="true"><span /></div>
            </div>
          </header>

          <section className="corporate-benefits" aria-label="Muligheder for firmagaver">
            <article><strong>Antal efter aftale</strong><span>Små og større bestillinger er velkomne.</span></article>
            <article><strong>Personlig hilsen</strong><span>Tilføj kort med virksomhedens egen tekst.</span></article>
            <article><strong>Fleksibel levering</strong><span>Samlet til kontoret eller direkte til modtagerne.</span></article>
          </section>

          <section className="corporate-products" id="firmagave-udvalg" aria-labelledby="firmagave-title">
            <div className="corporate-section-head">
              <div><span className="section-eyebrow">Udvalgte eksempler</span><h2 id="firmagave-title">Deko og boligartikler</h2></div>
              <p>De tre produkter viser retningen for firmagaverne. Det endelige udvalg, prisen og tilgængeligheden aftales efter antal, indpakning og levering.</p>
            </div>
            <div className="corporate-product-grid">
              {products.map((product, index) => (
                <article className={`corporate-product-card tone-${product.tone}`} key={product.name}>
                  <div className="corporate-product-number">0{index + 1}</div>
                  <div className="corporate-product-media">
                    {product.image ? <img src={product.image} alt={`${product.name}, ${product.subtitle}`} loading="lazy" /> : <div className="terra-visual" aria-label="Terra bakke i farven caffe"><span /><i /></div>}
                  </div>
                  <div className="corporate-product-copy">
                    <span>{product.subtitle}</span>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <ul>{product.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
                    <Link className="text-link" href="#firmagave-forespoergsel">Få pris efter antal</Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="corporate-process" aria-labelledby="corporate-process-title">
            <div><span className="section-eyebrow">Sådan foregår det</span><h2 id="corporate-process-title">Fra idé til færdig gave</h2></div>
            <ol>
              <li><span>1</span><strong>Fortæl os antal og budget</strong><p>Vælg et produkt eller bed os sammensætte et forslag.</p></li>
              <li><span>2</span><strong>Godkend tilbuddet</strong><p>Du får pris, leveringstid og indhold samlet på skrift.</p></li>
              <li><span>3</span><strong>Vi gør gaverne klar</strong><p>Vi pakker, tilføjer hilsen og aftaler den praktiske levering.</p></li>
            </ol>
          </section>

          <section className="corporate-inquiry" id="firmagave-forespoergsel" aria-labelledby="corporate-inquiry-title">
            <div className="corporate-inquiry-copy">
              <span className="section-eyebrow">Uforpligtende forespørgsel</span>
              <h2 id="corporate-inquiry-title">Lad os finde den rigtige løsning</h2>
              <p>Skriv lidt om antal, budget og leveringsønsker. Vi svarer personligt med muligheder og en samlet pris.</p>
              <a href="mailto:hello@greenplanet.dk">hello@greenplanet.dk</a>
            </div>
            <CorporateGiftInquiry />
          </section>
        </div>
      </section>
    </main>
  );
}
