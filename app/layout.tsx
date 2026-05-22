import type { Metadata, Viewport } from "next";
import { NetworkStatus } from "@/components/NetworkStatus";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://toilet-finder.vercel.app"),
  title: {
    default: "Toilet Finder / 近くのトイレマップ",
    template: "%s | Toilet Finder"
  },
  description: "現在地から近いトイレをすばやく探せるスマホファーストWebアプリ",
  applicationName: "Toilet Finder",
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
    title: "Toilet Finder",
    statusBarStyle: "default"
  },
  openGraph: {
    title: "Toilet Finder / 近くのトイレマップ",
    description: "現在地・地名・地図から近くのトイレをすばやく探せるスマホファーストWebアプリ",
    url: "/",
    siteName: "Toilet Finder",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "Toilet Finder app icon"
      }
    ],
    locale: "ja_JP",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Toilet Finder / 近くのトイレマップ",
    description: "現在地・地名・地図から近くのトイレをすばやく探せるスマホファーストWebアプリ",
    images: ["/icons/icon-512.png"]
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
