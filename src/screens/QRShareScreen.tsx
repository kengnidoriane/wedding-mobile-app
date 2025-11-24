import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, Linking } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getAllGuests } from '../db/database';
import { generateQRData } from '../utils/qrUtils';
import { theme } from '../styles/theme';
import Button from '../components/Button';
import Card from '../components/Card';

export default function QRShareScreen() {
  const [guests, setGuests] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    try {
      const data = await getAllGuests();
      setGuests(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les invités');
    }
  };

  const shareCurrentGuest = async () => {
    if (guests.length === 0) return;
    
    const guest = guests[currentIndex];
    const qrData = generateQRData(guest);
    
    const message = `🎉 Invitation de mariage - ${guest.fullName}

Bonjour ${guest.fullName},

Voici votre invitation :
• Table : ${guest.tableName}
• Accompagnants : ${guest.companions}

📱 VOTRE QR CODE :
Allez sur : qr-code-generator.com
Copiez ces données :
${qrData}

💡 OU cliquez ici pour voir votre QR :
https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}

Présentez ce QR code le jour J !

À bientôt ! 💒`;

    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('WhatsApp non disponible', 'Veuillez installer WhatsApp');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const nextGuest = () => {
    if (currentIndex < guests.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevGuest = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const openQROnline = async (guest: any) => {
    const qrData = generateQRData(guest);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(qrUrl);
      if (canOpen) {
        await Linking.openURL(qrUrl);
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le QR code en ligne');
    }
  };

  if (guests.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun invité trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentGuest = guests[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Partage QR Code</Text>
        <Text style={styles.subtitle}>
          {currentIndex + 1} / {guests.length}
        </Text>
      </View>

      <Card style={styles.guestCard}>
        <Text style={styles.guestName}>{currentGuest.fullName}</Text>
        <Text style={styles.guestDetail}>📍 {currentGuest.tableName}</Text>
        <Text style={styles.guestDetail}>👥 {currentGuest.companions} accompagnant(s)</Text>
        
        <View style={styles.qrContainer}>
          <QRCode 
            value={generateQRData(currentGuest)} 
            size={200}
            backgroundColor={theme.colors.surface}
            color={theme.colors.text}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Envoyer via WhatsApp"
            icon="📱"
            onPress={shareCurrentGuest}
            variant="primary"
            size="lg"
          />
          <Button
            title="Ouvrir QR en ligne"
            icon="🌐"
            onPress={() => openQROnline(currentGuest)}
            variant="secondary"
            size="md"
          />
        </View>
      </Card>

      <View style={styles.navigation}>
        <Button
          title="← Précédent"
          onPress={prevGuest}
          disabled={currentIndex === 0}
          variant="secondary"
          size="md"
        />
        <Button
          title="Suivant →"
          onPress={nextGuest}
          disabled={currentIndex === guests.length - 1}
          variant="secondary"
          size="md"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  guestCard: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  guestName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  guestDetail: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  qrContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.lg,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
  },
  buttonContainer: {
    gap: theme.spacing.sm,
    width: '100%',
  },
});