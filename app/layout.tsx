import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toilet Finder / 近くのトイレマップ",
  description: "現在地から近いトイレをすばやく探せるスマホファーストWebアプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Toilet Finder",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f8fafc"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body>
        <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-white shadow-soft sm:my-6 sm:min-h-[860px] sm:overflow-hidden sm:rounded-[32px]">
          {children}
        </div>
      </body>
    </html>
  );
}
