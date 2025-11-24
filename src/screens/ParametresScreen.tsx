import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { theme } from '../styles/theme';
import Button from '../components/Button';

export default function ParametresScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.bigTitle}>🎉 ÉCRAN PARAMÈTRES FONCTIONNE !</Text>
        <Text style={styles.subtitle}>Si vous voyez ce message, la navigation est OK</Text>
        
        <Button
          title="Test réussi !"
          onPress={() => Alert.alert('✅ Succès', 'L\'écran Paramètres fonctionne parfaitement !')}
          variant="primary"
          size="lg"
          icon="🎯"
        />
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📋 Informations</Text>
          <Text style={styles.infoText}>• Version : 1.0.0</Text>
          <Text style={styles.infoText}>• Écran : Paramètres (Test)</Text>
          <Text style={styles.infoText}>• Statut : ✅ Fonctionnel</Text>
        </View>
        
        <View style={styles.nextSteps}>
          <Text style={styles.nextTitle}>🚀 Prochaines étapes :</Text>
          <Text style={styles.nextText}>1. Configurer Firebase</Text>
          <Text style={styles.nextText}>2. Tester la synchronisation</Text>
          <Text style={styles.nextText}>3. Nettoyer les données de test</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  bigTitle: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  infoBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    ...theme.shadows.md,
  },
  infoTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  nextSteps: {
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  nextTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  nextText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
});