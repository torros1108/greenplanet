import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Greenplanet Baby & Wellness",
  description: "Naturlige barselsgaver, babygaver og wellnessgaver."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  );
}
