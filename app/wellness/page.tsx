import type { Metadata } from "next";
import StoreCategoryPage from "@/app/_components/StoreCategoryPage";
import { loadPublicProducts } from "@/lib/storefrontServer";

export const metadata: Metadata = {
  title: "Naturlig wellness og hudpleje",
  description: "Find naturlige olier, rosenvand, ler og hudpleje til wellness, selvforkælelse og personlige gaveæsker.",
  alternates: { canonical: "/wellness" },
  openGraph: { title: "Naturlig wellness og hudpleje | Greenplanet", description: "Olier, rosenvand, ler og hudpleje til wellness og personlige gaver.", url: "/wellness" }
};

export default async function WellnessPage() {
  const products = await loadPublicProducts("Naturlig beauty");
  return <StoreCategoryPage
    current="wellness"
    eyebrow="Velvære"
    title="Naturlig wellness og hudpleje"
    intro="Udforsk naturlige olier, rosenvand, ler og hudpleje til hjemmepleje, selvforkælelse og personlige gaver."
    supportingText="Se ingredienser, størrelse og anvendelse på den enkelte produktside, eller sammensæt produkterne i din egen Greenplanet-gaveæske."
    products={products}
    guideTitle="Velvære som personlig gave"
    guideIntro="Vælg produkter efter modtagerens behov, og læs altid ingredienser og anvendelse på den enkelte produktside."
    guide={[
      { title: "Olier og rosenvand", body: "Naturlige olier og rosenvand kan bruges som en enkel del af den daglige hudpleje og passer godt i en personlig wellnessgave." },
      { title: "Ler og ansigtspleje", body: "Lerprodukter og masker er oplagte til hjemmepleje. Produktdetaljerne viser indhold, størrelse og anbefalet anvendelse." },
      { title: "Byg en wellnessgave", body: "Saml flere produkter i en gaveæske, se den samlede pris undervejs og afslut med en personlig korttekst." }
    ]}
    faqs={[
      { question: "Kan wellnessprodukterne lægges i en gaveæske?", answer: "Ja. Produkter markeret til gaveæsker kan vælges på Byg selv-siden og kombineres med korttekst og direkte levering." },
      { question: "Hvor finder jeg ingredienser og størrelse?", answer: "Ingredienser, størrelse, anvendelse og øvrige egenskaber står på den enkelte produktside, når oplysningerne findes i produktdata." },
      { question: "Kan jeg sende wellnessgaven direkte?", answer: "Ja. Du kan vælge en anden modtager i checkout og tilføje både korttekst og leveringsnote." }
    ]}
  />;
}
