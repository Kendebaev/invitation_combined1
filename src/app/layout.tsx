import type { Metadata, Viewport } from "next";
import { config } from "@/data/config";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(config.seo.url),
  title: config.seo.title, description: config.seo.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "kk_KZ",
    url: "/",
    siteName: "Қос мерейтойға шақыру",
    title: config.seo.title,
    description: config.seo.description,
    images: [{ url: config.seo.image, width: 1200, height: 630, type: "image/jpeg", alt: config.seo.imageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: config.seo.title,
    description: config.seo.description,
    images: [{ url: config.seo.image, alt: config.seo.imageAlt }],
  },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FAF7F2" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="kk"><body>{children}</body></html>;
}
