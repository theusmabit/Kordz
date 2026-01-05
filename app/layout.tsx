import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Kordz",
  description: "Advanced Chord Player for Musicians",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kordz",
  },
  icons: {
    apple: "/ios/AppIcon.appiconset/Icon-App-60x60@3x.png",
    icon: [
      { url: "/android/ic_launcher-web.png", sizes: "192x192", type: "image/png" },
      { url: "/android/ic_launcher-web.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/android/ic_launcher-web.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <SiteHeader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}