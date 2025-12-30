import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPriceTier(tier: string | undefined | null): string {
  if (!tier) return "$$$";
  const upperTier = tier.toUpperCase();
  if (upperTier === "LOW") return "$";
  if (upperTier === "MEDIUM") return "$$";
  if (upperTier === "HIGH") return "$$$";
  return "$$$";
}
