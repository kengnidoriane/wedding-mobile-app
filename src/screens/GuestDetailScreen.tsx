import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type GuestDetailScreenRouteProp = RouteProp<RootStackParamList, 'Détails invité'>;

export default function GuestDetailScreen() {
  const route = useRoute<GuestDetailScreenRouteProp>();
  const { guestId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Détails de l'invité</Text>
        <Text style={styles.subtitle}>ID: {guestId}</Text>
        <Text style={styles.message}>Fonctionnalité en cours de développement</Text>
      </View>
    </SafeAreaView>
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
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  message: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});
