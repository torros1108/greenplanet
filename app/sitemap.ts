import type { MetadataRoute } from "next";
import { giftboxes, initialProducts } from "@/lib/data";

const siteUrl = "https://www.greenplanet.dk";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1
    }
  ];

  const productRoutes = initialProducts
    .filter((product) => product.status === "Live")
    .map((product) => ({
      url: `${siteUrl}/products/${product.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8
    }));

  const giftboxRoutes = giftboxes.map((giftbox) => ({
    url: `${siteUrl}/giftboxes/${giftbox.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9
  }));

  return [...staticRoutes, ...giftboxRoutes, ...productRoutes];
}
