import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, SafeAreaView, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { theme } from '../styles/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import { useFirebaseGuests } from '../hooks/useFirebaseGuests';
import { LoadingSpinner } from '../components/LoadingSpinner';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const { guests, loading, stats } = useFirebaseGuests();

  const dashboardStats = useMemo(() => {
    const presentCount = stats?.present || 0;
    const total = stats?.total || 0;
    const absent = stats?.absent || 0;
    const totalCompanions = stats?.totalCompanions || 0;
    const presentCompanions = guests
      .filter(g => g.isPresent)
      .reduce((sum, guest) => sum + guest.companions, 0);
    
    return {
      presentCount,
      total,
      absent,
      totalCompanions,
      presentCompanions
    };
  }, [guests, stats]);

  const pieData = useMemo(() => [
    {
      name: 'Présents',
      population: dashboardStats.presentCount,
      color: theme.colors.success,
      legendFontColor: theme.colors.text,
      legendFontSize: 14,
    },
    {
      name: 'Absents',
      population: dashboardStats.absent,
      color: theme.colors.error,
      legendFontColor: theme.colors.text,
      legendFontSize: 14,
    },
  ], [dashboardStats]);

  const exportData = async () => {
    try {
      const exportData = {
        summary: {
          totalGuests: dashboardStats.total,
          presentGuests: dashboardStats.presentCount,
          absentGuests: dashboardStats.absent,
          totalCompanions: dashboardStats.totalCompanions,
          presentCompanions: dashboardStats.presentCompanions,
          exportDate: new Date().toISOString(),
        },
        guests: guests.map(guest => ({
          id: guest.id,
          fullName: guest.fullName,
          tableName: guest.tableName,
          companions: guest.companions,
          isPresent: guest.isPresent,
        }))
      };

      const fileContent = JSON.stringify(exportData, null, 2);
      const fileUri = `${FileSystem.documentDirectory}wedding-guests-export.json`;

      await FileSystem.writeAsStringAsync(fileUri, fileContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Exporter les données des invités'
        });
      } else {
        Alert.alert('Partage non disponible', 'Impossible de partager le fichier.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'exporter les données.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text="Chargement du tableau de bord..." variant="fullscreen" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Tableau de bord</Text>
          <Text style={styles.subtitle}>Vue d'ensemble de votre mariage</Text>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboardStats.total}</Text>
            <Text style={styles.statLabel}>👥 Invités total</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={[styles.statNumber, { color: theme.colors.success }]}>{dashboardStats.presentCount}</Text>
            <Text style={styles.statLabel}>✅ Présents</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={[styles.statNumber, { color: theme.colors.error }]}>{dashboardStats.absent}</Text>
            <Text style={styles.statLabel}>⏳ Absents</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboardStats.totalCompanions}</Text>
            <Text style={styles.statLabel}>👫 Accompagnants</Text>
          </Card>
        </View>

        {dashboardStats.total > 0 && (
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>📊 Répartition des présences</Text>
            <View style={styles.chartContainer}>
              <PieChart
                data={pieData}
                width={screenWidth - 80}
                height={220}
                chartConfig={{
                  backgroundColor: theme.colors.surface,
                  backgroundGradientFrom: theme.colors.surface,
                  backgroundGradientTo: theme.colors.surface,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
            
            <View style={styles.percentageContainer}>
              <Text style={styles.percentageText}>
                Taux de présence: {dashboardStats.total > 0 ? Math.round((dashboardStats.presentCount / dashboardStats.total) * 100) : 0}%
              </Text>
            </View>
          </Card>
        )}

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📋 Résumé détaillé</Text>
          <View style={styles.summaryList}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total personnes attendues:</Text>
              <Text style={styles.summaryValue}>{dashboardStats.total + dashboardStats.totalCompanions}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Personnes présentes:</Text>
              <Text style={styles.summaryValue}>{dashboardStats.presentCount + dashboardStats.presentCompanions}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Accompagnants présents:</Text>
              <Text style={styles.summaryValue}>{dashboardStats.presentCompanions}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.actionContainer}>
          <Button
            title="Exporter les données"
            onPress={exportData}
            variant="primary"
            size="lg"
            icon="📤"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  statNumber: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  chartCard: {
    marginHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  chartTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  chartContainer: {
    alignItems: 'center',
  },
  percentageContainer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  percentageText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  summaryCard: {
    marginHorizontal: theme.spacing.lg,
  },
  summaryTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  summaryList: {
    gap: theme.spacing.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  actionContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
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
});