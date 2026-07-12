import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"]
      }
    ],
    sitemap: "https://www.greenplanet.dk/sitemap.xml",
    host: "https://www.greenplanet.dk"
  };
}
