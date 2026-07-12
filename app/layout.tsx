import type { Metadata } from "next";
import Script from "next/script";
import "./styles.css";

const siteUrl = "https://www.greenplanet.dk";
const googleAnalyticsId = "G-53L8K46EHN";
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
    default: "Greenplanet | Barselsgaver, babygaver og naturlig wellness",
    template: "%s | Greenplanet"
  },
  description: "Greenplanet samler naturlige barselsgaver, babygaver og wellnessgaver i gaveæsker med personlig hilsen og direkte levering.",
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
    title: "Greenplanet | Barselsgaver, babygaver og naturlig wellness",
    description: "Naturlige gaveæsker til baby, barsel og velvære med personlig hilsen og direkte levering.",
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
    title: "Greenplanet | Barselsgaver, babygaver og naturlig wellness",
    description: "Naturlige gaveæsker til baby, barsel og velvære med personlig hilsen og direkte levering.",
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
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId}');
          `}
        </Script>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
