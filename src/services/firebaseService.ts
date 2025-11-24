/**
 * Service Firebase pour la synchronisation des données
 * Implémentation avec les meilleures pratiques
 */

import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDocs,
  getDoc,
  writeBatch,
  Timestamp,
  DocumentSnapshot,
  QuerySnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { signInAnonymously, User } from 'firebase/auth';

import { db, auth, COLLECTIONS } from '../config/firebase';
import { 
  Guest, 
  CreateGuestData, 
  UpdateGuestData, 
  AuditLog, 
  UserAction,
  GuestStats 
} from '../types/guest';
import { validationService } from './validationService';

/**
 * Service principal pour la gestion des invités avec Firebase
 */
class FirebaseService {
  private currentUser: User | null = null;
  private guestListeners: Map<string, Unsubscribe> = new Map();

  /**
   * Initialise le service et authentifie l'utilisateur
   */
  async initialize(): Promise<void> {
    try {
      // Authentification anonyme pour simplifier
      const userCredential = await signInAnonymously(auth);
      this.currentUser = userCredential.user;
      console.log('🔥 Firebase service initialized with user:', this.currentUser.uid);
    } catch (error) {
      console.error('❌ Firebase service initialization failed:', error);
      throw new Error('Impossible de se connecter au service de synchronisation');
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  private ensureAuthenticated(): void {
    if (!this.currentUser) {
      throw new Error('Utilisateur non authentifié. Veuillez redémarrer l\'application.');
    }
  }

  /**
   * Convertit un document Firestore en objet Guest
   */
  private documentToGuest(doc: DocumentSnapshot): Guest | null {
    if (!doc.exists()) return null;

    const data = doc.data();
    return {
      id: doc.id,
      fullName: data.fullName,
      tableName: data.tableName,
      companions: data.companions,
      isPresent: data.isPresent || false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      updatedBy: data.updatedBy
    };
  }

  /**
   * Écoute les changements de la liste des invités en temps réel
   */
  subscribeToGuests(callback: (guests: Guest[]) => void): Unsubscribe {
    this.ensureAuthenticated();

    const guestsQuery = query(
      collection(db, COLLECTIONS.GUESTS),
      orderBy('fullName', 'asc')
    );

    const unsubscribe = onSnapshot(
      guestsQuery,
      (snapshot: QuerySnapshot) => {
        try {
          const guests: Guest[] = [];
          
          snapshot.forEach((doc) => {
            const guest = this.documentToGuest(doc);
            if (guest) {
              guests.push(guest);
            }
          });

          console.log(`🔄 Received ${guests.length} guests from Firestore`);
          callback(guests);
        } catch (error) {
          console.error('❌ Error processing guests snapshot:', error);
          callback([]);
        }
      },
      (error) => {
        console.error('❌ Error in guests subscription:', error);
        callback([]);
      }
    );

    // Stocker la référence pour pouvoir se désabonner
    const listenerId = Date.now().toString();
    this.guestListeners.set(listenerId, unsubscribe);

    return () => {
      unsubscribe();
      this.guestListeners.delete(listenerId);
    };
  }

  /**
   * Ajoute un nouvel invité
   */
  async addGuest(guestData: CreateGuestData): Promise<string> {
    this.ensureAuthenticated();

    // Validation des données
    const validation = validationService.validateCreateGuest(guestData);
    if (!validation.isValid) {
      throw new Error(validationService.formatValidationErrors(validation.errors));
    }

    // Sanitisation des données
    const sanitizedData = validationService.sanitizeGuestData(guestData) as CreateGuestData;

    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.GUESTS), {
        ...sanitizedData,
        isPresent: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedBy: this.currentUser!.uid
      });

      // Log de l'action
      await this.logAction(UserAction.CREATE_GUEST, docRef.id, null, sanitizedData);

      console.log('✅ Guest added successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding guest:', error);
      throw new Error('Impossible d\'ajouter l\'invité. Vérifiez votre connexion.');
    }
  }

  /**
   * Met à jour un invité existant
   */
  async updateGuest(guestId: string, updateData: UpdateGuestData): Promise<void> {
    this.ensureAuthenticated();

    // Validation de l'ID
    const idValidation = validationService.validateGuestId(guestId);
    if (!idValidation.isValid) {
      throw new Error(validationService.formatValidationErrors(idValidation.errors));
    }

    // Validation des données
    const validation = validationService.validateUpdateGuest(updateData);
    if (!validation.isValid) {
      throw new Error(validationService.formatValidationErrors(validation.errors));
    }

    // Sanitisation des données
    const sanitizedData = validationService.sanitizeGuestData(updateData) as UpdateGuestData;

    try {
      const guestRef = doc(db, COLLECTIONS.GUESTS, guestId);
      
      await updateDoc(guestRef, {
        ...sanitizedData,
        updatedAt: serverTimestamp(),
        updatedBy: this.currentUser!.uid
      });

      // Log de l'action
      await this.logAction(UserAction.UPDATE_GUEST, guestId, null, sanitizedData);

      console.log('✅ Guest updated successfully:', guestId);
    } catch (error) {
      console.error('❌ Error updating guest:', error);
      throw new Error('Impossible de mettre à jour l\'invité. Vérifiez votre connexion.');
    }
  }

  /**
   * Marque un invité comme présent
   */
  async markGuestPresent(guestId: string): Promise<void> {
    this.ensureAuthenticated();

    // Validation de l'ID
    const idValidation = validationService.validateGuestId(guestId);
    if (!idValidation.isValid) {
      throw new Error(validationService.formatValidationErrors(idValidation.errors));
    }

    try {
      const guestRef = doc(db, COLLECTIONS.GUESTS, guestId);
      
      await updateDoc(guestRef, {
        isPresent: true,
        updatedAt: serverTimestamp(),
        updatedBy: this.currentUser!.uid
      });

      // Log de l'action
      await this.logAction(UserAction.MARK_PRESENT, guestId, { isPresent: false }, { isPresent: true });

      console.log('✅ Guest marked as present:', guestId);
    } catch (error) {
      console.error('❌ Error marking guest present:', error);
      throw new Error('Impossible de marquer l\'invité comme présent.');
    }
  }

  /**
   * Marque un invité comme absent
   */
  async markGuestAbsent(guestId: string): Promise<void> {
    this.ensureAuthenticated();

    // Validation de l'ID
    const idValidation = validationService.validateGuestId(guestId);
    if (!idValidation.isValid) {
      throw new Error(validationService.formatValidationErrors(idValidation.errors));
    }

    try {
      const guestRef = doc(db, COLLECTIONS.GUESTS, guestId);
      
      await updateDoc(guestRef, {
        isPresent: false,
        updatedAt: serverTimestamp(),
        updatedBy: this.currentUser!.uid
      });

      // Log de l'action
      await this.logAction(UserAction.MARK_ABSENT, guestId, { isPresent: true }, { isPresent: false });

      console.log('✅ Guest marked as absent:', guestId);
    } catch (error) {
      console.error('❌ Error marking guest absent:', error);
      throw new Error('Impossible de marquer l\'invité comme absent.');
    }
  }

  /**
   * Supprime un invité
   */
  async deleteGuest(guestId: string): Promise<void> {
    this.ensureAuthenticated();

    // Validation de l'ID
    const idValidation = validationService.validateGuestId(guestId);
    if (!idValidation.isValid) {
      throw new Error(validationService.formatValidationErrors(idValidation.errors));
    }

    try {
      const guestRef = doc(db, COLLECTIONS.GUESTS, guestId);
      
      // Récupérer les données avant suppression pour le log
      const guestDoc = await getDoc(guestRef);
      const guestData = guestDoc.exists() ? guestDoc.data() : null;

      await deleteDoc(guestRef);

      // Log de l'action
      await this.logAction(UserAction.DELETE_GUEST, guestId, guestData, null);

      console.log('✅ Guest deleted successfully:', guestId);
    } catch (error) {
      console.error('❌ Error deleting guest:', error);
      throw new Error('Impossible de supprimer l\'invité.');
    }
  }

  /**
   * Récupère les statistiques des invités
   */
  async getGuestStats(): Promise<GuestStats> {
    this.ensureAuthenticated();

    try {
      const guestsSnapshot = await getDocs(collection(db, COLLECTIONS.GUESTS));
      
      let total = 0;
      let present = 0;
      let totalCompanions = 0;
      let presentCompanions = 0;

      guestsSnapshot.forEach((doc) => {
        const data = doc.data();
        total++;
        totalCompanions += data.companions || 0;

        if (data.isPresent) {
          present++;
          presentCompanions += data.companions || 0;
        }
      });

      return {
        total,
        present,
        absent: total - present,
        totalCompanions,
        presentCompanions
      };
    } catch (error) {
      console.error('❌ Error getting guest stats:', error);
      throw new Error('Impossible de récupérer les statistiques.');
    }
  }

  /**
   * Importe des invités en lot (migration depuis SQLite)
   */
  async importGuests(guests: CreateGuestData[]): Promise<void> {
    this.ensureAuthenticated();

    if (guests.length === 0) {
      throw new Error('Aucun invité à importer');
    }

    // Validation de tous les invités
    for (const guest of guests) {
      const validation = validationService.validateCreateGuest(guest);
      if (!validation.isValid) {
        throw new Error(`Invité invalide "${guest.fullName}": ${validationService.formatValidationErrors(validation.errors)}`);
      }
    }

    try {
      const batch = writeBatch(db);
      const guestsCollection = collection(db, COLLECTIONS.GUESTS);

      guests.forEach((guestData) => {
        const sanitizedData = validationService.sanitizeGuestData(guestData) as CreateGuestData;
        const docRef = doc(guestsCollection);
        
        batch.set(docRef, {
          ...sanitizedData,
          isPresent: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          updatedBy: this.currentUser!.uid
        });
      });

      await batch.commit();
      console.log(`✅ Successfully imported ${guests.length} guests`);
    } catch (error) {
      console.error('❌ Error importing guests:', error);
      throw new Error('Impossible d\'importer les invités.');
    }
  }

  /**
   * Log une action utilisateur pour l'audit
   */
  private async logAction(
    action: UserAction,
    guestId: string,
    oldValue: any,
    newValue: any
  ): Promise<void> {
    try {
      await addDoc(collection(db, COLLECTIONS.AUDIT_LOGS), {
        action,
        guestId,
        userId: this.currentUser!.uid,
        timestamp: serverTimestamp(),
        oldValue,
        newValue
      });
    } catch (error) {
      // Ne pas faire échouer l'opération principale si le log échoue
      console.warn('⚠️ Failed to log action:', error);
    }
  }

  /**
   * Nettoie les listeners actifs
   */
  cleanup(): void {
    this.guestListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.guestListeners.clear();
    console.log('🧹 Firebase service cleaned up');
  }
}

// Export d'une instance singleton
export const firebaseService = new FirebaseService();