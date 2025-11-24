/**
 * Service de validation des données
 * Suivant les bonnes pratiques de validation côté client
 */

import { CreateGuestData, UpdateGuestData, ValidationResult, ValidationError } from '../types/guest';

// Constantes de validation
const VALIDATION_RULES = {
  fullName: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s\-']+$/
  },
  tableName: {
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9À-ÿ\s\-_]+$/
  },
  companions: {
    min: 0,
    max: 10
  }
} as const;

const ERROR_MESSAGES = {
  required: (field: string) => `${field} est requis`,
  minLength: (field: string, min: number) => `${field} doit contenir au moins ${min} caractères`,
  maxLength: (field: string, max: number) => `${field} ne peut pas dépasser ${max} caractères`,
  pattern: (field: string) => `${field} contient des caractères non autorisés`,
  number: (field: string) => `${field} doit être un nombre`,
  integer: (field: string) => `${field} doit être un nombre entier`,
  range: (field: string, min: number, max: number) => `${field} doit être entre ${min} et ${max}`,
  boolean: (field: string) => `${field} doit être vrai ou faux`
} as const;

class ValidationService {
  /**
   * Valide une chaîne de caractères
   */
  private validateString(
    value: unknown,
    field: string,
    rules: { minLength?: number; maxLength?: number; pattern?: RegExp; required?: boolean }
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    
    if (rules.required && (!value || typeof value !== 'string')) {
      errors.push({ field, message: ERROR_MESSAGES.required(field) });
      return errors;
    }
    
    if (typeof value === 'string') {
      const trimmed = value.trim();
      
      if (rules.minLength && trimmed.length < rules.minLength) {
        errors.push({ field, message: ERROR_MESSAGES.minLength(field, rules.minLength) });
      }
      
      if (rules.maxLength && trimmed.length > rules.maxLength) {
        errors.push({ field, message: ERROR_MESSAGES.maxLength(field, rules.maxLength) });
      }
      
      if (rules.pattern && trimmed && !rules.pattern.test(trimmed)) {
        errors.push({ field, message: ERROR_MESSAGES.pattern(field) });
      }
    }
    
    return errors;
  }

  /**
   * Valide un nombre
   */
  private validateNumber(
    value: unknown,
    field: string,
    rules: { min?: number; max?: number; integer?: boolean; required?: boolean }
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    
    if (rules.required && (value === undefined || value === null)) {
      errors.push({ field, message: ERROR_MESSAGES.required(field) });
      return errors;
    }
    
    if (value !== undefined && value !== null) {
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push({ field, message: ERROR_MESSAGES.number(field) });
        return errors;
      }
      
      if (rules.integer && !Number.isInteger(value)) {
        errors.push({ field, message: ERROR_MESSAGES.integer(field) });
      }
      
      if (rules.min !== undefined && value < rules.min) {
        errors.push({ field, message: ERROR_MESSAGES.range(field, rules.min, rules.max || Infinity) });
      }
      
      if (rules.max !== undefined && value > rules.max) {
        errors.push({ field, message: ERROR_MESSAGES.range(field, rules.min || -Infinity, rules.max) });
      }
    }
    
    return errors;
  }

  /**
   * Valide les données d'un nouvel invité
   */
  validateCreateGuest(data: CreateGuestData): ValidationResult {
    const errors: ValidationError[] = [];

    // Validation du nom complet
    errors.push(...this.validateString(data.fullName, 'Nom complet', {
      ...VALIDATION_RULES.fullName,
      required: true
    }));

    // Validation du nom de table
    errors.push(...this.validateString(data.tableName, 'Nom de table', {
      ...VALIDATION_RULES.tableName,
      required: true
    }));

    // Validation du nombre d'accompagnants
    errors.push(...this.validateNumber(data.companions, 'Nombre d\'accompagnants', {
      ...VALIDATION_RULES.companions,
      integer: true,
      required: true
    }));

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide les données de mise à jour d'un invité
   */
  validateUpdateGuest(data: UpdateGuestData): ValidationResult {
    const errors: ValidationError[] = [];

    // Validation du nom complet (optionnel)
    if (data.fullName !== undefined) {
      errors.push(...this.validateString(data.fullName, 'Nom complet', VALIDATION_RULES.fullName));
    }

    // Validation du nom de table (optionnel)
    if (data.tableName !== undefined) {
      errors.push(...this.validateString(data.tableName, 'Nom de table', VALIDATION_RULES.tableName));
    }

    // Validation du nombre d'accompagnants (optionnel)
    if (data.companions !== undefined) {
      errors.push(...this.validateNumber(data.companions, 'Nombre d\'accompagnants', {
        ...VALIDATION_RULES.companions,
        integer: true
      }));
    }

    // Validation du statut de présence (optionnel)
    if (data.isPresent !== undefined && typeof data.isPresent !== 'boolean') {
      errors.push({
        field: 'isPresent',
        message: ERROR_MESSAGES.boolean('Statut de présence')
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitise les données d'entrée
   */
  sanitizeGuestData(data: CreateGuestData | UpdateGuestData): CreateGuestData | UpdateGuestData {
    const sanitized = { ...data };

    // Nettoyer et normaliser le nom complet
    if ('fullName' in sanitized && typeof sanitized.fullName === 'string') {
      sanitized.fullName = this.sanitizeString(sanitized.fullName);
    }

    // Nettoyer et normaliser le nom de table
    if ('tableName' in sanitized && typeof sanitized.tableName === 'string') {
      sanitized.tableName = this.sanitizeString(sanitized.tableName);
    }

    // S'assurer que companions est un entier positif
    if ('companions' in sanitized && typeof sanitized.companions === 'number') {
      sanitized.companions = Math.max(0, Math.floor(sanitized.companions));
    }

    return sanitized;
  }

  /**
   * Sanitise une chaîne de caractères
   */
  private sanitizeString(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .replace(/[<>"'&]/g, '') // Supprimer les caractères dangereux
      .substring(0, 200); // Limiter la longueur
  }

  /**
   * Valide un ID d'invité
   */
  validateGuestId(id: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!id || typeof id !== 'string') {
      errors.push({
        field: 'id',
        message: 'L\'ID de l\'invité est requis'
      });
    } else if (id.trim().length === 0) {
      errors.push({
        field: 'id',
        message: 'L\'ID de l\'invité ne peut pas être vide'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validation en temps réel pour les champs de formulaire
   */
  validateField(fieldName: string, value: unknown): ValidationError | null {
    switch (fieldName) {
      case 'fullName':
        const nameErrors = this.validateString(value, 'Nom complet', {
          ...VALIDATION_RULES.fullName,
          required: true
        });
        return nameErrors[0] || null;
        
      case 'tableName':
        const tableErrors = this.validateString(value, 'Nom de table', {
          ...VALIDATION_RULES.tableName,
          required: true
        });
        return tableErrors[0] || null;
        
      case 'companions':
        const companionErrors = this.validateNumber(value, 'Nombre d\'accompagnants', {
          ...VALIDATION_RULES.companions,
          integer: true,
          required: true
        });
        return companionErrors[0] || null;
        
      default:
        return null;
    }
  }

  /**
   * Validation de lot pour l'import CSV
   */
  validateBatch(guests: CreateGuestData[]): { valid: CreateGuestData[]; invalid: Array<{ data: CreateGuestData; errors: ValidationError[] }> } {
    const valid: CreateGuestData[] = [];
    const invalid: Array<{ data: CreateGuestData; errors: ValidationError[] }> = [];

    guests.forEach(guest => {
      const validation = this.validateCreateGuest(guest);
      if (validation.isValid) {
        valid.push(this.sanitizeGuestData(guest) as CreateGuestData);
      } else {
        invalid.push({ data: guest, errors: validation.errors });
      }
    });

    return { valid, invalid };
  }

  /**
   * Formate les erreurs de validation pour l'affichage
   */
  formatValidationErrors(errors: ValidationError[]): string {
    if (errors.length === 0) return '';
    
    if (errors.length === 1) {
      return errors[0].message;
    }

    return errors.map((error, index) => `${index + 1}. ${error.message}`).join('\n');
  }
}

// Export d'une instance singleton
export const validationService = new ValidationService();