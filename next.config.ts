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
      },
      {
        source: "/products/okologisk-babyhandklaede-med-haette-rabbit-safir",
        destination: "/babygaver",
        permanent: true
      },
      {
        source: "/products/marokkansk-ghassoul-lerpulver-100-naturlig",
        destination: "/products/p12",
        permanent: true
      },
      {
        source: "/products/arganolie-100-organisk-og-koldpresset",
        destination: "/products/p14",
        permanent: true
      },
      {
        source: "/products/hybenolie-100-organisk-og-koldpresset",
        destination: "/products/p15",
        permanent: true
      },
      {
        source: "/products/jojobaolie-100-organisk-og-koldpresset",
        destination: "/products/p16",
        permanent: true
      },
      {
        source: "/products/linned-babynest-beige-5-farver",
        destination: "/products/p2",
        permanent: true
      },
      {
        source: "/barselsgaver",
        destination: "/gaveaesker",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
