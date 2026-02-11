import "reflect-metadata";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";
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
  description: "Painel Administrativo do Guia Casashopping",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
