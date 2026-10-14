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
  return <StoreCategoryPage current="move" eyebrow="Greenplanet Move" title="Activewear til yoga, træning og hverdagsbevægelse" intro="Find leggings, sports-bh’er, løbetoppe, sweatshirts og bløde lag fra Believe Athletics og Offbeatmode." supportingText="Move samler behageligt træningstøj med tydelige størrelsesvalg, produktdetaljer og lagerstatus. Brug filtrene i shoppen, eller åbn et produkt for at vælge den rigtige variant." products={products} />;
}
