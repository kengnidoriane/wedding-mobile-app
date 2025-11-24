import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import GuestListScreen from '../screens/GuestListScreen';
import GuestDetailScreen from '../screens/GuestDetailScreen';
import SettingsScreen from '../screens/ParametresScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import QRBulkGeneratorScreen from '../screens/QRBulkGeneratorScreen';
import QRShareScreen from '../screens/QRShareScreen';
import QRImageScreen from '../screens/QRImageScreen';
import DashboardScreen from '../screens/DashboardScreen';
import QRWhatsAppShareScreen from '../screens/QRWhatsAppShareScreen';

export type RootStackParamList = {
  Accueil: undefined;
  Invités: undefined;
  'Détails invité': { guestId: string };
  Paramètres: undefined;
  QRScanner: undefined;
  QRBulkGenerator: undefined;
  QRShare: undefined;
  QRImage: undefined;
  Dashboard: undefined;
  QRWhatsAppShare: { guestId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Accueil">
        <Stack.Screen name="Accueil" component={HomeScreen} />
        <Stack.Screen name="Invités" component={GuestListScreen} />
        <Stack.Screen name="Détails invité" component={GuestDetailScreen} />
        <Stack.Screen name="Paramètres" component={SettingsScreen} />
        <Stack.Screen name='QRScanner' component={QRScannerScreen} />
        <Stack.Screen name='QRBulkGenerator' component={QRBulkGeneratorScreen} />
        <Stack.Screen name='QRShare' component={QRShareScreen} />
        <Stack.Screen name='QRImage' component={QRImageScreen} />
        <Stack.Screen name='Dashboard' component={DashboardScreen} />
        <Stack.Screen name='QRWhatsAppShare' component={QRWhatsAppShareScreen} options={{ title: 'Partage QR WhatsApp' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
