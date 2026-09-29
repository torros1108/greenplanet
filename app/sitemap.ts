import type { MetadataRoute } from "next";
import { loadPublicRouteIds } from "@/lib/storefrontServer";

const siteUrl = "https://www.greenplanet.dk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { productIds, giftboxIds } = await loadPublicRouteIds();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...["kontakt", "levering", "returnering", "juridisk", "handelsbetingelser", "privatlivspolitik", "cookiepolitik"].map((path) => ({
      url: `${siteUrl}/${path}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5
    }))
  ];
  const productRoutes = productIds.map((id) => ({ url: `${siteUrl}/products/${id}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 }));
  const giftboxRoutes = giftboxIds.map((id) => ({ url: `${siteUrl}/giftboxes/${id}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 }));
  return [...staticRoutes, ...giftboxRoutes, ...productRoutes];
}