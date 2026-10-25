import type { Metadata } from "next";
import StoreCategoryPage from "@/app/_components/StoreCategoryPage";
import { loadPublicProducts } from "@/lib/storefrontServer";

export const metadata: Metadata = {
  title: "Move | Activewear, leggings og sports-bh’er",
  description: "Shop Greenplanet Move med activewear, leggings, sports-bh’er, løbetoppe og bløde lag fra Believe Athletics og Offbeatmode.",
  alternates: { canonical: "/move" },
  openGraph: { title: "Greenplanet Move | Activewear til yoga og træning", description: "Activewear, leggings og sports-bh’er fra udvalgte brands.", url: "/move" }
};

export default async function MovePage() {
  const products = await loadPublicProducts("Move");
  return <StoreCategoryPage
    current="move"
    eyebrow="Greenplanet Move"
    title="Activewear til yoga, træning og hverdagsbevægelse"
    intro="Find leggings, sports-bh’er, løbetoppe, sweatshirts og bløde lag fra Believe Athletics og Offbeatmode."
    supportingText="Move samler behageligt træningstøj med tydelige størrelsesvalg, produktdetaljer og lagerstatus. Brug filtrene i shoppen, eller åbn et produkt for at vælge den rigtige variant."
    products={products}
    guideTitle="Find det rigtige activewear"
    guideIntro="Vælg efter aktivitet, pasform og det lag, du mangler. På produktsiderne kan du se tilgængelige størrelser og finde matchende dele."
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
