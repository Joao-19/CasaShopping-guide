export const formatPhone = (value: string): string => {
  // Remove non-numeric characters
  const numbers = value.replace(/\D/g, "");

  // Limit to 11 digits
  const limited = numbers.substring(0, 11);

  // Special mask for 0800
  if (numbers.startsWith("0800")) {
    if (limited.length <= 4) return limited;
    if (limited.length <= 7)
      return `${limited.substring(0, 4)} ${limited.substring(4)}`;
    return `${limited.substring(0, 4)} ${limited.substring(4, 7)} ${limited.substring(7)}`;
  }

  // Apply mask
  if (limited.length <= 2) return limited;
  if (limited.length <= 6)
    return `(${limited.substring(0, 2)}) ${limited.substring(2)}`;

  // Logic for switching between standard (10) and mobile (11)
  // If it has 11 chars (entering the 11th digit), use 5-4 split
  // Otherwise use 4-4 split until it hits 11
  if (limited.length === 11) {
    return `(${limited.substring(0, 2)}) ${limited.substring(2, 7)}-${limited.substring(7)}`;
  }

  return `(${limited.substring(0, 2)}) ${limited.substring(2, 6)}-${limited.substring(6)}`;
};

export const cleanPhone = (value: string): string => {
  return value.replace(/\D/g, "");
};
