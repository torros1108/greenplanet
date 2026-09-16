import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdminRequest } from "@/lib/supabaseAdmin";

type PublicPage = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: { title: string; body: string }[];
};

type PublicPageRow = PublicPage & { slug: string };

const pageRoutes = {
  kontakt: "contact",
  levering: "delivery",
  returnering: "returns",
  juridisk: "legal",
  handelsbetingelser: "terms",
  privatlivspolitik: "privacy",
  cookiepolitik: "cookies"
} as const;

type PublicRoute = keyof typeof pageRoutes;

const fallbackPages: Record<PublicRoute, PublicPage> = {
  kontakt: {
    eyebrow: "Kundeservice",
    title: "Kontakt Greenplanet",
    intro: "Har du spørgsmål til produkter, levering eller en ordre, er du altid velkommen til at kontakte os.",
    sections: [
      { title: "Kontaktoplysninger", body: "Greenplanet, CVR 44640376, Bøgevejen 6, 2850 Nærum. E-mail: hello@greenplanet.dk. Vi svarer normalt inden for 1-2 hverdage." },
      { title: "Hjælp til gavevalg", body: "Skriv gerne anledning, budget og ønsket leveringsdato. Så hjælper vi med at finde en passende gaveæske eller et udvalg til byg-selv." }
    ]
  },
  levering: {
    eyebrow: "Kundeservice",
    title: "Levering",
    intro: "Greenplanet kan sende gaveæsker direkte til modtager eller til dig, hvis du selv vil overrække gaven.",
    sections: [
      { title: "Leveringstid", body: "Lagervarer pakkes som udgangspunkt inden for 1-3 hverdage efter ordrebekræftelse. En ønsket leveringsdato er et ønske, indtil den er bekræftet." },
      { title: "Fragt", body: "Fragtprisen vises altid i checkout, før du går til betaling. Almindelig levering koster 49 kr." },
      { title: "Direkte til modtager", body: "Ved direkte gavelevering kan du angive modtagers navn, adresse, korttekst og leveringsnote. Pakken sendes uden prisbilag." }
    ]
  },
  returnering: {
    eyebrow: "Kundeservice",
    title: "Returnering og fortrydelse",
    intro: "Kontakt os altid først, så vi kan registrere returneringen og hjælpe med den rigtige løsning.",
    sections: [
      { title: "Fortrydelsesret", body: "Private kunder har som udgangspunkt 14 dages fortrydelsesret ved køb online. Fristen regnes normalt fra den dag, varen modtages." },
      { title: "Sådan returnerer du", body: "Send en mail med ordrenummer, navn og de varer, du ønsker at returnere. Varen skal sendes forsvarligt pakket og i væsentligt samme stand som ved modtagelsen." },
      { title: "Returfragt", body: "Du betaler som udgangspunkt selv returfragten, medmindre returneringen skyldes en fejl fra Greenplanet eller andet er aftalt skriftligt." },
      { title: "Undtagelser", body: "Forseglede pleje- og hygiejneprodukter kan miste fortrydelsesretten, hvis forseglingen brydes. Individuelt tilpassede varer kan være undtaget." }
    ]
  },
  juridisk: {
    eyebrow: "Jura",
    title: "Juridisk overblik",
    intro: "Her finder du Greenplanets virksomhedsoplysninger og de vigtigste vilkår for brug af webshoppen.",
    sections: [
      { title: "Virksomhedsoplysninger", body: "Greenplanet, CVR 44640376, Bøgevejen 6, 2850 Nærum, hello@greenplanet.dk." },
      { title: "Vilkår og persondata", body: "Læs handelsbetingelser, privatlivspolitik og cookiepolitik via links nederst på siden." }
    ]
  },
  handelsbetingelser: {
    eyebrow: "Jura",
    title: "Handelsbetingelser",
    intro: "Disse betingelser gælder for køb og bestillinger hos Greenplanet.",
    sections: [
      { title: "Virksomhed", body: "Greenplanet, CVR 44640376, Bøgevejen 6, 2850 Nærum, hello@greenplanet.dk." },
      { title: "Bestilling og betaling", body: "Aftalen er bindende, når betalingen er gennemført, og du har modtaget en ordrebekræftelse. Alle priser vises i danske kroner, og fragt vises før betaling. Betaling gennemføres via Stripe." },
      { title: "Levering", body: "Gaver kan sendes til bestiller eller direkte til modtager. Almindelig levering koster 49 kr. En ønsket leveringsdato er ikke garanteret, før den er bekræftet." },
      { title: "Fortrydelse og returnering", body: "Som forbruger har du som udgangspunkt 14 dages fortrydelsesret. Du skal give Greenplanet besked inden fristens udløb og returnere varen forsvarligt pakket." },
      { title: "Reklamation", body: "Købelovens regler om mangler gælder. Kontakt os hurtigst muligt med ordrenummer, beskrivelse og gerne billeder, hvis en vare er beskadiget, forkert eller mangelfuld." },
      { title: "Klageadgang", body: "Hvis vi ikke finder en løsning, kan du klage til Nævnenes Hus, Toldboden 2, 8800 Viborg, via naevneneshus.dk." }
    ]
  },
  privatlivspolitik: {
    eyebrow: "Jura",
    title: "Privatlivspolitik",
    intro: "Vi behandler personoplysninger for at kunne håndtere bestillinger, levering, kundeservice og drift af webshoppen.",
    sections: [
      { title: "Dataansvarlig", body: "Greenplanet, CVR 44640376, Bøgevejen 6, 2850 Nærum, hello@greenplanet.dk, er dataansvarlig." },
      { title: "Oplysninger og formål", body: "Vi kan behandle navn, kontaktoplysninger, adresser, ordreindhold, korttekst, betalingsstatus og leveringsnoter for at opfylde din bestilling og yde kundeservice." },
      { title: "Deling og opbevaring", body: "Nødvendige oplysninger kan deles med betalings-, fragt-, hosting- og regnskabsleverandører. Oplysninger opbevares kun så længe, det er nødvendigt eller krævet ved lov." },
      { title: "Dine rettigheder", body: "Du kan kontakte os om indsigt, rettelse, sletning, begrænsning eller indsigelse, når betingelserne er opfyldt. Du kan klage til Datatilsynet." }
    ]
  },
  cookiepolitik: {
    eyebrow: "Jura",
    title: "Cookiepolitik",
    intro: "Her kan du læse, hvordan Greenplanet bruger cookies og lokal lagring på webshoppen.",
    sections: [
      { title: "Nødvendige funktioner", body: "Vi bruger nødvendige cookies og lokal lagring til blandt andet kurv, checkout, sikkerhed og teknisk drift." },
      { title: "Statistik", body: "Google Analytics og intern besøgs- og kurvstatistik aktiveres kun, hvis du accepterer statistikcookies." },
      { title: "Ændring af samtykke", body: "Du kan altid åbne cookieindstillingerne i footeren og ændre eller trække dit samtykke tilbage." }
    ]
  }
};

async function getPublicPage(slug: PublicRoute) {
  const databaseSlug = pageRoutes[slug];
  try {
    const rows = await supabaseAdminRequest<PublicPageRow[]>(
      `pages?slug=eq.${databaseSlug}&select=slug,title,eyebrow,intro,sections&limit=1`
    );
    return rows[0] || fallbackPages[slug];
  } catch {
    return fallbackPages[slug];
  }
}

export function generateStaticParams() {
  return Object.keys(pageRoutes).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!(slug in pageRoutes)) return { robots: { index: false, follow: false } };
  const page = await getPublicPage(slug as PublicRoute);
  return {
    title: page.title,
    description: page.intro,
    alternates: { canonical: `/${slug}` }
  };
}

export default async function PublicPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(slug in pageRoutes)) notFound();
  const page = await getPublicPage(slug as PublicRoute);

  return (
    <main className="public-page-shell">
      <header className="public-page-header">
        <Link href="/" aria-label="Greenplanet forside">
          <img src="/brand/greenplanet-logo-white-crop.png" alt="Greenplanet" />
        </Link>
        <nav aria-label="Genveje">
          <Link href="/#giftboxes">Gaveæsker</Link>
          <Link href="/#products">Produkter</Link>
          <Link href="/#builder">Byg selv</Link>
        </nav>
      </header>
      <article className="public-page-content">
        <Link className="btn public-page-back" href="/">Tilbage til shoppen</Link>
        <span className="eyebrow">{page.eyebrow}</span>
        <h1>{page.title}</h1>
        <p className="lead">{page.intro}</p>
        <div className="policy-grid">
          {page.sections.map((section) => (
            <section className="policy-block" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </article>
      <footer className="public-page-footer">
        <span>Greenplanet · CVR 44640376 · Bøgevejen 6, 2850 Nærum</span>
        <a href="mailto:hello@greenplanet.dk">hello@greenplanet.dk</a>
      </footer>
    </main>
  );
}
