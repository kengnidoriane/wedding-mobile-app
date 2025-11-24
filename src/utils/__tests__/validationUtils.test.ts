/**
 * Tests unitaires pour les utilitaires de validation
 */

import {
  validatePattern,
  validateLength,
  validateRange,
  sanitizeString,
  safeParseInt,
  isEmpty,
  REGEX_PATTERNS
} from '../validationUtils';

describe('ValidationUtils', () => {
  describe('validatePattern', () => {
    it('devrait valider un nom correct', () => {
      expect(validatePattern('Jean Dupont', REGEX_PATTERNS.name)).toBe(true);
      expect(validatePattern('Marie-Claire', REGEX_PATTERNS.name)).toBe(true);
      expect(validatePattern("O'Connor", REGEX_PATTERNS.name)).toBe(true);
    });

    it('devrait rejeter un nom avec des chiffres', () => {
      expect(validatePattern('Jean123', REGEX_PATTERNS.name)).toBe(false);
    });
  });

  describe('validateLength', () => {
    it('devrait valider une longueur correcte', () => {
      expect(validateLength('test', 2, 10)).toBe(true);
      expect(validateLength('ab', 2, 10)).toBe(true);
      expect(validateLength('abcdefghij', 2, 10)).toBe(true);
    });

    it('devrait rejeter une chaîne trop courte', () => {
      expect(validateLength('a', 2, 10)).toBe(false);
    });

    it('devrait rejeter une chaîne trop longue', () => {
      expect(validateLength('abcdefghijk', 2, 10)).toBe(false);
    });
  });

  describe('validateRange', () => {
    it('devrait valider un nombre dans la plage', () => {
      expect(validateRange(5, 0, 10)).toBe(true);
      expect(validateRange(0, 0, 10)).toBe(true);
      expect(validateRange(10, 0, 10)).toBe(true);
    });

    it('devrait rejeter un nombre hors plage', () => {
      expect(validateRange(-1, 0, 10)).toBe(false);
      expect(validateRange(11, 0, 10)).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('devrait nettoyer les espaces multiples', () => {
      expect(sanitizeString('  Jean   Dupont  ')).toBe('Jean Dupont');
    });

    it('devrait supprimer les caractères dangereux', () => {
      expect(sanitizeString('Jean<script>alert("hack")</script>')).toBe('Jeanalert("hack")');
    });

    it('devrait limiter la longueur', () => {
      const longString = 'a'.repeat(600);
      const result = sanitizeString(longString);
      expect(result.length).toBe(500);
    });
  });

  describe('safeParseInt', () => {
    it('devrait parser un nombre valide', () => {
      expect(safeParseInt('123')).toBe(123);
      expect(safeParseInt('0')).toBe(0);
    });

    it('devrait retourner la valeur par défaut pour un nombre invalide', () => {
      expect(safeParseInt('abc')).toBe(0);
      expect(safeParseInt('abc', 5)).toBe(5);
    });

    it('devrait retourner 0 pour un nombre négatif', () => {
      expect(safeParseInt('-5')).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('devrait détecter les valeurs vides', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it('devrait détecter les valeurs non vides', () => {
      expect(isEmpty('test')).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
      expect(isEmpty(0)).toBe(false);
    });
  });
});