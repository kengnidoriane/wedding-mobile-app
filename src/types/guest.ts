/**
 * Types et interfaces pour la gestion des invités
 * Suivant les bonnes pratiques TypeScript
 */

import { Timestamp } from 'firebase/firestore';

// Interface de base pour un invité
export interface Guest {
  id: string;
  fullName: string;
  tableName: string;
  companions: number;
  isPresent: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  updatedBy: string;
}

// Type pour créer un nouvel invité (sans les champs auto-générés)
export interface CreateGuestData {
  fullName: string;
  tableName: string;
  companions: number;
}

// Type pour mettre à jour un invité
export interface UpdateGuestData {
  fullName?: string;
  tableName?: string;
  companions?: number;
  isPresent?: boolean;
}

// Interface pour les statistiques
export interface GuestStats {
  total: number;
  present: number;
  absent: number;
  totalCompanions: number;
  presentCompanions: number;
}

// Type pour les erreurs de validation
export interface ValidationError {
  field: string;
  message: string;
}

// Interface pour les résultats de validation
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Enum pour les statuts de synchronisation
export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error'
}

// Interface pour l'état de synchronisation
export interface SyncState {
  status: SyncStatus;
  lastSync: Date | null;
  error: string | null;
}

// Type pour les actions de l'utilisateur (pour l'audit)
export enum UserAction {
  CREATE_GUEST = 'create_guest',
  UPDATE_GUEST = 'update_guest',
  DELETE_GUEST = 'delete_guest',
  MARK_PRESENT = 'mark_present',
  MARK_ABSENT = 'mark_absent'
}

// Interface pour l'audit trail
export interface AuditLog {
  id: string;
  action: UserAction;
  guestId: string;
  userId: string;
  timestamp: Timestamp;
  oldValue?: any;
  newValue?: any;
}