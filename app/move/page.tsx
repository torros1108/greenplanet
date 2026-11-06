import type { Metadata } from "next";
import StoreCategoryPage from "@/app/_components/StoreCategoryPage";
import { loadPublicProducts } from "@/lib/storefrontServer";

export const metadata: Metadata = {
  title: "Move | Yogabukser, leggings og træningstøj",
  description: "Shop yogabukser, yoga leggings, sports-bh’er, løbetoppe og athleisure fra Believe Athletics og Offbeatmode hos Greenplanet Move.",
  alternates: { canonical: "/move" },
  openGraph: {
    title: "Greenplanet Move | Yogabukser, leggings og træningstøj",
    description: "Activewear, yoga leggings, sports-bh’er og løbetøj fra udvalgte brands.",
    url: "/move",
    images: [{ url: "/move/move-tropical-dark-hero-v1.png", width: 1536, height: 1024, alt: "Greenplanet Move activewear til yoga, løb og hverdag" }]
  }
};

export default async function MovePage() {
  const products = await loadPublicProducts("Move");
  return <StoreCategoryPage
    current="move"
    eyebrow="Greenplanet Move"
    title="Yogabukser, leggings og activewear til bevægelse"
    intro="Find yoga leggings, sports-bh’er, løbetoppe, sweatshirts og bløde lag fra Believe Athletics og Offbeatmode."
    supportingText="Move samler behageligt træningstøj med tydelige størrelsesvalg, produktdetaljer og lagerstatus. Brug filtrene i shoppen, eller åbn et produkt for at vælge den rigtige variant."
    products={products}
    guideTitle="Find det rigtige træningstøj"
    guideIntro="Vælg yogabukser, løbetøj og bløde lag efter aktivitet og pasform. På produktsiderne kan du se tilgængelige størrelser og finde matchende dele."
    guide={[
      { title: "Yoga og rolig træning", body: "Vælg fleksible leggings og en støttende top, der følger bevægelsen uden at føles tung." },
      { title: "Løb og mere støtte", body: "Til løb er en tætsiddende sports-bh og leggings med god støtte et praktisk udgangspunkt." },
      { title: "Athleisure i hverdagen", body: "Cardigans, hoodies og bløde lag gør det nemt at bruge træningstøjet før og efter træning eller som afslappet hverdagstøj." }
    ]}
    faqs={[
      { question: "Hvilke størrelser findes Move i?", answer: "Størrelserne varierer fra produkt til produkt. Åbn produktsiden for at se de størrelser og varianter, der aktuelt er tilgængelige." },
      { question: "Hvordan finder jeg en top, der passer til mine leggings?", answer: "Matchende produkter er knyttet sammen på produktsiderne, så du kan gå direkte fra leggings til en top i samme serie eller mønster." },
      { question: "Er Move kun til træning?", answer: "Nej. Sortimentet er valgt som activewear og athleisure, så flere dele også kan bruges til afslappede hverdage." }
    ]}
  />;
}
