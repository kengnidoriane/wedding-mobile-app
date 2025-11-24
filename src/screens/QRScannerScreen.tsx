import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Modal, SafeAreaView, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { markGuestPresent, getAllGuests } from '../db/database';
import { parseQRData, GuestQRData } from '../utils/qrUtils';
import { theme } from '../styles/theme';
import Button from '../components/Button';
import Card from '../components/Card';

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestQRData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = async ({ data }: any) => {
    setScanned(true);

    const guestData = parseQRData(data);
    
    if (guestData) {
      const allGuests = await getAllGuests();
      const existingGuest = allGuests.find((g: any) => g.id === guestData.id);
      
      if (existingGuest) {
        setGuestInfo(guestData);
        setShowModal(true);
      } else {
        Alert.alert('Erreur', 'Invité non trouvé dans la base de données');
      }
    } else {
      try {
        const guestId = parseInt(data);
        const allGuests = await getAllGuests();
        const guest = allGuests.find((g: any) => g.id === guestId);
        
        if (guest) {
          setGuestInfo({
            id: guest.id,
            fullName: guest.fullName,
            tableName: guest.tableName,
            companions: guest.companions
          });
          setShowModal(true);
        } else {
          Alert.alert('Erreur', 'Invité non trouvé');
        }
      } catch {
        Alert.alert('Erreur', 'QR code invalide');
      }
    }

    setTimeout(() => setScanned(false), 3000);
  };

  const searchGuests = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const allGuests = await getAllGuests();
    const filtered = allGuests.filter((guest: any) =>
      guest.fullName.toLowerCase().includes(query.toLowerCase()) ||
      guest.tableName.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const selectManualGuest = (guest: any) => {
    setGuestInfo({
      id: guest.id,
      fullName: guest.fullName,
      tableName: guest.tableName,
      companions: guest.companions
    });
    setShowManualSearch(false);
    setShowModal(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  const confirmPresence = async () => {
    if (guestInfo) {
      try {
        const allGuests = await getAllGuests();
        const currentGuest = allGuests.find((g: any) => g.id === guestInfo.id);
        
        if (currentGuest?.isPresent === 1) {
          Alert.alert(
            'ℹ️ Déjà présent',
            `${guestInfo.fullName} est déjà marqué(e) comme présent(e)`
          );
        } else {
          await markGuestPresent(guestInfo.id);
          Alert.alert(
            '✅ Présence confirmée !', 
            `${guestInfo.fullName} a été marqué(e) comme présent(e)`
          );
        }
        
        setShowModal(false);
        setGuestInfo(null);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de marquer la présence');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setGuestInfo(null);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement de la caméra...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Accès à la caméra requis</Text>
          <Text style={styles.permissionText}>
            Pour scanner les QR codes, nous avons besoin d'accéder à votre caméra
          </Text>
          <Button 
            title="Autoriser la caméra" 
            onPress={requestPermission}
            icon="📷"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scanner QR Code</Text>
        <Text style={styles.subtitle}>Placez le QR code dans le cadre</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
        </View>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {scanned ? 'Traitement en cours...' : 'Alignez le QR code dans le cadre'}
        </Text>
        
        <Button
          title="Recherche manuelle"
          onPress={() => setShowManualSearch(true)}
          variant="outline"
          size="md"
          icon="🔍"
        />
      </View>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Invité détecté</Text>
            
            {guestInfo && (
              <>
                <View style={styles.guestInfoContainer}>
                  <Text style={styles.guestName}>{guestInfo.fullName}</Text>
                  <View style={styles.guestDetails}>
                    <Text style={styles.guestDetail}>📍 Table : {guestInfo.tableName}</Text>
                    <Text style={styles.guestDetail}>👥 Accompagnants : {guestInfo.companions}</Text>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <Button 
                    title="Marquer présent"
                    onPress={confirmPresence}
                    icon="✅"
                    variant="primary"
                  />
                  <Button 
                    title="Fermer"
                    onPress={closeModal}
                    icon="❌"
                    variant="outline"
                  />
                </View>
              </>
            )}
          </Card>
        </View>
      </Modal>

      <Modal
        visible={showManualSearch}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowManualSearch(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.searchModalContent}>
            <Text style={styles.modalTitle}>🔍 Recherche manuelle</Text>
            
            <TextInput
              value={searchQuery}
              onChangeText={searchGuests}
              placeholder="Rechercher un invité..."
              style={styles.searchInput}
              placeholderTextColor={theme.colors.textLight}
              autoFocus
            />

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              style={styles.searchResultsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => selectManualGuest(item)}
                >
                  <Text style={styles.searchResultName}>{item.fullName}</Text>
                  <Text style={styles.searchResultDetails}>
                    Table: {item.tableName} • Accompagnants: {item.companions}
                  </Text>
                  <Text style={styles.searchResultStatus}>
                    {item.isPresent === 1 ? '✅ Déjà présent' : '⏳ Absent'}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery.length >= 2 ? (
                  <Text style={styles.noResultsText}>Aucun invité trouvé</Text>
                ) : (
                  <Text style={styles.searchHintText}>Tapez au moins 2 caractères pour rechercher</Text>
                )
              }
            />

            <Button
              title="Fermer"
              onPress={() => {
                setShowManualSearch(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              variant="outline"
              size="md"
            />
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
  cameraContainer: {
    flex: 1,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'transparent',
  },
  instructions: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  instructionText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  permissionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  permissionText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
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
    alignItems: 'center',
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  guestInfoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    width: '100%',
  },
  guestName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  guestDetails: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  guestDetail: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  searchModalContent: {
    width: '100%',
    maxHeight: '80%',
  },
  searchInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
  },
  searchResultsList: {
    maxHeight: 300,
    marginBottom: theme.spacing.md,
  },
  searchResultItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchResultName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  searchResultDetails: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  searchResultStatus: {
    ...theme.typography.small,
    color: theme.colors.textLight,
  },
  noResultsText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
  searchHintText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
});