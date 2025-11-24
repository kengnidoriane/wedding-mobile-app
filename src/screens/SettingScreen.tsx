import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { theme } from '../styles/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import { showFirebaseStats, clearAllFirebaseData } from '../utils/dataCleanup';

export default function SettingsScreen() {
  const handleShowStats = async () => {
    try {
      await showFirebaseStats();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'afficher les statistiques');
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      '⚠️ Attention !',
      'Cette action supprimera TOUTES les données Firebase (invités, logs, etc.). Cette action est irréversible !',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer la suppression',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllFirebaseData();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer les données');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Paramètres</Text>
          <Text style={styles.subtitle}>Configuration de l'application</Text>
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Firebase</Text>
          <Text style={styles.sectionDescription}>
            Gestion des données synchronisées
          </Text>
          
          <View style={styles.buttonGroup}>
            <Button
              title="Voir les statistiques"
              onPress={handleShowStats}
              variant="secondary"
              size="md"
              icon="📊"
            />
            
            <Button
              title="Nettoyer les données de test"
              onPress={handleClearData}
              variant="outline"
              size="md"
              icon="🧹"
            />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Informations</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version :</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Base de données :</Text>
            <Text style={styles.infoValue}>Firebase Firestore</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Synchronisation :</Text>
            <Text style={[styles.infoValue, { color: theme.colors.success }]}>
              ✅ Temps réel
            </Text>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Zone de danger</Text>
          <Text style={styles.dangerDescription}>
            Actions irréversibles - Utilisez avec précaution
          </Text>
          
          <Button
            title="Supprimer TOUTES les données"
            onPress={handleClearData}
            variant="outline"
            size="md"
            icon="💥"
          />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Wedding App - Gestion d'invités avec synchronisation Firebase
          </Text>
        </View>
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
  section: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  buttonGroup: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  dangerDescription: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});
