import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../styles/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useFirebaseGuests } from '../hooks/useFirebaseGuests';

const menuItems = [
  { title: 'Scanner QR code', icon: '📱', screen: 'QRScanner', color: theme.colors.primary },
  { title: 'Liste des invités', icon: '👥', screen: 'Invités', color: theme.colors.secondary },
  { title: 'Partager QR WhatsApp', icon: '💬', screen: 'QRWhatsAppShare', color: theme.colors.success },
  { title: 'Envoi en masse', icon: '📤', screen: 'QRBulkGenerator', color: theme.colors.success },
  { title: 'Tableau de bord', icon: '📊', screen: 'Dashboard', color: theme.colors.primary },
  { title: 'Paramètres', icon: '⚙️', screen: 'Paramètres', color: theme.colors.textSecondary },
];

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { loading, stats } = useFirebaseGuests();

  const statsText = useMemo(() => 
    stats ? `${stats.present}/${stats.total} invités présents` : '',
    [stats]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>💍 Mariage de Papa & Maman</Text>
          <Text style={styles.subtitle}>Gestion des invités simplifiée</Text>
          
          {/* Statistiques rapides */}
          {loading ? (
            <LoadingSpinner size="small" variant="inline" />
          ) : stats && (
            <View style={styles.quickStats}>
              <Text style={styles.statsText}>
                {statsText}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {menuItems.map((item, index) => (
            <Card key={index} style={styles.menuCard}>
              <Button
                title={item.title}
                icon={item.icon}
                onPress={() => navigation.navigate(item.screen)}
                variant="ghost"
                size="lg"
              />
            </Card>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>✨ Bonne organisation ! ✨</Text>
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
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  menuCard: {
    marginBottom: theme.spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
  },
  quickStats: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.md,
  },
  statsText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});