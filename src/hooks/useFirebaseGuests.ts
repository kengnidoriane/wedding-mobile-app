/**
 * Hook personnalisé pour la gestion des invités avec Firebase
 * Suivant les bonnes pratiques React Hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';

import { firebaseService } from '../services/firebaseService';
import { offlineService } from '../services/offlineService';
import { syncService } from '../services/syncService';
import { useErrorHandler } from './useErrorHandler';
import { useLoading } from './useLoading';
import { useNetworkStatus } from './useNetworkStatus';
import { 
  Guest, 
  CreateGuestData, 
  UpdateGuestData, 
  SyncStatus, 
  SyncState,
  GuestStats 
} from '../types/guest';

interface UseFirebaseGuestsReturn {
  // État des données
  guests: Guest[];
  stats: GuestStats | null;
  
  // État de synchronisation
  syncState: SyncState;
  loading: boolean;
  error: string | null;
  
  // Gestion d'erreurs standardisée
  showError: (error: unknown, context?: string) => void;
  showAlert: (error: unknown, context?: string) => void;
  clearError: () => void;
  
  // États de chargement standardisés
  isLoading: (key?: string) => boolean;
  withLoading: <T>(key: string, asyncFn: () => Promise<T>) => Promise<T>;
  
  // Mode hors-ligne
  isOnline: boolean | null;
  pendingActionsCount: number;
  syncPendingActions: () => Promise<void>;
  
  // Actions
  addGuest: (guestData: CreateGuestData) => Promise<void>;
  updateGuest: (guestId: string, updateData: UpdateGuestData) => Promise<void>;
  deleteGuest: (guestId: string) => Promise<void>;
  markPresent: (guestId: string) => Promise<void>;
  markAbsent: (guestId: string) => Promise<void>;
  refreshStats: () => Promise<void>;
  importGuests: (guests: CreateGuestData[]) => Promise<void>;
  
  // Utilitaires
  findGuestById: (id: string) => Guest | undefined;
  findGuestsByTable: (tableName: string) => Guest[];
  clearError: () => void;
}

/**
 * Hook principal pour la gestion des invités avec Firebase
 */
export const useFirebaseGuests = (): UseFirebaseGuestsReturn => {
  // État des données
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<GuestStats | null>(null);
  
  // État de synchronisation
  const [syncState, setSyncState] = useState<SyncState>({
    status: SyncStatus.IDLE,
    lastSync: null,
    error: null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingActionsCount, setPendingActionsCount] = useState(0);
  
  // État réseau
  const { isOnline } = useNetworkStatus();
  
  // Gestion d'erreurs standardisée
  const { showError, showAlert, clearError: clearErrorHandler } = useErrorHandler();
  
  // Gestion des états de chargement
  const { isLoading, withLoading } = useLoading();
  
  // Références pour éviter les fuites mémoire
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Met à jour l'état de synchronisation
   */
  const updateSyncState = useCallback((status: SyncStatus, error: string | null = null) => {
    if (!isMountedRef.current) return;
    
    setSyncState({
      status,
      lastSync: status === SyncStatus.SUCCESS ? new Date() : null,
      error
    });
  }, []);

  /**
   * Gère les erreurs de manière centralisée
   */
  const handleError = useCallback((error: unknown, context: string, showAlertDialog = true) => {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
    
    if (!isMountedRef.current) return;
    
    setError(errorMessage);
    updateSyncState(SyncStatus.ERROR, errorMessage);
    
    // Utiliser le gestionnaire d'erreurs standardisé
    if (showAlertDialog) {
      showAlert(error, context);
    } else {
      showError(error, context);
    }
  }, [updateSyncState, showError, showAlert]);

  /**
   * Initialise Firebase et démarre l'écoute des invités
   */
  useEffect(() => {
    let mounted = true;

    const initializeFirebase = async () => {
      try {
        setLoading(true);
        updateSyncState(SyncStatus.SYNCING);

        // Initialize offline service
        await offlineService.initialize();
        setPendingActionsCount(offlineService.getPendingActionsCount());

        if (isOnline) {
          // Online mode: initialize Firebase and sync
          await firebaseService.initialize();

          if (!mounted) return;

          // Start listening to guests
          const unsubscribe = firebaseService.subscribeToGuests(async (updatedGuests) => {
            if (!mounted) return;
            
            setGuests(updatedGuests);
            await offlineService.cacheGuests(updatedGuests);
            setLoading(false);
            updateSyncState(SyncStatus.SUCCESS);
            setError(null);
            
            // Sync pending actions if any
            if (offlineService.hasPendingActions()) {
              syncPendingActions();
            }
          });

          unsubscribeRef.current = unsubscribe;
        } else {
          // Offline mode: load cached data
          const optimisticGuests = await offlineService.getOptimisticGuests();
          setGuests(optimisticGuests);
          setLoading(false);
          updateSyncState(SyncStatus.ERROR, 'Mode hors-ligne');
        }

      } catch (error) {
        if (mounted) {
          handleError(error, 'Firebase initialization');
          setLoading(false);
        }
      }
    };

    initializeFirebase();

    return () => {
      mounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [updateSyncState, handleError]);

  /**
   * Cleanup à la destruction du composant
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      firebaseService.cleanup();
    };
  }, []);

  /**
   * Ajoute un nouvel invité
   */
  const addGuest = useCallback(async (guestData: CreateGuestData) => {
    await withLoading('addGuest', async () => {
      try {
        if (isOnline) {
          updateSyncState(SyncStatus.SYNCING);
          await firebaseService.addGuest(guestData);
          updateSyncState(SyncStatus.SUCCESS);
        } else {
          // Offline: queue action
          await offlineService.addPendingAction({
            type: 'ADD_GUEST',
            data: guestData
          });
          
          const optimisticGuests = await offlineService.getOptimisticGuests();
          setGuests(optimisticGuests);
          setPendingActionsCount(offlineService.getPendingActionsCount());
        }
      } catch (error) {
        handleError(error, 'adding guest');
        throw error;
      }
    });
  }, [updateSyncState, handleError, withLoading, isOnline]);

  /**
   * Met à jour un invité existant
   */
  const updateGuest = useCallback(async (guestId: string, updateData: UpdateGuestData) => {
    await withLoading('updateGuest', async () => {
      try {
        updateSyncState(SyncStatus.SYNCING);
        await firebaseService.updateGuest(guestId, updateData);
        updateSyncState(SyncStatus.SUCCESS);
      } catch (error) {
        handleError(error, 'updating guest');
        throw error;
      }
    });
  }, [updateSyncState, handleError, withLoading]);

  /**
   * Supprime un invité
   */
  const deleteGuest = useCallback(async (guestId: string) => {
    await withLoading('deleteGuest', async () => {
      try {
        if (isOnline) {
          updateSyncState(SyncStatus.SYNCING);
          await firebaseService.deleteGuest(guestId);
          updateSyncState(SyncStatus.SUCCESS);
        } else {
          // Offline: queue action
          await offlineService.addPendingAction({
            type: 'DELETE_GUEST',
            data: { guestId }
          });
          
          const optimisticGuests = await offlineService.getOptimisticGuests();
          setGuests(optimisticGuests);
          setPendingActionsCount(offlineService.getPendingActionsCount());
        }
      } catch (error) {
        handleError(error, 'deleting guest');
        throw error;
      }
    });
  }, [updateSyncState, handleError, withLoading, isOnline]);

  /**
   * Marque un invité comme présent
   */
  const markPresent = useCallback(async (guestId: string) => {
    await withLoading('markPresent', async () => {
      try {
        if (isOnline) {
          updateSyncState(SyncStatus.SYNCING);
          await firebaseService.markGuestPresent(guestId);
          updateSyncState(SyncStatus.SUCCESS);
        } else {
          // Offline: queue action
          await offlineService.addPendingAction({
            type: 'MARK_PRESENT',
            data: { guestId }
          });
          
          const optimisticGuests = await offlineService.getOptimisticGuests();
          setGuests(optimisticGuests);
          setPendingActionsCount(offlineService.getPendingActionsCount());
        }
      } catch (error) {
        handleError(error, 'marking guest present');
        throw error;
      }
    });
  }, [updateSyncState, handleError, withLoading, isOnline]);

  /**
   * Marque un invité comme absent
   */
  const markAbsent = useCallback(async (guestId: string) => {
    await withLoading('markAbsent', async () => {
      try {
        if (isOnline) {
          updateSyncState(SyncStatus.SYNCING);
          await firebaseService.markGuestAbsent(guestId);
          updateSyncState(SyncStatus.SUCCESS);
        } else {
          // Offline: queue action
          await offlineService.addPendingAction({
            type: 'MARK_ABSENT',
            data: { guestId }
          });
          
          const optimisticGuests = await offlineService.getOptimisticGuests();
          setGuests(optimisticGuests);
          setPendingActionsCount(offlineService.getPendingActionsCount());
        }
      } catch (error) {
        handleError(error, 'marking guest absent');
        throw error;
      }
    });
  }, [updateSyncState, handleError, withLoading, isOnline]);

  /**
   * Rafraîchit les statistiques
   */
  const refreshStats = useCallback(async () => {
    try {
      const newStats = await firebaseService.getGuestStats();
      if (isMountedRef.current) {
        setStats(newStats);
      }
    } catch (error) {
      handleError(error, 'refreshing stats');
    }
  }, [handleError]);

  /**
   * Importe des invités en lot
   */
  const importGuests = useCallback(async (guestsData: CreateGuestData[]) => {
    await withLoading('importGuests', async () => {
      try {
        updateSyncState(SyncStatus.SYNCING);
        await firebaseService.importGuests(guestsData);
        updateSyncState(SyncStatus.SUCCESS);
        
        Alert.alert(
          'Import réussi',
          `${guestsData.length} invité(s) importé(s) avec succès`
        );
      } catch (error) {
        handleError(error, 'importing guests');
        throw error;
      }
    });
  }, [updateSyncState, handleError, withLoading]);

  /**
   * Trouve un invité par son ID
   */
  const findGuestById = useCallback((id: string): Guest | undefined => {
    return guests.find(guest => guest.id === id);
  }, [guests]);

  /**
   * Trouve les invités d'une table spécifique
   */
  const findGuestsByTable = useCallback((tableName: string): Guest[] => {
    return guests.filter(guest => 
      guest.tableName.toLowerCase().includes(tableName.toLowerCase())
    );
  }, [guests]);

  /**
   * Efface l'erreur actuelle
   */
  const clearError = useCallback(() => {
    setError(null);
    setSyncState(prev => ({ ...prev, error: null }));
    clearErrorHandler();
  }, [clearErrorHandler]);

  // Calculer les statistiques automatiquement quand les invités changent
  useEffect(() => {
    if (guests.length > 0) {
      const calculatedStats: GuestStats = {
        total: guests.length,
        present: guests.filter(g => g.isPresent).length,
        absent: guests.filter(g => !g.isPresent).length,
        totalCompanions: guests.reduce((sum, g) => sum + g.companions, 0),
        presentCompanions: guests.filter(g => g.isPresent).reduce((sum, g) => sum + g.companions, 0)
      };
      setStats(calculatedStats);
    }
  }, [guests]);

  // Sync pending actions when coming back online
  const syncPendingActions = useCallback(async () => {
    if (!isOnline || !offlineService.hasPendingActions()) return;
    
    updateSyncState(SyncStatus.SYNCING);
    
    try {
      const result = await syncService.syncPendingActions();
      setPendingActionsCount(offlineService.getPendingActionsCount());
      
      if (result.success) {
        updateSyncState(SyncStatus.SUCCESS);
      } else {
        updateSyncState(SyncStatus.ERROR, result.error || 'Erreur de synchronisation');
      }
    } catch (err) {
      console.error('Sync error:', err);
      updateSyncState(SyncStatus.ERROR, 'Erreur de synchronisation');
    }
  }, [isOnline, updateSyncState]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && offlineService.hasPendingActions()) {
      syncPendingActions();
    }
  }, [isOnline, syncPendingActions]);

  return {
    // État des données
    guests,
    stats,
    
    // État de synchronisation
    syncState,
    loading,
    error,
    
    // Actions
    addGuest,
    updateGuest,
    deleteGuest,
    markPresent,
    markAbsent,
    refreshStats,
    importGuests,
    
    // Utilitaires
    findGuestById,
    findGuestsByTable,
    clearError,
    
    // Gestion d'erreurs standardisée
    showError,
    showAlert,
    
    // États de chargement standardisés
    isLoading,
    withLoading,
    
    // Mode hors-ligne
    isOnline,
    pendingActionsCount,
    syncPendingActions
  };
};