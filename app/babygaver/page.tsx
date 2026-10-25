import type { Metadata } from "next";
import StoreCategoryPage from "@/app/_components/StoreCategoryPage";
import { loadPublicProducts } from "@/lib/storefrontServer";

export const metadata: Metadata = {
  title: "Babygaver og barselsgaver",
  description: "Find babygaver og barselsgaver med blid babypleje, økologiske tekstiler, babynest, håndklæder og små gaver til den første tid.",
  alternates: { canonical: "/babygaver" },
  openGraph: { title: "Babygaver og barselsgaver | Greenplanet", description: "Blid babypleje, økologiske tekstiler og brugbare gaver til baby og nye forældre.", url: "/babygaver" }
};

export default async function BabyGiftsPage() {
  const products = await loadPublicProducts("Baby & barsel");
  return <StoreCategoryPage
    current="babygaver"
    eyebrow="Baby & barsel"
    title="Babygaver og barselsgaver til den første tid"
    intro="Vælg mellem babypleje, bløde tekstiler og økologiske produkter til babyshower, barselsbesøg, dåb og velkommen-til-verden gaver."
    supportingText="Produkterne kan købes enkeltvis, og mange kan også lægges i en personlig gaveæske med kort og direkte levering til modtageren."
    products={products}
    guideTitle="Sådan vælger du en god barselsgave"
    guideIntro="Den bedste barselsgave passer til både familien og anledningen. Du kan vælge én brugbar babygave eller samle flere produkter i en gaveæske."
    guide={[
      { title: "Til den nyfødte", body: "Bløde tekstiler, babypleje og en nusseven er sikre valg, som kan bruges fra den første tid. Se størrelse, materiale og egenskaber på produktsiden." },
      { title: "Til den nybagte mor", body: "En barselsgave kan også være til mor. Vælg pleje, wellness eller en gaveæske, der giver plads til en lille pause i en travl hverdag." },
      { title: "Send direkte", body: "Du kan sende gaven direkte til familien, tilføje modtagerens navn og skrive en personlig korttekst. Pakken sendes uden prisbilag." }
    ]}
    faqs={[
      { question: "Hvad giver man i barselsgave?", answer: "En god barselsgave er ofte noget brugbart til baby eller mor, for eksempel bløde tekstiler, babypleje, en nusseven eller en færdig gaveæske med flere små produkter." },
      { question: "Kan barselsgaven sendes direkte til modtageren?", answer: "Ja. I checkout kan du angive modtagerens navn og adresse, skrive en korttekst og tilføje en leveringsnote. Gaven sendes uden prisbilag." },
      { question: "Kan jeg selv sammensætte en babygaveæske?", answer: "Ja. Under Byg selv kan du vælge produkter, se den løbende pris og tilføje en personlig hilsen, før gaveæsken lægges i kurven." }
    ]}
  />;
}
