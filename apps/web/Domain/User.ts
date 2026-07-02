export default interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  createdAt: Date;
  isGuest?: boolean;
  // Consentimento LGPD. null/undefined = ainda não aceitou (cadastro
  // anterior ao aceite obrigatório) → dispara o gate no login.
  privacyAcceptedAt?: string | null;
}
