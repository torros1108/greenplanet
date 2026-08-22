import type { Metadata } from "next";
import AnalyticsConsent from "./AnalyticsConsent";
import "./styles.css";
import "./giftbox-detail.css";
import "./premium.css";

const siteUrl = "https://www.greenplanet.dk";
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Greenplanet",
  url: siteUrl,
  image: `${siteUrl}/brand/greenplanet-logo-mint.png`,
  email: "hello@greenplanet.dk",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bøgevejen 6",
    postalCode: "2850",
    addressLocality: "Nærum",
    addressCountry: "DK"
  },
  vatID: "DK44640376",
  sameAs: []
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Greenplanet | Barsels- og babygaver i flotte gaveæsker",
    template: "%s | Greenplanet"
  },
  description: "Greenplanet samler barselsgaver, babygaver og gaveæsker til nybagte mødre med personlig hilsen, gavekasse og direkte levering.",
  keywords: [
    "barselsgave",
    "babygave",
    "gaveæske",
    "gaveæske til nybagt mor",
    "barselsgave til mor",
    "babyshower gave",
    "Greenplanet"
  ],
  applicationName: "Greenplanet",
  authors: [{ name: "Greenplanet" }],
  creator: "Greenplanet",
  publisher: "Greenplanet",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "da_DK",
    url: siteUrl,
    siteName: "Greenplanet",
    title: "Greenplanet | Barsels- og babygaver i flotte gaveæsker",
    description: "Barselsgaver, babygaver og gaveæsker til nybagte mødre med personlig hilsen og direkte levering.",
    images: [
      {
        url: "/brand/greenplanet-logo-mint.png",
        width: 1792,
        height: 1536,
        alt: "Greenplanet logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Greenplanet | Barsels- og babygaver i flotte gaveæsker",
    description: "Barselsgaver, babygaver og gaveæsker til nybagte mødre med personlig hilsen og direkte levering.",
    images: ["/brand/greenplanet-logo-mint.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  category: "webshop"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <AnalyticsConsent />
      </body>
    </html>
  );
}
