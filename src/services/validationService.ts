/**
 * Service de validation des données
 * Suivant les bonnes pratiques de validation côté client
 */

import { CreateGuestData, UpdateGuestData, ValidationResult, ValidationError } from '../types/guest';

class ValidationService {
  /**
   * Valide les données d'un nouvel invité
   */
  validateCreateGuest(data: CreateGuestData): ValidationResult {
    const errors: ValidationError[] = [];

    // Validation du nom complet
    if (!data.fullName || typeof data.fullName !== 'string') {
      errors.push({
        field: 'fullName',
        message: 'Le nom complet est requis'
      });
    } else if (data.fullName.trim().length < 2) {
      errors.push({
        field: 'fullName',
        message: 'Le nom doit contenir au moins 2 caractères'
      });
    } else if (data.fullName.trim().length > 100) {
      errors.push({
        field: 'fullName',
        message: 'Le nom ne peut pas dépasser 100 caractères'
      });
    }

    // Validation du nom de table
    if (!data.tableName || typeof data.tableName !== 'string') {
      errors.push({
        field: 'tableName',
        message: 'Le nom de la table est requis'
      });
    } else if (data.tableName.trim().length < 1) {
      errors.push({
        field: 'tableName',
        message: 'Le nom de la table ne peut pas être vide'
      });
    } else if (data.tableName.trim().length > 50) {
      errors.push({
        field: 'tableName',
        message: 'Le nom de la table ne peut pas dépasser 50 caractères'
      });
    }

    // Validation du nombre d'accompagnants
    if (typeof data.companions !== 'number') {
      errors.push({
        field: 'companions',
        message: 'Le nombre d\'accompagnants doit être un nombre'
      });
    } else if (data.companions < 0) {
      errors.push({
        field: 'companions',
        message: 'Le nombre d\'accompagnants ne peut pas être négatif'
      });
    } else if (data.companions > 10) {
      errors.push({
        field: 'companions',
        message: 'Le nombre d\'accompagnants ne peut pas dépasser 10'
      });
    } else if (!Number.isInteger(data.companions)) {
      errors.push({
        field: 'companions',
        message: 'Le nombre d\'accompagnants doit être un nombre entier'
      });
    }

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
      if (typeof data.fullName !== 'string') {
        errors.push({
          field: 'fullName',
          message: 'Le nom complet doit être une chaîne de caractères'
        });
      } else if (data.fullName.trim().length < 2) {
        errors.push({
          field: 'fullName',
          message: 'Le nom doit contenir au moins 2 caractères'
        });
      } else if (data.fullName.trim().length > 100) {
        errors.push({
          field: 'fullName',
          message: 'Le nom ne peut pas dépasser 100 caractères'
        });
      }
    }

    // Validation du nom de table (optionnel)
    if (data.tableName !== undefined) {
      if (typeof data.tableName !== 'string') {
        errors.push({
          field: 'tableName',
          message: 'Le nom de la table doit être une chaîne de caractères'
        });
      } else if (data.tableName.trim().length < 1) {
        errors.push({
          field: 'tableName',
          message: 'Le nom de la table ne peut pas être vide'
        });
      } else if (data.tableName.trim().length > 50) {
        errors.push({
          field: 'tableName',
          message: 'Le nom de la table ne peut pas dépasser 50 caractères'
        });
      }
    }

    // Validation du nombre d'accompagnants (optionnel)
    if (data.companions !== undefined) {
      if (typeof data.companions !== 'number') {
        errors.push({
          field: 'companions',
          message: 'Le nombre d\'accompagnants doit être un nombre'
        });
      } else if (data.companions < 0) {
        errors.push({
          field: 'companions',
          message: 'Le nombre d\'accompagnants ne peut pas être négatif'
        });
      } else if (data.companions > 10) {
        errors.push({
          field: 'companions',
          message: 'Le nombre d\'accompagnants ne peut pas dépasser 10'
        });
      } else if (!Number.isInteger(data.companions)) {
        errors.push({
          field: 'companions',
          message: 'Le nombre d\'accompagnants doit être un nombre entier'
        });
      }
    }

    // Validation du statut de présence (optionnel)
    if (data.isPresent !== undefined && typeof data.isPresent !== 'boolean') {
      errors.push({
        field: 'isPresent',
        message: 'Le statut de présence doit être un booléen'
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

    // Nettoyer le nom complet
    if ('fullName' in sanitized && typeof sanitized.fullName === 'string') {
      sanitized.fullName = sanitized.fullName.trim();
    }

    // Nettoyer le nom de table
    if ('tableName' in sanitized && typeof sanitized.tableName === 'string') {
      sanitized.tableName = sanitized.tableName.trim();
    }

    // S'assurer que companions est un entier
    if ('companions' in sanitized && typeof sanitized.companions === 'number') {
      sanitized.companions = Math.floor(Math.abs(sanitized.companions));
    }

    return sanitized;
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