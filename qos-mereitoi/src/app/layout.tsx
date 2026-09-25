import type { Metadata, Viewport } from "next";
import { config } from "@/data/config";
import "./globals.css";
export const metadata: Metadata = {
  title: config.seo.title, description: config.seo.description,
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FAF7F2" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="kk"><body>{children}</body></html>;
}
