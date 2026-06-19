import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";
import { GlobalErrorListener } from "../components/GlobalErrorListener";
import { GoogleTagManagerScript, GoogleTagManagerNoscript, GoogleAnalytics4Script } from "@repo/ui";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Guia Casashopping",
  description: "Casa Shopping Guia de Compras",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "";
  const gaId = process.env.NEXT_PUBLIC_GA4_ID || "";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleTagManagerScript gtmId={gtmId} />
        <GoogleAnalytics4Script gaId={gaId} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <GoogleTagManagerNoscript gtmId={gtmId} />
        <Providers>
          <GlobalErrorListener />
          {children}
        </Providers>
      </body>
    </html>
  );
}
