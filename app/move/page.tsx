import type { Metadata } from "next";
import StoreCategoryPage from "@/app/_components/StoreCategoryPage";
import { loadPublicProducts } from "@/lib/storefrontServer";

export const metadata: Metadata = {
  title: "Move | Yoga leggings, løbeleggings og athleisure",
  description: "Shop yoga leggings, løbeleggings, sports-bh’er, løbetoppe, cardigans og athleisure fra Believe Athletics og Offbeatmode hos Greenplanet Move.",
  alternates: { canonical: "/move" },
  openGraph: {
    title: "Greenplanet Move | Yoga leggings, løbeleggings og athleisure",
    description: "Activewear, yoga leggings, løbeleggings, sports-bh’er og bløde lag fra udvalgte brands.",
    url: "/move",
    images: [{ url: "/move/move-tropical-dark-hero-v1.png", width: 1536, height: 1024, alt: "Greenplanet Move activewear til yoga, løb og hverdag" }]
  }
};

export default async function MovePage() {
  const products = await loadPublicProducts("Move");
  return <StoreCategoryPage
    current="move"
    eyebrow="Greenplanet Move"
    title="Yoga leggings, løbeleggings og athleisure"
    intro="Find yoga leggings, løbeleggings, sports-bh’er, løbetoppe, sweatshirts og bløde lag fra Believe Athletics og Offbeatmode."
    supportingText="Move samler behageligt træningstøj med tydelige størrelsesvalg, produktdetaljer og lagerstatus. Gå direkte til leggings, toppe eller bløde lag, og åbn et produkt for at vælge størrelse."
    products={products}
    guideTitle="Find det rigtige træningstøj"
    guideIntro="Vælg yogabukser, løbetøj og bløde lag efter aktivitet og pasform. På produktsiderne kan du se tilgængelige størrelser og finde matchende dele."
    guide={[
      { title: "Yoga og rolig træning", body: "Vælg fleksible leggings og en støttende top, der følger bevægelsen uden at føles tung." },
      { title: "Løb og mere støtte", body: "Til løb er en tætsiddende sports-bh og løbeleggings med god støtte et praktisk udgangspunkt." },
      { title: "Athleisure i hverdagen", body: "Cardigans, hoodies og bløde lag gør det nemt at bruge træningstøjet før og efter træning eller som afslappet hverdagstøj." }
    ]}
    faqs={[
      { question: "Hvilke størrelser findes Move i?", answer: "Størrelserne varierer fra produkt til produkt. Åbn produktsiden for at se de størrelser og varianter, der aktuelt er tilgængelige." },
      { question: "Hvordan finder jeg en top, der passer til mine leggings?", answer: "Matchende produkter er knyttet sammen på produktsiderne, så du kan gå direkte fra leggings til en top i samme serie eller mønster." },
      { question: "Hvad er forskellen på yoga leggings og løbeleggings?", answer: "Yoga leggings er typisk valgt for fleksibilitet og bevægelsesfrihed, mens løbeleggings ofte har en mere tætsiddende pasform og ekstra støtte. Se produktbeskrivelsen og størrelsesvalgene på den enkelte vare." },
      { question: "Er Move kun til træning?", answer: "Nej. Sortimentet er valgt som activewear og athleisure, så flere dele også kan bruges til afslappede hverdage." }
    ]}
  />;
}
