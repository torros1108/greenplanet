import type { MetadataRoute } from "next";
import { loadPublicRouteEntries } from "@/lib/storefrontServer";

const siteUrl = "https://www.greenplanet.dk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { products, giftboxes } = await loadPublicRouteEntries();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...[
      ["gaveaesker", 0.9],
      ["babygaver", 0.9],
      ["wellness", 0.8],
      ["move", 0.8]
    ].map(([path, priority]) => ({
      url: `${siteUrl}/${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: priority as number
    })),
    ...["kontakt", "levering", "returnering", "juridisk", "handelsbetingelser", "privatlivspolitik", "cookiepolitik"].map((path) => ({
      url: `${siteUrl}/${path}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5
    }))
  ];
  const productRoutes = products.map(({ id, updatedAt }) => ({ url: `${siteUrl}/products/${id}`, lastModified: updatedAt ? new Date(updatedAt) : now, changeFrequency: "weekly" as const, priority: 0.8 }));
  const giftboxRoutes = giftboxes.map(({ id, updatedAt }) => ({ url: `${siteUrl}/giftboxes/${id}`, lastModified: updatedAt ? new Date(updatedAt) : now, changeFrequency: "weekly" as const, priority: 0.9 }));
  return [...staticRoutes, ...giftboxRoutes, ...productRoutes];
}
