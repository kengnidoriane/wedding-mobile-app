import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Share, SafeAreaView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Linking from 'expo-linking';
import { getAllGuests } from '../db/database';
import { generateQRData, generateWhatsAppMessage } from '../utils/qrUtils';
import { theme } from '../styles/theme';
import Button from '../components/Button';
import Card from '../components/Card';

export default function QRGeneratorScreen() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    try {
      const data = await getAllGuests();
      setGuests(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les invités');
    } finally {
      setLoading(false);
    }
  };

  const shareViaWhatsApp = async (guest: any) => {
    try {
      const qrData = generateQRData(guest);
      const message = generateWhatsAppMessage(guest);
      
      // Créer un lien avec les données QR intégrées
      const fullMessage = `${message}\n\n📱 DONNÉES QR CODE :\n${qrData}\n\n💡 Copiez ces données dans un générateur QR en ligne ou montrez ce message complet.`;
      
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(fullMessage)}`;
      
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Share.share({
          message: fullMessage,
          title: `Invitation QR - ${guest.fullName}`
        });
      }
      
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le QR code');
    }
  };

  const renderGuestItem = ({ item }: { item: any }) => {
    return (
      <Card style={styles.guestCard}>
        <View style={styles.guestHeader}>
          <Text style={styles.guestName}>{item.fullName}</Text>
          <View style={styles.guestInfo}>
            <Text style={styles.guestDetail}>📍 {item.tableName}</Text>
            <Text style={styles.guestDetail}>👥 {item.companions} accompagnant(s)</Text>
          </View>
        </View>
        
        <View style={styles.qrContainer}>
          <QRCode 
            value={generateQRData(item)} 
            size={140}
            backgroundColor={theme.colors.surface}
            color={theme.colors.text}
            getRef={(c) => (item.qrRef = c)}
          />
          <Text style={styles.qrLabel}>{item.fullName}</Text>
        </View>

        <View style={styles.buttonRow}>
          <Button
            title="Envoyer données"
            icon="📱"
            onPress={() => shareViaWhatsApp(item)}
            variant="primary"
            size="sm"
          />
          <Button
            title="Sauver QR"
            icon="💾"
            onPress={() => saveQRCode(item)}
            variant="secondary"
            size="sm"
          />
        </View>
      </Card>
    );
  };

  const saveQRCode = async (guest: any) => {
    try {
      if (guest.qrRef) {
        guest.qrRef.toDataURL((dataURL: string) => {
          const qrData = generateQRData(guest);
          Alert.alert(
            'QR Code sauvé',
            `Données QR pour ${guest.fullName}:\n\n${qrData}\n\nVous pouvez copier ces données dans un générateur QR en ligne.`,
            [
              { text: 'OK' },
              { 
                text: 'Copier', 
                onPress: () => {
                  // Note: Clipboard nécessite expo-clipboard
                  console.log('Données copiées:', qrData);
                }
              }
            ]
          );
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le QR code');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des QR codes... ⏳</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>QR Codes des invités</Text>
        <Text style={styles.subtitle}>{guests.length} invité(s) trouvé(s)</Text>
      </View>

      {guests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun invité trouvé</Text>
          <Text style={styles.emptySubtext}>Ajoutez des invités pour générer leurs QR codes</Text>
        </View>
      ) : (
        <FlatList
          data={guests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGuestItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  guestCard: {
    alignItems: 'center',
  },
  guestHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  guestName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  guestInfo: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  guestDetail: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  qrContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  qrLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  emptyText: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});