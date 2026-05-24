import type { Metadata, Viewport } from "next";
import { NetworkStatus } from "@/components/NetworkStatus";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://toilet-finder-lovat.vercel.app"),
  title: {
    default: "ToiNavi / 近くのトイレマップ",
    template: "%s | ToiNavi"
  },
  description: "現在地から近くのトイレを探せる、レビュー付きのトイレマップアプリです。",
  applicationName: "ToiNavi",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }]
  },
  appleWebApp: {
    capable: true,
    title: "ToiNavi",
    statusBarStyle: "default"
  },
  openGraph: {
    title: "ToiNavi / 近くのトイレマップ",
    description: "現在地から近くのトイレを探せる、レビュー付きのトイレマップアプリです。",
    url: "/",
    siteName: "ToiNavi",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ToiNavi / 近くのトイレマップ"
      }
    ],
    locale: "ja_JP",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ToiNavi / 近くのトイレマップ",
    description: "現在地から近くのトイレを探せる、レビュー付きのトイレマップアプリです。",
    images: ["/og-image.png"]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body>
        <div className="app-shell mx-auto min-h-dvh w-full max-w-[430px] bg-white shadow-soft sm:my-6 sm:min-h-[860px] sm:overflow-hidden sm:rounded-[32px]">
          <NetworkStatus />
          {children}
        </div>
      </body>
    </html>
  );
}
