/**
 * Service d'authentification admin avec code PIN
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_PIN_KEY = '@admin_pin';
const DEFAULT_PIN = '1234'; // Code par défaut

class AdminAuthService {
  private cachedPin: string | null = null;

  /**
   * Initialise le code PIN par défaut si aucun n'existe
   */
  async initialize(): Promise<void> {
    const existingPin = await this.getPin();
    if (!existingPin) {
      await this.setPin(DEFAULT_PIN);
      console.log('🔐 Admin PIN initialized with default code');
    }
  }

  /**
   * Récupère le code PIN stocké
   */
  async getPin(): Promise<string | null> {
    if (this.cachedPin) {
      return this.cachedPin;
    }

    try {
      const pin = await AsyncStorage.getItem(ADMIN_PIN_KEY);
      if (pin) {
        this.cachedPin = pin;
      }
      return pin;
    } catch (error) {
      console.error('Error getting admin PIN:', error);
      return null;
    }
  }

  /**
   * Définit un nouveau code PIN
   */
  async setPin(newPin: string): Promise<boolean> {
    try {
      // Validation du PIN (4 chiffres)
      if (!/^\d{4}$/.test(newPin)) {
        throw new Error('Le code doit contenir exactement 4 chiffres');
      }

      await AsyncStorage.setItem(ADMIN_PIN_KEY, newPin);
      this.cachedPin = newPin;
      console.log('🔐 Admin PIN updated successfully');
      return true;
    } catch (error) {
      console.error('Error setting admin PIN:', error);
      return false;
    }
  }

  /**
   * Vérifie si le code PIN est correct
   */
  async verifyPin(inputPin: string): Promise<boolean> {
    const storedPin = await this.getPin();
    return storedPin === inputPin;
  }

  /**
   * Réinitialise le code PIN au code par défaut
   */
  async resetPin(): Promise<boolean> {
    return await this.setPin(DEFAULT_PIN);
  }

  /**
   * Vérifie si un code PIN a été défini
   */
  async hasPin(): Promise<boolean> {
    const pin = await this.getPin();
    return pin !== null;
  }
}

export const adminAuthService = new AdminAuthService();
