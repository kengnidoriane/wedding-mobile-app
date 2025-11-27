import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, RefreshControl, Modal, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import { theme } from '../styles/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LoadingButton } from '../components/LoadingButton';
import GuestItem from '../components/GuestItem';
import ValidatedTextInput from '../components/ValidatedTextInput';
import { useFirebaseGuests } from '../hooks/useFirebaseGuests';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { validationService } from '../services/validationService';
import { CreateGuestData, SyncStatus } from '../types/guest';

export default function GuestListScreen({ navigation }: any) {
  // Hook Firebase pour la gestion des invités
  const {
    guests,
    stats,
    syncState,
    loading,
    error,
    addGuest,
    deleteGuest: deleteGuestFirebase,
    markPresent,
    markAbsent,
    importGuests,
    clearError,
    showError,
    showAlert,
    isLoading
  } = useFirebaseGuests();
  
  // Gestionnaire d'erreurs local pour les opérations UI
  const { error: localError, showError: showLocalError, clearError: clearLocalError } = useErrorHandler();

  // État local pour l'interface
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [newCompanions, setNewCompanions] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Firebase se synchronise automatiquement, on simule juste un refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAddGuest = async () => {
    setModalVisible(true);
  };

  const closeAddModal = () => {
    setModalVisible(false);
    setNewFullName('');
    setNewTableName('');
    setNewCompanions('');
  };

  const submitAddGuest = async () => {
    const guestData: CreateGuestData = {
      fullName: newFullName.trim(),
      tableName: newTableName.trim(),
      companions: parseInt(newCompanions, 10) || 0
    };

    // Validation côté client avant l'envoi
    const validation = validationService.validateCreateGuest(guestData);
    if (!validation.isValid) {
      showLocalError(validationService.formatValidationErrors(validation.errors), 'validation formulaire');
      return;
    }

    // Sanitisation des données
    const sanitizedData = validationService.sanitizeGuestData(guestData) as CreateGuestData;

    try {
      await addGuest(sanitizedData);
      closeAddModal();
    } catch (error) {
      // L'erreur est déjà gérée par le hook
      console.error('Error in submitAddGuest:', error);
    }
  };

  const handleDeleteGuest = async (id: string, name: string) => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer ${name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGuestFirebase(id);
            } catch (error) {
              // L'erreur est déjà gérée par le hook
              console.error('Error in handleDeleteGuest:', error);
            }
          }
        }
      ]
    );
  };

  const toggleGuestPresence = async (id: string, name: string, isCurrentlyPresent: boolean) => {
    const action = isCurrentlyPresent ? 'marquer comme absent' : 'marquer comme présent';
    Alert.alert(
      'Changer le statut',
      `Voulez-vous ${action} ${name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer',
          onPress: async () => {
            try {
              if (!isCurrentlyPresent) {
                await markPresent(id);
              } else {
                await markAbsent(id);
              }
            } catch (error) {
              // L'erreur est déjà gérée par le hook
              console.error('Error in toggleGuestPresence:', error);
            }
          }
        }
      ]
    );
  };

  const handleImportCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        
        Papa.parse(fileContent, {
          header: true,
          complete: async (results: any) => {
            const rawGuests: CreateGuestData[] = [];
            
            for (const row of results.data) {
              if (row.nom && row.table) {
                rawGuests.push({
                  fullName: row.nom,
                  tableName: row.table,
                  companions: parseInt(row.accompagnants) || 0
                });
              }
            }
            
            // Validation en lot
            const { valid, invalid } = validationService.validateBatch(rawGuests);
            
            if (invalid.length > 0) {
              const errorMessage = `${invalid.length} invité(s) invalide(s) ignoré(s):\n${invalid.slice(0, 3).map(item => 
                `- ${item.data.fullName}: ${validationService.formatValidationErrors(item.errors)}`
              ).join('\n')}${invalid.length > 3 ? '\n...' : ''}`;
              showLocalError(errorMessage, 'validation import CSV');
            }
            
            if (valid.length > 0) {
              try {
                await importGuests(valid);
              } catch (error) {
                console.error('Error in handleImportCSV:', error);
              }
            } else {
              showLocalError('Aucun invité valide trouvé dans le fichier', 'import CSV');
            }
          },
        });
      }
    } catch (error) {
      showLocalError(error, 'import CSV');
    }
  };

  const filteredGuests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter((g) =>
      g.fullName.toLowerCase().includes(q) || 
      g.tableName.toLowerCase().includes(q) ||
      g.companions.toString().includes(q)
    );
  }, [search, guests]);

  const statsData = useMemo(() => ({
    presentCount: stats?.present || 0,
    total: stats?.total || 0,
    absentCount: stats?.absent || 0,
    totalCompanions: stats?.totalCompanions || 0
  }), [stats]);

  const handleShareQR = useCallback((guestId: string) => {
    navigation.navigate('QRWhatsAppShare', { guestId });
  }, [navigation]);

  const renderGuestItem = useCallback(({ item }: { item: any }) => (
    <GuestItem
      guest={item}
      onTogglePresence={toggleGuestPresence}
      onDelete={handleDeleteGuest}
      onShareQR={handleShareQR}
      isLoading={isLoading}
    />
  ), [toggleGuestPresence, handleDeleteGuest, handleShareQR, isLoading]);

  const keyExtractor = useCallback((item: any) => item.id.toString(), []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Affichage des erreurs locales */}
      {localError && (
        <ErrorDisplay
          error={localError}
          onDismiss={clearLocalError}
          variant="banner"
        />
      )}
      
      <View style={styles.header}>
        <Text style={styles.title}>Invités</Text>
        <TouchableOpacity onPress={handleImportCSV}>
          <Text style={styles.headerAction}>Import</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher"
            style={styles.searchInput}
            placeholderTextColor="#8E8E93"
          />
        </View>
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>✅ {statsData.presentCount} présents • ❌ {statsData.absentCount} absents</Text>
      </View>

      <FlatList
        data={filteredGuests}
        keyExtractor={keyExtractor}
        renderItem={renderGuestItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <LoadingSpinner 
              text="Chargement des invités..." 
              variant="inline"
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun invité trouvé</Text>
              <Text style={styles.emptySubtext}>Ajoutez des invités ou importez un fichier CSV</Text>
            </View>
          )
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddGuest} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeAddModal}>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter un invité</Text>

            <ValidatedTextInput
              label="Nom complet"
              value={newFullName}
              onChangeText={setNewFullName}
              placeholder="Entrez le nom complet"
              required
              error={newFullName.trim() && validationService.validateField('fullName', newFullName)?.message}
            />
            <ValidatedTextInput
              label="Nom de la table"
              value={newTableName}
              onChangeText={setNewTableName}
              placeholder="Entrez le nom de la table"
              required
              error={newTableName.trim() && validationService.validateField('tableName', newTableName)?.message}
            />
            <ValidatedTextInput
              label="Nombre d'accompagnants"
              value={newCompanions}
              onChangeText={setNewCompanions}
              placeholder="0"
              keyboardType="numeric"
              required
              error={newCompanions.trim() && validationService.validateField('companions', parseInt(newCompanions) || 0)?.message}
            />

            <View style={styles.modalActions}>
              <Button
                title="Annuler"
                onPress={closeAddModal}
                variant="outline"
                size="md"
              />
              <LoadingButton
                title="Ajouter"
                onPress={submitAddGuest}
                variant="primary"
                size="md"
                loading={isLoading('addGuest')}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerAction: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '400',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#8E8E93',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  statsBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  statsText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },

  listContainer: {
    paddingBottom: 100,
  },

  fab: {
    position: 'absolute',
    right: 16,
    bottom: 34,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },

  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },

});