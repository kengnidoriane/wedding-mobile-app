/**
 * Utilitaires pour la gestion des erreurs
 */

export const ERROR_MESSAGES = {
  NETWORK: 'Problème de connexion réseau',
  FIREBASE: 'Erreur de synchronisation avec le serveur',
  VALIDATION: 'Données invalides',
  PERMISSION: 'Permission requise',
  UNKNOWN: 'Une erreur inconnue est survenue',
  QR_INVALID: 'QR code invalide ou corrompu',
  GUEST_NOT_FOUND: 'Invité non trouvé',
  ALREADY_PRESENT: 'Invité déjà marqué comme présent',
  CAMERA_ERROR: 'Erreur d\'accès à la caméra',
  FILE_ERROR: 'Erreur de lecture du fichier'
} as const;

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Mapper les erreurs Firebase communes
    if (error.message.includes('network')) {
      return ERROR_MESSAGES.NETWORK;
    }
    if (error.message.includes('permission')) {
      return ERROR_MESSAGES.PERMISSION;
    }
    if (error.message.includes('firebase') || error.message.includes('firestore')) {
      return ERROR_MESSAGES.FIREBASE;
    }
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return ERROR_MESSAGES.UNKNOWN;
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('network') ||
           error.message.toLowerCase().includes('connection') ||
           error.message.toLowerCase().includes('timeout');
  }
  return false;
};

export const isValidationError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('validation') ||
           error.message.toLowerCase().includes('invalid') ||
           error.message.toLowerCase().includes('required');
  }
  return false;
};