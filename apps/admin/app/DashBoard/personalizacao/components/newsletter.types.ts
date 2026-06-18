import { NewsletterTextPosition } from "@repo/dtos";

// Slide em edição no admin. `image` é string (key/URL já salva) OU File (novo,
// sobe no Save). `localId` serve só de key React — o backend regenera ids.
export interface EditableSlide {
  localId: string;
  image: string | File | undefined;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  textPosition: NewsletterTextPosition;
  textBgEnabled: boolean;
  textBgColor: string;
  textBgOpacity: number;
}

export const TEXT_POSITIONS: NewsletterTextPosition[][] = [
  ["top-left", "top-center", "top-right"],
  ["center-left", "center", "center-right"],
  ["bottom-left", "bottom-center", "bottom-right"],
];

export function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(full.substring(0, 2), 16) || 0;
  const g = parseInt(full.substring(2, 4), 16) || 0;
  const b = parseInt(full.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${Math.min(100, Math.max(0, opacity)) / 100})`;
}

// Classes flex para ancorar o bloco de texto conforme a posição escolhida.
export function positionToFlex(position: NewsletterTextPosition): {
  justify: string; // eixo vertical (container em coluna)
  align: string; // eixo horizontal
  textAlign: "left" | "center" | "right";
} {
  const [vertical, horizontal] = position.split("-") as [string, string];
  const justify =
    vertical === "top"
      ? "justify-start"
      : vertical === "bottom"
        ? "justify-end"
        : "justify-center";
  const align =
    horizontal === "left"
      ? "items-start"
      : horizontal === "right"
        ? "items-end"
        : "items-center";
  const textAlign =
    horizontal === "left" ? "left" : horizontal === "right" ? "right" : "center";
  return { justify, align, textAlign };
}
