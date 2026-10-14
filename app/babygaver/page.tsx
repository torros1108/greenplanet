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
  return <StoreCategoryPage current="babygaver" eyebrow="Baby & barsel" title="Babygaver og barselsgaver til den første tid" intro="Vælg mellem babypleje, bløde tekstiler og økologiske produkter til babyshower, barselsbesøg, dåb og velkommen-til-verden gaver." supportingText="Produkterne kan købes enkeltvis, og mange kan også lægges i en personlig gaveæske med kort og direkte levering til modtageren." products={products} />;
}
