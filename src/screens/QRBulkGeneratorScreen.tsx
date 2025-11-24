import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, SafeAreaView } from 'react-native';
import * as Linking from 'expo-linking';
import { getAllGuests } from '../db/database';
import { theme } from '../styles/theme';
import Button from '../components/Button';
import Card from '../components/Card';

export default function QRBulkGeneratorScreen() {
  const [guests, setGuests] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const generateBulkWhatsAppMessages = async () => {
    if (guests.length === 0) {
      Alert.alert('Aucun invité', 'Veuillez d\'abord ajouter des invités');
      return;
    }

    setIsGenerating(true);

    try {
      let bulkMessage = '🎉 INVITATIONS DE MARIAGE 🎉\n\n';
      bulkMessage += 'Voici les QR codes pour tous vos invités :\n\n';

      guests.forEach((guest, index) => {
        bulkMessage += `${index + 1}. ${guest.fullName}\n`;
        bulkMessage += `   • Table : ${guest.tableName}\n`;
        bulkMessage += `   • Accompagnants : ${guest.companions}\n\n`;
      });

      bulkMessage += 'Instructions :\n';
      bulkMessage += '1. Chaque invité recevra son QR code personnalisé\n';
      bulkMessage += '2. Présentez le QR code le jour de la cérémonie\n';
      bulkMessage += '3. L\'équipe scannera pour confirmer votre présence\n\n';
      bulkMessage += 'Merci ! 💒';

      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(bulkMessage)}`;
      
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('WhatsApp non disponible', 'Veuillez installer WhatsApp pour utiliser cette fonctionnalité');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de générer les messages WhatsApp');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendIndividualInvitations = async () => {
    if (guests.length === 0) {
      Alert.alert('Aucun invité', 'Veuillez d\'abord ajouter des invités');
      return;
    }

    Alert.alert(
      'Envoi individuel',
      `Voulez-vous envoyer ${guests.length} messages WhatsApp individuels ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => processIndividualSending() }
      ]
    );
  };

  const processIndividualSending = async () => {
    setIsGenerating(true);

    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i];
      
      const message = `🎉 Invitation de mariage\n\nBonjour ${guest.fullName},\n\nVoici votre QR code d'invitation :\n• Table : ${guest.tableName}\n• Accompagnants : ${guest.companions}\n\nPrésentez ce QR code le jour de la cérémonie.\n\nÀ bientôt ! 💒`;
      
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      
      try {
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) {
          await Linking.openURL(whatsappUrl);
          
          if (i < guests.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      } catch (error) {
        console.log(`Erreur pour ${guest.fullName}:`, error);
      }
    }

    setIsGenerating(false);
    Alert.alert('Terminé', 'Tous les messages ont été préparés !');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement... ⏳</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalCompanions = guests.reduce((sum, guest) => sum + guest.companions, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Envoi en masse</Text>
          <Text style={styles.subtitle}>Partagez toutes les invitations rapidement</Text>
        </View>
        
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Statistiques</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{guests.length}</Text>
              <Text style={styles.statLabel}>Invités</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalCompanions}</Text>
              <Text style={styles.statLabel}>Accompagnants</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{guests.length + totalCompanions}</Text>
              <Text style={styles.statLabel}>Total personnes</Text>
            </View>
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Card>
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>📤 Messages individuels</Text>
              <Text style={styles.optionDescription}>
                Recommandé - Un message personnalisé par invité
              </Text>
            </View>
            <Button
              title="Envoyer individuellement"
              onPress={sendIndividualInvitations}
              disabled={isGenerating}
              variant="primary"
              size="lg"
            />
          </Card>

          <Card>
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>📋 Message groupé</Text>
              <Text style={styles.optionDescription}>
                Toutes les invitations dans un seul message
              </Text>
            </View>
            <Button
              title="Message groupé"
              onPress={generateBulkWhatsAppMessages}
              disabled={isGenerating}
              variant="secondary"
              size="lg"
            />
          </Card>
        </View>

        {isGenerating && (
          <Card style={styles.loadingCard}>
            <Text style={styles.loadingTitle}>⏳ Génération en cours...</Text>
            <Text style={styles.loadingDescription}>
              Veuillez patienter pendant la préparation des messages
            </Text>
          </Card>
        )}

        <Card style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>💡 Comment ça marche ?</Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>
              1. Choisissez votre méthode d'envoi préférée
            </Text>
            <Text style={styles.instructionItem}>
              2. WhatsApp s'ouvrira automatiquement
            </Text>
            <Text style={styles.instructionItem}>
              3. Envoyez les messages à vos invités
            </Text>
            <Text style={styles.instructionItem}>
              4. Ils pourront scanner leur QR code le jour J
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statsCard: {
    marginHorizontal: theme.spacing.lg,
  },
  statsTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  optionHeader: {
    marginBottom: theme.spacing.md,
  },
  optionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  optionDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
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
  loadingCard: {
    marginHorizontal: theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.warning + '20',
  },
  loadingTitle: {
    ...theme.typography.h3,
    color: theme.colors.warning,
    marginBottom: theme.spacing.xs,
  },
  loadingDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  instructionsCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  instructionsTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  instructionsList: {
    gap: theme.spacing.sm,
  },
  instructionItem: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
});