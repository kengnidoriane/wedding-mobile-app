import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Guest } from '../types/guest';

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  guestArrivals: boolean;
  sound: boolean;
  vibration: boolean;
}

class NotificationService {
  private settings: NotificationSettings = {
    enabled: true,
    guestArrivals: true,
    sound: true,
    vibration: true
  };

  async initialize() {
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: this.settings.sound,
        shouldSetBadge: false,
      }),
    });

    // Load settings
    await this.loadSettings();

    // Request permissions
    await this.requestPermissions();
  }

  async requestPermissions() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('guest-arrivals', {
        name: 'Arrivées des invités',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  async notifyGuestArrival(guest: Guest) {
    if (!this.settings.enabled || !this.settings.guestArrivals) {
      return;
    }

    const companionsText = guest.companions > 0 
      ? ` • ${guest.companions} accompagnant${guest.companions > 1 ? 's' : ''}`
      : '';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Nouvel invité arrivé',
        body: `${guest.fullName}\nTable ${guest.tableName}${companionsText}`,
        data: { 
          type: 'guest_arrival',
          guestId: guest.id,
          timestamp: new Date().toISOString()
        },
        sound: this.settings.sound,
        vibrate: this.settings.vibration ? [0, 250, 250, 250] : undefined,
      },
      trigger: null, // Immediate
    });
  }

  async updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  private async loadSettings() {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  private async saveSettings() {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  // Test notification
  async sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Test de notification',
        body: 'Les notifications fonctionnent correctement !',
        data: { type: 'test' },
      },
      trigger: null,
    });
  }
}

export const notificationService = new NotificationService();