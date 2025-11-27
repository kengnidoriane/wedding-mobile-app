import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, Linking, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getAllGuests } from '../db/database';
import { generateQRData } from '../utils/qrUtils';
import { theme } from '../styles/theme';
import Button from '../components/Button';
import Card from '../components/Card';

export default function QRImageScreen() {
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

  const shareScreenshot = async () => {
    Alert.alert(
      '📸 Capture d\'écran',
      'Pour envoyer le QR code :\n\n1. Prenez une capture d\'écran de cet écran\n2. Ouvrez WhatsApp\n3. Envoyez la capture à votre invité\n\nVoulez-vous continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Prendre capture', onPress: () => takeScreenshot() }
      ]
    );
  };

  const takeScreenshot = () => {
    Alert.alert(
      '📱 Instructions',
      'Prenez maintenant une capture d\'écran :\n\n• Android : Volume bas + Power\n• iPhone : Volume haut + Power\n\nPuis partagez l\'image via WhatsApp !',
      [{ text: 'Compris !' }]
    );
  };

  const shareWithInstructions = async () => {
    const guest = guests[currentIndex];
    const qrData = generateQRData(guest);
    
    const message = `🎉 Invitation de mariage - ${guest.fullName}

Bonjour ${guest.fullName},

Voici votre invitation :
• Table : ${guest.tableName}
• Accompagnants : ${guest.companions}

📱 INSTRUCTIONS POUR VOTRE QR CODE :
1. Je vais vous envoyer une image de QR code
2. Sauvegardez cette image sur votre téléphone
3. Présentez-la le jour de la cérémonie

Données de secours (si besoin) :
${qrData}

À bientôt ! 💒`;

    try {
      await Share.share({
        message: message,
        title: `Invitation - ${guest.fullName}`
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager');
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

  if (guests.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun invité trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentGuest = guests?.[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>QR Code - Capture d'écran</Text>
        <Text style={styles.subtitle}>
          {currentIndex + 1} / {guests.length}
        </Text>
      </View>

      <Card style={styles.qrCard}>
        <View style={styles.guestInfo}>
          <Text style={styles.guestName}>{currentGuest.fullName}</Text>
          <Text style={styles.guestDetail}>Table : {currentGuest.tableName}</Text>
          <Text style={styles.guestDetail}>Accompagnants : {currentGuest.companions}</Text>
        </View>
        
        <View style={styles.qrContainer}>
          <QRCode 
            value={generateQRData(currentGuest)} 
            size={250}
            backgroundColor="white"
            color="black"
          />
        </View>

        <Text style={styles.instructions}>
          📸 Prenez une capture d'écran de ce QR code
        </Text>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="📸 Instructions capture"
          onPress={shareScreenshot}
          variant="primary"
          size="lg"
        />
        <Button
          title="📝 Envoyer instructions"
          onPress={shareWithInstructions}
          variant="secondary"
          size="md"
        />
      </View>

      <View style={styles.navigation}>
        <Button
          title="← Précédent"
          onPress={prevGuest}
          disabled={currentIndex === 0}
          variant="secondary"
          size="sm"
        />
        <Button
          title="Suivant →"
          onPress={nextGuest}
          disabled={currentIndex === guests.length - 1}
          variant="secondary"
          size="sm"
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
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  qrCard: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    backgroundColor: 'white',
  },
  guestInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  guestName: {
    ...theme.typography.h2,
    color: 'black',
    marginBottom: theme.spacing.sm,
  },
  guestDetail: {
    ...theme.typography.body,
    color: 'black',
    marginBottom: theme.spacing.xs,
  },
  qrContainer: {
    padding: theme.spacing.xl,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  instructions: {
    ...theme.typography.caption,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonContainer: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
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
});