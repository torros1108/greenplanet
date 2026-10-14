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
  return <StoreCategoryPage current="wellness" eyebrow="Velvære" title="Naturlig wellness og hudpleje" intro="Udforsk naturlige olier, rosenvand, ler og hudpleje til hjemmepleje, selvforkælelse og personlige gaver." supportingText="Se ingredienser, størrelse og anvendelse på den enkelte produktside, eller sammensæt produkterne i din egen Greenplanet-gaveæske." products={products} />;
}
