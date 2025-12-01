/**
 * Service d'authentification simple avec code PIN
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const ADMIN_PIN_KEY = 'admin_pin';
const DEFAULT_PIN = '1234'; // PIN par défaut

export enum UserRole {
  GUEST = 'guest',
  ADMIN = 'admin'
}

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  expiresAt: number;
}

class AuthService {
  private authState: AuthState = {
    isAuthenticated: false,
    role: UserRole.GUEST,
    expiresAt: 0
  };

  /**
   * Initialise le service d'authentification
   */
  async initialize(): Promise<void> {
    try {
      // Vérifier si un PIN admin existe, sinon créer le PIN par défaut
      const existingPin = await AsyncStorage.getItem(ADMIN_PIN_KEY);
      if (!existingPin) {
        await AsyncStorage.setItem(ADMIN_PIN_KEY, DEFAULT_PIN);
      }
    } catch (error) {
      console.error('Error initializing auth service:', error);
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié comme admin
   */
  isAdmin(): boolean {
    return this.authState.isAuthenticated && 
           this.authState.role === UserRole.ADMIN && 
           Date.now() < this.authState.expiresAt;
  }

  /**
   * Authentifie l'utilisateur avec un PIN
   */
  async authenticateWithPin(pin: string): Promise<boolean> {
    try {
      const storedPin = await AsyncStorage.getItem(ADMIN_PIN_KEY);
      
      if (pin === storedPin) {
        this.authState = {
          isAuthenticated: true,
          role: UserRole.ADMIN,
          expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
        };
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error authenticating:', error);
      return false;
    }
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    this.authState = {
      isAuthenticated: false,
      role: UserRole.GUEST,
      expiresAt: 0
    };
  }

  /**
   * Change le PIN admin
   */
  async changePin(currentPin: string, newPin: string): Promise<boolean> {
    try {
      const storedPin = await AsyncStorage.getItem(ADMIN_PIN_KEY);
      
      if (currentPin !== storedPin) {
        return false;
      }

      if (newPin.length < 4) {
        throw new Error('Le PIN doit contenir au moins 4 chiffres');
      }

      await AsyncStorage.setItem(ADMIN_PIN_KEY, newPin);
      return true;
    } catch (error) {
      console.error('Error changing PIN:', error);
      throw error;
    }
  }

  // Variables pour gérer le modal PIN
  private pinResolver: ((value: boolean) => void) | null = null;
  public showPinModal = false;

  /**
   * Demande l'authentification admin
   */
  async requestAdminAuth(): Promise<boolean> {
    return new Promise((resolve) => {
      this.pinResolver = resolve;
      this.showPinModal = true;
    });
  }

  /**
   * Gère la soumission du PIN
   */
  async handlePinSubmit(pin: string): Promise<void> {
    if (!this.pinResolver) return;

    const isValid = await this.authenticateWithPin(pin);
    this.showPinModal = false;
    
    if (isValid) {
      this.pinResolver(true);
    } else {
      Alert.alert('Erreur', 'Code PIN incorrect');
      this.pinResolver(false);
    }
    
    this.pinResolver = null;
  }

  /**
   * Gère l'annulation du PIN
   */
  handlePinCancel(): void {
    if (this.pinResolver) {
      this.showPinModal = false;
      this.pinResolver(false);
      this.pinResolver = null;
    }
  }

  /**
   * Vérifie les permissions pour une action donnée
   */
  async checkPermission(action: 'delete' | 'mark_present' | 'mark_absent' | 'edit'): Promise<boolean> {
    // Actions qui nécessitent une authentification admin
    const adminActions = ['delete', 'mark_present', 'mark_absent'];
    
    if (adminActions.includes(action)) {
      if (this.isAdmin()) {
        return true;
      }
      
      return await this.requestAdminAuth();
    }
    
    // Les autres actions sont autorisées pour tous
    return true;
  }
}

export const authService = new AuthService();