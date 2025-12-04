import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useFirebaseGuests } from '../hooks/useFirebaseGuests';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LoadingButton } from '../components/LoadingButton';
import Button from '../components/Button';
import Card from '../components/Card';
import { CheckIcon } from '../components/icons/CheckIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { QRIcon } from '../components/icons/QRIcon';
import { TrashIcon } from '../components/icons/TrashIcon';

type GuestDetailScreenRouteProp = RouteProp<RootStackParamList, 'Détails invité'>;

export default function GuestDetailScreen() {
  const route = useRoute<GuestDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { guestId } = route.params;
  
  const { 
    guests, 
    loading, 
    markPresent, 
    markAbsent, 
    deleteGuest,
    isLoading 
  } = useFirebaseGuests();

  const guest = useMemo(() => 
    guests.find(g => g.id === guestId), 
    [guests, guestId]
  );

  const handleTogglePresence = async () => {
    if (!guest) return;
    
    const action = guest.isPresent ? 'absent' : 'présent';
    const emoji = guest.isPresent ? '⏳' : '✅';
    
    Alert.alert(
      'Confirmer le changement de statut',
      `Voulez-vous marquer ${guest.fullName} comme ${action} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: `${emoji} Marquer ${action}`,
          style: 'default',
          onPress: async () => {
            try {
              if (!guest.isPresent) {
                await markPresent(guest.id);
              } else {
                await markAbsent(guest.id);
              }
            } catch (error) {
              console.error('Error toggling presence:', error);
            }
          }
        }
      ]
    );
  };

  const handleDelete = () => {
    if (!guest) return;
    
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer ${guest.fullName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGuest(guest.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting guest:', error);
            }
          }
        }
      ]
    );
  };

  const handleShareQR = () => {
    if (!guest) return;
    navigation.navigate('QRWhatsAppShare', { guestId: guest.id });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text="Chargement..." variant="fullscreen" />
      </SafeAreaView>
    );
  }

  if (!guest) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invité introuvable</Text>
          <Button 
            title="Retour" 
            onPress={() => navigation.goBack()} 
            variant="primary"
            size="md"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* En-tête avec avatar */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {guest.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.guestName}>{guest.fullName}</Text>
          
          <View style={[
            styles.statusBadge,
            guest.isPresent ? styles.presentBadge : styles.absentBadge
          ]}>
            {guest.isPresent ? (
              <CheckIcon size={16} color="#FFFFFF" />
            ) : (
              <ClockIcon size={16} color="#FFFFFF" />
            )}
            <Text style={styles.statusText}>
              {guest.isPresent ? 'Présent' : 'Absent'}
            </Text>
          </View>
        </View>

        {/* Informations */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informations</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Table</Text>
            <Text style={styles.infoValue}>{guest.tableName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Accompagnants</Text>
            <Text style={styles.infoValue}>
              {guest.companions > 0 
                ? `${guest.companions} personne${guest.companions > 1 ? 's' : ''}`
                : 'Aucun'
              }
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total personnes</Text>
            <Text style={styles.infoValue}>{1 + guest.companions}</Text>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <LoadingButton
            title={guest.isPresent ? "Marquer absent" : "Marquer présent"}
            onPress={handleTogglePresence}
            variant={guest.isPresent ? "outline" : "primary"}
            size="lg"
            icon={guest.isPresent ? "⏳" : "✅"}
            loading={isLoading('markPresent') || isLoading('markAbsent')}
          />
          
          <Button
            title="Partager QR Code"
            onPress={handleShareQR}
            variant="outline"
            size="lg"
            icon="📱"
          />
          
          <Button
            title="Supprimer l'invité"
            onPress={handleDelete}
            variant="outline"
            size="lg"
            icon="🗑️"
          />
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
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
  },
  guestName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  presentBadge: {
    backgroundColor: '#34C759',
  },
  absentBadge: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    margin: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  infoLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  actionsContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
});
