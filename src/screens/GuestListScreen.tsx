import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, RefreshControl, Modal, Alert, SafeAreaView } from 'react-native';
import { getAllGuests, addGuest, deleteGuest, markGuestPresent } from '../db/database';
import db from '../db/database';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import { theme } from '../styles/theme';
import Button from '../components/Button';
import Card from '../components/Card';

export default function GuestListScreen({ navigation }: any) {
  const [guests, setGuests] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [newCompanions, setNewCompanions] = useState('');

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    const data = await getAllGuests();
    setGuests(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGuests();
    setRefreshing(false);
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
      Alert.alert('Champs invalides', "Veuillez remplir correctement tous les champs.");
      return;
    }

    await addGuest(fullName, tableName, companionsNum);
    closeAddModal();
    loadGuests();
  };

  const handleDeleteGuest = async (id: number, name: string) => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer ${name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            await deleteGuest(id);
            loadGuests();
          }
        }
      ]
    );
  };

  const toggleGuestPresence = async (id: number, name: string, isCurrentlyPresent: boolean) => {
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
                await markGuestPresent(id);
              } else {
                // Marquer comme absent (remettre à 0)
                await db.runAsync('UPDATE guests SET isPresent = 0 WHERE id = ?', [id]);
              }
              loadGuests();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de changer le statut');
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
          complete: async (results) => {
            let imported = 0;
            for (const row of results.data) {
              if (row.nom && row.table) {
                await addGuest(row.nom, row.table, parseInt(row.accompagnants) || 0);
                imported++;
              }
            }
            loadGuests();
            Alert.alert('Succès', `${imported} invités importés`);
          },
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'importer le fichier');
    }
  };

  const filteredGuests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter((g: any) =>
      (g.fullName || '').toLowerCase().includes(q) || 
      (g.tableName || '').toLowerCase().includes(q) ||
      g.companions.toString().includes(q)
    );
  }, [search, guests]);

  const presentCount = useMemo(() => guests.filter((g: any) => g.isPresent === 1).length, [guests]);
  const total = guests.length;
  const absentCount = total - presentCount;
  const totalCompanions = useMemo(() => guests.reduce((sum, guest) => sum + guest.companions, 0), [guests]);

  const renderGuestItem = ({ item }: { item: any }) => {
    const isPresent = item.isPresent === 1;
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
          <Button
            title={isPresent ? "Marquer absent" : "Marquer présent"}
            onPress={() => toggleGuestPresence(item.id, item.fullName, isPresent)}
            variant={isPresent ? "outline" : "primary"}
            size="sm"
            icon={isPresent ? "❌" : "✅"}
          />
          <Button
            title="Partager QR"
            onPress={() => navigation.navigate('QRWhatsAppShare', { guestId: item.id })}
            variant="secondary"
            size="sm"
            icon="💬"
          />
          <Button
            title="Supprimer"
            onPress={() => handleDeleteGuest(item.id, item.fullName)}
            variant="outline"
            size="sm"
            icon="🗑️"
          />
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Liste des invités</Text>
        <Text style={styles.subtitle}>Gérez vos invitations</Text>
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
        <Button
          title="Importer CSV"
          onPress={handleImportCSV}
          variant="secondary"
          size="md"
          icon="📁"
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun invité trouvé</Text>
            <Text style={styles.emptySubtext}>Ajoutez des invités ou importez un fichier CSV</Text>
          </View>
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
              <Button
                title="Ajouter"
                onPress={submitAddGuest}
                variant="primary"
                size="md"
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
});