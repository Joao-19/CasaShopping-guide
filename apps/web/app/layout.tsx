import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";
import { GlobalErrorListener } from "../components/GlobalErrorListener";
import { GoogleTagManagerScript, GoogleTagManagerNoscript } from "@repo/ui";


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

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleTagManagerScript gtmId={gtmId} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <GoogleTagManagerNoscript gtmId={gtmId} />
        <Providers>
          <GlobalErrorListener />
          {children}
        </Providers>
      </body>
    </html>
  );
}
