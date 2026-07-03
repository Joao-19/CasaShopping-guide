"use client";
/* eslint-disable @next/next/no-img-element */
// <img> é proposital: o fallback depende de onError, que <Image> não expõe da
// mesma forma — e o domínio público de storage nem está nos remotePatterns.

import { useState } from "react";

interface StoreLogoProps {
  name: string;
  logoImage?: string | null;
  /** object-fit da imagem: "cover" (default) ou "contain". */
  fit?: "cover" | "contain";
  /** Classes extras aplicadas SÓ no bloco de iniciais (cor, tamanho, bg). */
  initialsClassName?: string;
  /** Quantas letras do nome nas iniciais (default 2). */
  initialsLength?: number;
}

/**
 * Logo de loja com fallback resiliente: mostra as iniciais quando não há
 * logo OU quando a imagem falha ao carregar (404/ORB/host inacessível).
 *
 * Centraliza o `.replace('localhost', NEXT_PUBLIC_API_HOST)` que estava
 * duplicado em StoresSection, StoreDetailsCard, stores/page e loja/[slug] —
 * onde a maioria NÃO tinha `onError`, então imagem quebrada virava espaço
 * em branco (ver frente de imagens jul/2026).
 */
export function StoreLogo({
  name,
  logoImage,
  fit = "cover",
  initialsClassName = "",
  initialsLength = 2,
}: StoreLogoProps) {
  const [errored, setErrored] = useState(false);

  const src =
    logoImage && logoImage.length > 2
      ? logoImage.replace(
          "localhost",
          process.env.NEXT_PUBLIC_API_HOST || "localhost",
        )
      : "";

  if (!src || errored) {
    return (
      <div
        className={`flex items-center justify-center w-full h-full font-bold select-none ${initialsClassName}`}
      >
        {name.substring(0, initialsLength).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setErrored(true)}
      className={`w-full h-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
    />
  );
}
