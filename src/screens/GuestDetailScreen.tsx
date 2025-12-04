import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useFirebaseGuests } from '../hooks/useFirebaseGuests';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LoadingButton } from '../components/LoadingButton';
import Button from '../components/Button';
import Card from '../components/Card';
import ValidatedTextInput from '../components/ValidatedTextInput';
import { CheckIcon } from '../components/icons/CheckIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { QRIcon } from '../components/icons/QRIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { validationService } from '../services/validationService';

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
    updateGuest,
    isLoading 
  } = useFirebaseGuests();

  const guest = useMemo(() => 
    guests.find(g => g.id === guestId), 
    [guests, guestId]
  );

  // État pour le mode édition
  const [isEditing, setIsEditing] = useState(false);
  const [editedFullName, setEditedFullName] = useState('');
  const [editedTableName, setEditedTableName] = useState('');
  const [editedCompanions, setEditedCompanions] = useState('');

  // Initialiser les champs d'édition
  const startEditing = () => {
    if (!guest) return;
    setEditedFullName(guest.fullName);
    setEditedTableName(guest.tableName);
    setEditedCompanions(guest.companions.toString());
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedFullName('');
    setEditedTableName('');
    setEditedCompanions('');
  };

  const saveChanges = async () => {
    if (!guest) return;

    const updatedData = {
      fullName: editedFullName.trim(),
      tableName: editedTableName.trim(),
      companions: parseInt(editedCompanions, 10) || 0
    };

    // Validation
    const validation = validationService.validateCreateGuest(updatedData);
    if (!validation.isValid) {
      Alert.alert(
        'Erreur de validation',
        validationService.formatValidationErrors(validation.errors)
      );
      return;
    }

    // Vérifier les doublons (sauf si c'est le même nom)
    if (updatedData.fullName.toLowerCase() !== guest.fullName.toLowerCase()) {
      const isDuplicate = guests.some(
        g => g.id !== guest.id && g.fullName.toLowerCase() === updatedData.fullName.toLowerCase()
      );
      
      if (isDuplicate) {
        Alert.alert(
          'Doublon détecté',
          `Un invité avec le nom "${updatedData.fullName}" existe déjà. Voulez-vous continuer ?`,
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Continuer',
              onPress: async () => {
                await performUpdate(updatedData);
              }
            }
          ]
        );
        return;
      }
    }

    await performUpdate(updatedData);
  };

  const performUpdate = async (updatedData: any) => {
    if (!guest) return;
    
    try {
      await updateGuest(guest.id, updatedData);
      setIsEditing(false);
      Alert.alert('Succès', 'Les informations ont été mises à jour');
    } catch (error) {
      console.error('Error updating guest:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour les informations');
    }
  };

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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informations</Text>
            {!isEditing && (
              <TouchableOpacity onPress={startEditing}>
                <Text style={styles.editButton}>✏️ Modifier</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {!isEditing ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nom complet</Text>
                <Text style={styles.infoValue}>{guest.fullName}</Text>
              </View>
              
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
            </>
          ) : (
            <>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Nom complet *</Text>
                <TextInput
                  style={styles.editInput}
                  value={editedFullName}
                  onChangeText={setEditedFullName}
                  placeholder="Nom complet"
                  placeholderTextColor="#8E8E93"
                />
                {editedFullName.trim() && validationService.validateField('fullName', editedFullName)?.message && (
                  <Text style={styles.errorText}>
                    {validationService.validateField('fullName', editedFullName)?.message}
                  </Text>
                )}
              </View>
              
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Table *</Text>
                <TextInput
                  style={styles.editInput}
                  value={editedTableName}
                  onChangeText={setEditedTableName}
                  placeholder="Nom de la table"
                  placeholderTextColor="#8E8E93"
                />
                {editedTableName.trim() && validationService.validateField('tableName', editedTableName)?.message && (
                  <Text style={styles.errorText}>
                    {validationService.validateField('tableName', editedTableName)?.message}
                  </Text>
                )}
              </View>
              
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Accompagnants *</Text>
                <TextInput
                  style={styles.editInput}
                  value={editedCompanions}
                  onChangeText={setEditedCompanions}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#8E8E93"
                />
                {editedCompanions.trim() && validationService.validateField('companions', parseInt(editedCompanions) || 0)?.message && (
                  <Text style={styles.errorText}>
                    {validationService.validateField('companions', parseInt(editedCompanions) || 0)?.message}
                  </Text>
                )}
              </View>
              
              <View style={styles.editActions}>
                <Button
                  title="Annuler"
                  onPress={cancelEditing}
                  variant="outline"
                  size="md"
                />
                <LoadingButton
                  title="Enregistrer"
                  onPress={saveChanges}
                  variant="primary"
                  size="md"
                  loading={isLoading('updateGuest')}
                />
              </View>
            </>
          )}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  editButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
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
  editField: {
    marginBottom: theme.spacing.md,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  editActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
});
