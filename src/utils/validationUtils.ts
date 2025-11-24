/**
 * Utilitaires de validation réutilisables
 */

// Expressions régulières communes
export const REGEX_PATTERNS = {
  // Nom avec caractères internationaux, espaces, tirets et apostrophes
  name: /^[a-zA-ZÀ-ÿ\s\-']+$/,
  
  // Nom de table alphanumérique avec espaces, tirets et underscores
  tableName: /^[a-zA-Z0-9À-ÿ\s\-_]+$/,
  
  // Email basique
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Téléphone français
  phone: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
  
  // Code postal français
  postalCode: /^(?:0[1-9]|[1-8]\d|9[0-8])\d{3}$/
} as const;

// Constantes de validation
export const VALIDATION_LIMITS = {
  fullName: { min: 2, max: 100 },
  tableName: { min: 1, max: 50 },
  companions: { min: 0, max: 10 },
  email: { min: 5, max: 254 },
  phone: { min: 10, max: 15 }
} as const;

// Messages d'erreur standardisés
export const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} est requis`,
  minLength: (field: string, min: number) => `${field} doit contenir au moins ${min} caractères`,
  maxLength: (field: string, max: number) => `${field} ne peut pas dépasser ${max} caractères`,
  pattern: (field: string) => `${field} contient des caractères non autorisés`,
  email: 'Adresse email invalide',
  phone: 'Numéro de téléphone invalide',
  number: (field: string) => `${field} doit être un nombre`,
  integer: (field: string) => `${field} doit être un nombre entier`,
  range: (field: string, min: number, max: number) => `${field} doit être entre ${min} et ${max}`,
  boolean: (field: string) => `${field} doit être vrai ou faux`,
  duplicate: (field: string) => `${field} existe déjà`,
  notFound: (field: string) => `${field} introuvable`
} as const;

/**
 * Valide si une chaîne respecte un pattern
 */
export const validatePattern = (value: string, pattern: RegExp): boolean => {
  return pattern.test(value.trim());
};

/**
 * Valide la longueur d'une chaîne
 */
export const validateLength = (value: string, min?: number, max?: number): boolean => {
  const length = value.trim().length;
  if (min !== undefined && length < min) return false;
  if (max !== undefined && length > max) return false;
  return true;
};

/**
 * Valide qu'un nombre est dans une plage
 */
export const validateRange = (value: number, min?: number, max?: number): boolean => {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
};

/**
 * Sanitise une chaîne de caractères
 */
export const sanitizeString = (value: string): string => {
  return value
    .trim()
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples
    .replace(/[<>\"'&]/g, '') // Supprimer les caractères dangereux
    .substring(0, 500); // Limiter la longueur maximale
};

/**
 * Convertit une chaîne en nombre entier sécurisé
 */
export const safeParseInt = (value: string, defaultValue = 0): number => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : Math.max(0, parsed);
};

/**
 * Vérifie si une valeur est vide
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};