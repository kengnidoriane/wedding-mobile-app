import AsyncStorage from '@react-native-async-storage/async-storage';
import { Guest, CreateGuestData } from '../types/guest';

export interface PendingAction {
  id: string;
  type: 'ADD_GUEST' | 'UPDATE_GUEST' | 'DELETE_GUEST' | 'MARK_PRESENT' | 'MARK_ABSENT';
  data: any;
  timestamp: number;
  retryCount: number;
}

const PENDING_ACTIONS_KEY = '@wedding_app_pending_actions';
const OFFLINE_GUESTS_KEY = '@wedding_app_offline_guests';

class OfflineService {
  private pendingActions: PendingAction[] = [];

  async initialize() {
    try {
      const stored = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
      this.pendingActions = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load pending actions:', error);
      this.pendingActions = [];
    }
  }

  async addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>) {
    const pendingAction: PendingAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now(),
      retryCount: 0
    };

    this.pendingActions.push(pendingAction);
    await this.savePendingActions();
    return pendingAction.id;
  }

  async getPendingActions(): Promise<PendingAction[]> {
    return [...this.pendingActions];
  }

  async removePendingAction(actionId: string) {
    this.pendingActions = this.pendingActions.filter(action => action.id !== actionId);
    await this.savePendingActions();
  }

  async incrementRetryCount(actionId: string) {
    const action = this.pendingActions.find(a => a.id === actionId);
    if (action) {
      action.retryCount++;
      await this.savePendingActions();
    }
  }

  async clearPendingActions() {
    this.pendingActions = [];
    await this.savePendingActions();
  }

  private async savePendingActions() {
    try {
      await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(this.pendingActions));
    } catch (error) {
      console.error('Failed to save pending actions:', error);
    }
  }

  // Cache guests locally for offline access
  async cacheGuests(guests: Guest[]) {
    try {
      await AsyncStorage.setItem(OFFLINE_GUESTS_KEY, JSON.stringify(guests));
    } catch (error) {
      console.error('Failed to cache guests:', error);
    }
  }

  async getCachedGuests(): Promise<Guest[]> {
    try {
      const cached = await AsyncStorage.getItem(OFFLINE_GUESTS_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to get cached guests:', error);
      return [];
    }
  }

  // Apply pending actions to cached data for optimistic updates
  async getOptimisticGuests(): Promise<Guest[]> {
    const cachedGuests = await this.getCachedGuests();
    let optimisticGuests = [...cachedGuests];

    for (const action of this.pendingActions) {
      switch (action.type) {
        case 'ADD_GUEST':
          const newGuest: Guest = {
            ...action.data,
            id: action.id,
            isPresent: false,
            createdAt: new Date(action.timestamp).toISOString(),
            updatedAt: new Date(action.timestamp).toISOString()
          };
          optimisticGuests.push(newGuest);
          break;

        case 'UPDATE_GUEST':
          const updateIndex = optimisticGuests.findIndex(g => g.id === action.data.id);
          if (updateIndex !== -1) {
            optimisticGuests[updateIndex] = {
              ...optimisticGuests[updateIndex],
              ...action.data,
              updatedAt: new Date(action.timestamp).toISOString()
            };
          }
          break;

        case 'DELETE_GUEST':
          optimisticGuests = optimisticGuests.filter(g => g.id !== action.data.guestId);
          break;

        case 'MARK_PRESENT':
          const presentIndex = optimisticGuests.findIndex(g => g.id === action.data.guestId);
          if (presentIndex !== -1) {
            optimisticGuests[presentIndex] = {
              ...optimisticGuests[presentIndex],
              isPresent: true,
              updatedAt: new Date(action.timestamp).toISOString()
            };
          }
          break;

        case 'MARK_ABSENT':
          const absentIndex = optimisticGuests.findIndex(g => g.id === action.data.guestId);
          if (absentIndex !== -1) {
            optimisticGuests[absentIndex] = {
              ...optimisticGuests[absentIndex],
              isPresent: false,
              updatedAt: new Date(action.timestamp).toISOString()
            };
          }
          break;
      }
    }

    return optimisticGuests;
  }

  getPendingActionsCount(): number {
    return this.pendingActions.length;
  }

  hasPendingActions(): boolean {
    return this.pendingActions.length > 0;
  }
}

export const offlineService = new OfflineService();