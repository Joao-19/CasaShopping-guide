export const formatPhone = (value: string): string => {
  // Remove non-numeric characters
  const numbers = value.replace(/\D/g, "");

  // Limit to 11 digits (2 area + 9 number)
  const limited = numbers.substring(0, 11);

  // Apply mask (XX) XXXXX-XXXX
  if (limited.length <= 2) return limited;
  if (limited.length <= 7)
    return `(${limited.substring(0, 2)}) ${limited.substring(2)}`;
  return `(${limited.substring(0, 2)}) ${limited.substring(2, 7)}-${limited.substring(7)}`;
};

export const cleanPhone = (value: string): string => {
  return value.replace(/\D/g, "");
};
