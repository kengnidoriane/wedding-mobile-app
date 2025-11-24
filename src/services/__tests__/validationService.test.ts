/**
 * Tests unitaires pour le service de validation
 */

import { validationService } from '../validationService';
import { CreateGuestData, UpdateGuestData } from '../../types/guest';

describe('ValidationService', () => {
  describe('validateCreateGuest', () => {
    it('devrait valider un invité correct', () => {
      const validGuest: CreateGuestData = {
        fullName: 'Jean Dupont',
        tableName: 'Table 1',
        companions: 2
      };

      const result = validationService.validateCreateGuest(validGuest);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('devrait rejeter un nom vide', () => {
      const invalidGuest: CreateGuestData = {
        fullName: '',
        tableName: 'Table 1',
        companions: 2
      };

      const result = validationService.validateCreateGuest(invalidGuest);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('fullName');
    });

    it('devrait rejeter un nom trop court', () => {
      const invalidGuest: CreateGuestData = {
        fullName: 'A',
        tableName: 'Table 1',
        companions: 2
      };

      const result = validationService.validateCreateGuest(invalidGuest);
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('au moins 2 caractères');
    });

    it('devrait rejeter un nombre d\'accompagnants négatif', () => {
      const invalidGuest: CreateGuestData = {
        fullName: 'Jean Dupont',
        tableName: 'Table 1',
        companions: -1
      };

      const result = validationService.validateCreateGuest(invalidGuest);
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('companions');
    });

    it('devrait rejeter un nombre d\'accompagnants trop élevé', () => {
      const invalidGuest: CreateGuestData = {
        fullName: 'Jean Dupont',
        tableName: 'Table 1',
        companions: 15
      };

      const result = validationService.validateCreateGuest(invalidGuest);
      
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateUpdateGuest', () => {
    it('devrait valider une mise à jour partielle', () => {
      const updateData: UpdateGuestData = {
        fullName: 'Jean Martin'
      };

      const result = validationService.validateUpdateGuest(updateData);
      
      expect(result.isValid).toBe(true);
    });

    it('devrait valider une mise à jour vide', () => {
      const updateData: UpdateGuestData = {};

      const result = validationService.validateUpdateGuest(updateData);
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('sanitizeGuestData', () => {
    it('devrait nettoyer les espaces en trop', () => {
      const dirtyData: CreateGuestData = {
        fullName: '  Jean   Dupont  ',
        tableName: '  Table 1  ',
        companions: 2
      };

      const cleaned = validationService.sanitizeGuestData(dirtyData) as CreateGuestData;
      
      expect(cleaned.fullName).toBe('Jean Dupont');
      expect(cleaned.tableName).toBe('Table 1');
    });

    it('devrait corriger un nombre d\'accompagnants négatif', () => {
      const dirtyData: CreateGuestData = {
        fullName: 'Jean Dupont',
        tableName: 'Table 1',
        companions: -2
      };

      const cleaned = validationService.sanitizeGuestData(dirtyData) as CreateGuestData;
      
      expect(cleaned.companions).toBe(0);
    });
  });

  describe('validateField', () => {
    it('devrait valider un nom correct', () => {
      const error = validationService.validateField('fullName', 'Jean Dupont');
      expect(error).toBeNull();
    });

    it('devrait retourner une erreur pour un nom invalide', () => {
      const error = validationService.validateField('fullName', 'A');
      expect(error).not.toBeNull();
      expect(error?.message).toContain('au moins 2 caractères');
    });
  });

  describe('validateBatch', () => {
    it('devrait séparer les invités valides et invalides', () => {
      const guests: CreateGuestData[] = [
        { fullName: 'Jean Dupont', tableName: 'Table 1', companions: 2 },
        { fullName: 'A', tableName: 'Table 2', companions: 1 }, // Nom trop court
        { fullName: 'Marie Martin', tableName: 'Table 3', companions: 0 }
      ];

      const result = validationService.validateBatch(guests);
      
      expect(result.valid).toHaveLength(2);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0].data.fullName).toBe('A');
    });
  });
});