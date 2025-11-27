import { offlineService, PendingAction } from './offlineService';
import { firebaseService } from './firebaseService';

class SyncService {
  private isSyncing = false;
  private syncCallbacks: Array<(success: boolean, error?: string) => void> = [];

  async syncPendingActions(): Promise<{ success: boolean; error?: string }> {
    if (this.isSyncing) {
      return { success: false, error: 'Sync already in progress' };
    }

    this.isSyncing = true;
    const pendingActions = await offlineService.getPendingActions();
    
    if (pendingActions.length === 0) {
      this.isSyncing = false;
      return { success: true };
    }

    console.log(`Starting sync of ${pendingActions.length} pending actions`);
    
    let successCount = 0;
    let failureCount = 0;
    const maxRetries = 3;

    for (const action of pendingActions) {
      try {
        await this.executeAction(action);
        await offlineService.removePendingAction(action.id);
        successCount++;
        console.log(`Synced action ${action.type} successfully`);
      } catch (error) {
        console.error(`Failed to sync action ${action.type}:`, error);
        
        if (action.retryCount < maxRetries) {
          await offlineService.incrementRetryCount(action.id);
        } else {
          // Remove action after max retries
          await offlineService.removePendingAction(action.id);
          console.warn(`Removed action ${action.type} after ${maxRetries} retries`);
        }
        failureCount++;
      }
    }

    this.isSyncing = false;
    
    const result = {
      success: failureCount === 0,
      error: failureCount > 0 ? `${failureCount} actions failed to sync` : undefined
    };

    // Notify callbacks
    this.syncCallbacks.forEach(callback => callback(result.success, result.error));
    
    return result;
  }

  private async executeAction(action: PendingAction): Promise<void> {
    switch (action.type) {
      case 'ADD_GUEST':
        await firebaseService.addGuest(action.data);
        break;
        
      case 'UPDATE_GUEST':
        await firebaseService.updateGuest(action.data.id, action.data);
        break;
        
      case 'DELETE_GUEST':
        await firebaseService.deleteGuest(action.data.guestId);
        break;
        
      case 'MARK_PRESENT':
        await firebaseService.markGuestPresent(action.data.guestId);
        break;
        
      case 'MARK_ABSENT':
        await firebaseService.markGuestAbsent(action.data.guestId);
        break;
        
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  onSyncComplete(callback: (success: boolean, error?: string) => void) {
    this.syncCallbacks.push(callback);
    
    // Return cleanup function
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
    };
  }

  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  async forceClearPendingActions(): Promise<void> {
    await offlineService.clearPendingActions();
  }
}

export const syncService = new SyncService();