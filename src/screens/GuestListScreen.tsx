import React, { useMemo, useState } from 'react';
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
import { useFirebaseGuests } from '../hooks/useFirebaseGuests';
import { useErrorHandler } from '../hooks/useErrorHandler';
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
    const fullName = newFullName.trim();
    const tableName = newTableName.trim();
    const companionsNum = parseInt(newCompanions, 10);

    if (!fullName || !tableName || isNaN(companionsNum) || companionsNum < 0) {
      showLocalError('Veuillez remplir correctement tous les champs', 'validation formulaire');
      return;
    }

    const guestData: CreateGuestData = {
      fullName,
      tableName,
      companions: companionsNum
    };

    try {
      await addGuest(guestData);
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
            const guestsToImport: CreateGuestData[] = [];
            
            for (const row of results.data) {
              if (row.nom && row.table) {
                guestsToImport.push({
                  fullName: row.nom,
                  tableName: row.table,
                  companions: parseInt(row.accompagnants) || 0
                });
              }
            }
            
            if (guestsToImport.length > 0) {
              try {
                await importGuests(guestsToImport);
              } catch (error) {
                // L'erreur est déjà gérée par le hook
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
      (g.fullName || '').toLowerCase().includes(q) || 
      (g.tableName || '').toLowerCase().includes(q) ||
      g.companions.toString().includes(q)
    );
  }, [search, guests]);

  // Utiliser les statistiques du hook Firebase
  const presentCount = stats?.present || 0;
  const total = stats?.total || 0;
  const absentCount = stats?.absent || 0;
  const totalCompanions = stats?.totalCompanions || 0;

  const renderGuestItem = ({ item }: { item: any }) => {
    const isPresent = item.isPresent;
    return (
      <Card style={styles.guestCard}>
        <View style={styles.guestHeader}>
          <Text style={styles.guestName}>{item.fullName}</Text>
          <View style={[styles.statusBadge, isPresent ? styles.presentBadge : styles.absentBadge]}>
            <Text style={[styles.statusText, isPresent ? styles.presentText : styles.absentText]}>
              {isPresent ? '✅ Présent' : '⏳ Absent'}
            </Text>
          </View>
        </View>

        <View style={styles.guestInfo}>
          <Text style={styles.infoItem}>📍 Table: {item.tableName}</Text>
          <Text style={styles.infoItem}>👥 Accompagnants: {item.companions}</Text>
        </View>

        <View style={styles.guestActions}>
          <LoadingButton
            title={isPresent ? "Marquer absent" : "Marquer présent"}
            onPress={() => toggleGuestPresence(item.id, item.fullName, isPresent)}
            variant={isPresent ? "outline" : "primary"}
            size="sm"
            icon={isPresent ? "❌" : "✅"}
            loading={isLoading('markPresent') || isLoading('markAbsent')}
          />
          <Button
            title="Partager QR"
            onPress={() => navigation.navigate('QRWhatsAppShare', { guestId: item.id })}
            variant="secondary"
            size="sm"
            icon="💬"
          />
          <LoadingButton
            title="Supprimer"
            onPress={() => handleDeleteGuest(item.id, item.fullName)}
            variant="outline"
            size="sm"
            icon="🗑️"
            loading={isLoading('deleteGuest')}
          />
        </View>
      </Card>
    );
  };

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
        <Text style={styles.title}>Liste des invités</Text>
        <Text style={styles.subtitle}>Gérez vos invitations</Text>
        
        {/* Indicateur de synchronisation */}
        <View style={styles.syncIndicator}>
          {syncState.status === SyncStatus.SYNCING && (
            <View style={styles.syncingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.syncText}>Synchronisation...</Text>
            </View>
          )}
          {syncState.status === SyncStatus.SUCCESS && syncState.lastSync && (
            <Text style={styles.syncText}>
              ✅ Synchronisé {new Date(syncState.lastSync).toLocaleTimeString()}
            </Text>
          )}
          {syncState.status === SyncStatus.ERROR && (
            <TouchableOpacity onPress={clearError} style={styles.errorContainer}>
              <Text style={styles.errorText}>❌ Erreur de sync - Appuyer pour réessayer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher par nom, table ou nb accompagnants..."
          style={styles.searchInput}
          placeholderTextColor={theme.colors.textLight}
          clearButtonMode="while-editing"
        />
      </View>

      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>📊 Statistiques</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{total}</Text>
            <Text style={styles.statLabel}>Invités</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.success }]}>{presentCount}</Text>
            <Text style={styles.statLabel}>Présents</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.error }]}>{absentCount}</Text>
            <Text style={styles.statLabel}>Absents</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalCompanions}</Text>
            <Text style={styles.statLabel}>Accompagnants</Text>
          </View>
        </View>
      </Card>

      <View style={styles.actionButtons}>
        <LoadingButton
          title="Importer CSV"
          onPress={handleImportCSV}
          variant="secondary"
          size="md"
          icon="📁"
          loading={isLoading('importGuests')}
        />
        <Button
          title="QR Codes"
          onPress={() => navigation.navigate('QRBulkGenerator')}
          variant="primary"
          size="md"
          icon="📱"
        />
      </View>

      <FlatList
        data={filteredGuests}
        keyExtractor={(item) => item.id.toString()}
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

            <TextInput
              value={newFullName}
              onChangeText={setNewFullName}
              placeholder="Nom complet"
              style={styles.modalInput}
              placeholderTextColor={theme.colors.textLight}
            />
            <TextInput
              value={newTableName}
              onChangeText={setNewTableName}
              placeholder="Nom de la table"
              style={styles.modalInput}
              placeholderTextColor={theme.colors.textLight}
            />
            <TextInput
              value={newCompanions}
              onChangeText={setNewCompanions}
              placeholder="Nombre d'accompagnants"
              keyboardType="numeric"
              style={styles.modalInput}
              placeholderTextColor={theme.colors.textLight}
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
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
    ...theme.shadows.sm,
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
  statsGrid: {
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
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
  guestCard: {
    marginBottom: theme.spacing.md,
  },
  guestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  guestName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  presentBadge: {
    backgroundColor: theme.colors.success + '20',
  },
  absentBadge: {
    backgroundColor: theme.colors.error + '20',
  },
  statusText: {
    ...theme.typography.small,
    fontWeight: '600',
  },
  presentText: {
    color: theme.colors.success,
  },
  absentText: {
    color: theme.colors.error,
  },
  guestInfo: {
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  infoItem: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  guestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  fabText: {
    color: theme.colors.surface,
    fontSize: 24,
    fontWeight: 'bold',
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
  modalInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  syncIndicator: {
    marginTop: theme.spacing.sm,
    alignItems: 'center',
  },
  syncingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  syncText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.error + '20',
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
  },
});