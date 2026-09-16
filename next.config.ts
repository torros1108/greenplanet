import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true
  },
  async redirects() {
    return [
      {
        source: "/products/bubble-time-baby-shampoo-og-kropsvask",
        destination: "/products/p5",
        permanent: true
      },
      {
        source: "/products/bulgarsk-rosenvand-100-okologisk",
        destination: "/products/p13",
        permanent: true
      },
      {
        source: "/products/salig-ojeblik-4-naerende-mave-ark-masker",
        destination: "/products/p4",
        permanent: true
      },
      {
        source: "/products/fransk-lyserod-ler-100-naturlig",
        destination: "/products/p11",
        permanent: true
      }
    ];
  }
};

export default nextConfig;