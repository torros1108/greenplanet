import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StoreSidebar } from "@/app/_components/StoreCategoryPage";
import CorporateGiftInquiry from "./CorporateGiftInquiry";

const siteUrl = "https://www.greenplanet.dk";
const gizaImage = "/images/firmagaver/giza-keramikbakke.jpg";
const temploImage = "/images/firmagaver/templo-lysestage.jpg";
const emporioImage = "/images/firmagaver/emporio-papirvase.jpg";
const candleStackImage = "/images/firmagaver/candl-stack-03.jpg";
const oliveOilImage = "/images/firmagaver/mini-olivenolier.jpg";
const kitchenGiftImage = "/images/firmagaver/nordisk-koekkengavesaet.jpg";
const loulouImage = "/images/firmagaver/loulou-keramikvase.jpg";

const faqs = [
  {
    question: "Hvor mange firmagaver kan vi bestille?",
    answer: "Vi giver tilbud på både mindre og større bestillinger. Det mulige antal afhænger af produktets aktuelle lager, leveringstid og den ønskede indpakning."
  },
  {
    question: "Kan gaverne få virksomhedens egen hilsen?",
    answer: "Ja. Vi kan lægge et kort med virksomhedens tekst i gaverne. Logo, særligt kortformat eller anden tilpasning aftales som en del af tilbuddet."
  },
  {
    question: "Kan gaverne sendes direkte til medarbejderne?",
    answer: "Ja. Gaverne kan leveres samlet til virksomheden eller sendes direkte til hver modtager. Vi beregner levering og håndtering ud fra antal adresser."
  },
  {
    question: "Hvad koster en firmajulegave?",
    answer: "Den samlede pris afhænger af produkt, antal, kort, indpakning og levering. Send budget pr. gave i forespørgslen, så vender vi tilbage med et konkret forslag."
  },
  {
    question: "Hvornår skal vi bestille firmajulegaver?",
    answer: "Bestil gerne så tidligt som muligt. I tilbuddet bekræfter vi altid den aktuelle leveringstid og den seneste dato, hvor ordren skal godkendes."
  }
];

const products = [
  {
    name: "Nordisk køkkengave",
    subtitle: "Aspegren Denmark · Danmark",
    occasion: "Til hjemmet",
    description: "Et færdigt gavesæt med to viskestykker og to karklude i rolige blå nuancer. En brugbar gave i økologisk bomuld, pakket og klar til at give.",
    facts: ["4 dele", "100 % økologisk bomuld", "Designet i Danmark"],
    images: [kitchenGiftImage],
    tone: "nordic"
  },
  {
    name: "Smageæske fra Middelhavet",
    subtitle: "Yiayia and Friends · Grækenland",
    occasion: "Til madelskeren",
    description: "Seks små ekstra jomfruolivenolier med original, citron, trøffel, chili, basilikum og hvidløg. En farverig smagegave, der er nem at dele.",
    facts: ["6 smagsvarianter", "Vegansk og glutenfri", "Færdig gaveæske"],
    images: [oliveOilImage],
    tone: "olive"
  },
  {
    name: "Skulpturelt designlys",
    subtitle: "Stan Editions · Belgien",
    occasion: "Til designelskeren",
    description: "Et markant lysobjekt, der fungerer som både brugskunst og stemningsskaber. Et moderne valg til medarbejdere og kunder, der holder af farve og boligdesign.",
    facts: ["Ca. 80 timers brændetid", "Bivoks", "Flere farver"],
    images: [candleStackImage],
    tone: "burgundy"
  },
  {
    name: "Templo røgelsesholder",
    subtitle: "OCTAEVO · Spanien",
    occasion: "Til den rolige pause",
    description: "En skulpturel røgelsesholder i glaseret stentøj. En kompakt designgave til skrivebordet eller hjemmet, som kan kombineres med en personlig hilsen.",
    facts: ["Glaseret stentøj", "Til røgelsespinde", "Designet i Barcelona"],
    images: [temploImage],
    tone: "stone"
  },
  {
    name: "Grafisk designgave",
    subtitle: "OCTAEVO · Spanien",
    occasion: "Til hjem og kontor",
    description: "Giza-bakken i højbrændt keramik kombineret med en vandafvisende papirvase. Farverigt europæisk design, der er let at sende og svært at overse.",
    facts: ["Keramik og papir", "Gulddetaljer", "Leveres gaveklart"],
    images: [gizaImage, emporioImage],
    tone: "colour"
  },
  {
    name: "Loulou keramikvase",
    subtitle: "Opjet Paris · Frankrig",
    occasion: "Til den klassiske gave",
    description: "En høj vase i brun keramisk stentøj med et enkelt, håndværkspræget udtryk. En rolig og anvendelig gave til medarbejdere, kunder eller samarbejdspartnere.",
    facts: ["33 cm høj", "Keramisk stentøj", "Kan gives alene eller i et sæt"],
    images: [loulouImage],
    tone: "clay"
  }
];

export const metadata: Metadata = {
  title: "Firmajulegaver med europæisk design og delikatesser",
  description: "Kuraterede firmajulegaver med europæisk boligdesign, lys og delikatesser. Få et tilbud med personlig hilsen, gaveindpakning og fleksibel levering.",
  alternates: { canonical: "/firmagaver" },
  openGraph: {
    title: "Firmajulegaver med europæisk design | Greenplanet",
    description: "Boligdesign, lys og delikatesser som firmajulegaver med personlig hilsen og fleksibel levering.",
    url: "/firmagaver",
    images: [{ url: gizaImage, alt: "Giza keramikbakke som firmagave" }]
  },
  robots: { index: false, follow: false }
};

export default function CorporateGiftsPage() {
  redirect("/");

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: "Firmajulegaver fra Greenplanet",
        provider: { "@type": "Organization", name: "Greenplanet", url: siteUrl },
        areaServed: "DK",
        description: "Kuraterede firmajulegaver med europæisk design, delikatesser, personlig hilsen og fleksibel levering.",
        url: `${siteUrl}/firmagaver`
      },
      {
        "@type": "ItemList",
        name: "Gavekoncepter til firmajulegaver",
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: product.name }))
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer }
        }))
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
              <h1>Firmagaver, man har lyst til at pakke op</h1>
              <p className="lead">Vælg mellem europæisk boligdesign, skulpturelle lys og smage fra Sydeuropa. Vi tilpasser antal, indpakning og levering til virksomheden.</p>
              <div className="actions">
                <Link className="btn primary" href="#firmagave-forespoergsel">Få et tilbud</Link>
                <Link className="btn corporate-secondary" href="#firmagave-udvalg">Se udvalget</Link>
              </div>
            </div>
            <div className="corporate-hero-gallery" aria-label="Udvalgte firmagaver">
              <img className="corporate-hero-gallery-main" src={kitchenGiftImage} alt="Nordisk køkkengavesæt i økologisk bomuld" />
              <img src={oliveOilImage} alt="Smageæske med små olivenolier" />
              <img src={gizaImage} alt="Farverig Giza keramikbakke" />
            </div>
          </header>

          <section className="corporate-benefits" aria-label="Muligheder for firmagaver">
            <article><strong>Europæiske brands</strong><span>Udvalgt design fra Spanien, Belgien, Grækenland og Frankrig.</span></article>
            <article><strong>Personlig hilsen</strong><span>Tilføj kort med virksomhedens egen tekst.</span></article>
            <article><strong>Fleksibel levering</strong><span>Samlet til kontoret eller direkte til modtagerne.</span></article>
          </section>

          <section className="corporate-products" id="firmagave-udvalg" aria-labelledby="firmagave-title">
            <div className="corporate-section-head">
              <div><span className="section-eyebrow">Seks gaveidéer</span><h2 id="firmagave-title">Vælg den gave, der passer til modtageren</h2></div>
              <p>Se indholdet, vælg en favorit og send en forespørgsel. Vi bekræfter altid lager, pris og leveringstid samlet på skrift.</p>
            </div>
            <div className="corporate-product-grid">
              {products.map((product, index) => (
                <article className={`corporate-product-card tone-${product.tone}`} key={product.name}>
                  <div className="corporate-product-number">Gave 0{index + 1}</div>
                  <div className={`corporate-product-media ${product.images.length > 1 ? "corporate-product-collage" : ""}`}>
                    {product.images.map((image, imageIndex) => (
                      <img src={image} alt={imageIndex === 0 ? `${product.name}, ${product.subtitle}` : ""} loading="lazy" key={image} />
                    ))}
                  </div>
                  <div className="corporate-product-copy">
                    <div className="corporate-product-meta"><span>{product.subtitle}</span><em>{product.occasion}</em></div>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <ul>{product.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
                    <Link className="corporate-select-gift" href={`/firmagaver?gift=${encodeURIComponent(product.name)}#firmagave-forespoergsel`}>Vælg denne gave</Link>
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

          <section className="category-faq corporate-faq" aria-labelledby="corporate-faq-title">
            <div>
              <span className="section-eyebrow">Praktisk information</span>
              <h2 id="corporate-faq-title">Spørgsmål om firmagaver</h2>
            </div>
            <div className="category-faq-list">
              {faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
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
