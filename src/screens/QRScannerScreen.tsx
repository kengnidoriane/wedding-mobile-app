import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Modal, SafeAreaView, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { parseQRData, GuestQRData } from '../utils/qrUtils';
import { theme } from '../styles/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LoadingButton } from '../components/LoadingButton';
import { useFirebaseGuests } from '../hooks/useFirebaseGuests';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { Guest } from '../types/guest';

export default function QRScannerScreen() {
  // Hook Firebase pour la gestion des invités
  const {
    guests,
    loading,
    markPresent,
    findGuestById,
    isLoading
  } = useFirebaseGuests();
  
  // Gestionnaire d'erreurs standardisé
  const { error, showError, showAlert, clearError } = useErrorHandler();

  // États locaux
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Guest[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = async ({ data }: any) => {
    if (processing) return; // Éviter les scans multiples
    
    setScanned(true);
    setProcessing(true);

    try {
      // Essayer de parser le QR code comme JSON (nouveau format)
      const guestData = parseQRData(data);
      let guest: Guest | undefined;
      
      if (guestData) {
        // QR code au nouveau format JSON
        guest = findGuestById(guestData.id.toString());
      } else {
        // Essayer comme ID simple (ancien format)
        try {
          const guestId = parseInt(data);
          guest = findGuestById(guestId.toString());
        } catch {
          // Essayer de chercher par nom si ce n'est pas un ID
          guest = guests.find(g => 
            g.fullName.toLowerCase().includes(data.toLowerCase()) ||
            g.id === data
          );
        }
      }
      
      if (guest) {
        setCurrentGuest(guest);
        
        // Vérifier si l'invité est déjà présent (protection contre double scan)
        if (guest.isPresent) {
          // QR code déjà utilisé - Afficher une erreur claire
          Alert.alert(
            '🚫 QR Code déjà utilisé !',
            `❌ Ce QR code a déjà été scanné !\n\n👤 Invité : ${guest.fullName}\n📍 Table : ${guest.tableName}\n👥 Accompagnants : ${guest.companions}\n\n⚠️ Cet invité est déjà marqué comme présent. Chaque QR code ne peut être utilisé qu'une seule fois.`,
            [
              {
                text: 'Compris',
                style: 'default'
              }
            ]
          );
        } else {
          // Marquer automatiquement comme présent
          console.log('📱 QR Scanner: Calling markPresent for guest:', guest.fullName, 'ID:', guest.id);
          await markPresent(guest.id);
          console.log('📱 QR Scanner: markPresent completed');
          
          // Afficher les détails de l'invité dans la modal (pas d'alerte)
          setShowModal(true);
        }
      } else {
        Alert.alert(
          '❌ Invité non trouvé',
          'Ce QR code ne correspond à aucun invité dans la base de données.',
          [
            {
              text: 'Recherche manuelle',
              onPress: () => setShowManualSearch(true)
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      showAlert(error, 'traitement QR code');
    } finally {
      setProcessing(false);
      // Permettre un nouveau scan après 2 secondes
      setTimeout(() => setScanned(false), 2000);
    }
  };

  const searchGuests = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const filtered = guests.filter((guest: Guest) =>
      guest.fullName.toLowerCase().includes(query.toLowerCase()) ||
      guest.tableName.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  }, [guests]);

  const selectManualGuest = useCallback(async (guest: Guest) => {
    setCurrentGuest(guest);
    setShowManualSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    
    // Marquer automatiquement comme présent si pas déjà présent
    if (!guest.isPresent) {
      try {
        await markPresent(guest.id);
      } catch (error) {
        showAlert(error, 'marquage présence');
        return;
      }
    }
    
    // Afficher la modal avec les détails (pas d'alerte)
    setShowModal(true);
  }, [markPresent, showAlert]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setCurrentGuest(null);
  }, []);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner 
          text="Chargement de la caméra..." 
          variant="fullscreen"
        />
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
      {/* Affichage des erreurs */}
      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={clearError}
          variant="banner"
        />
      )}
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
          {processing ? 'Traitement en cours...' : 
           scanned ? 'QR code détecté !' : 
           'Alignez le QR code dans le cadre'}
        </Text>
        
        {processing && (
          <LoadingSpinner size="small" variant="inline" />
        )}
        
        <LoadingButton
          title="Recherche manuelle"
          onPress={() => setShowManualSearch(true)}
          variant="outline"
          size="md"
          icon="🔍"
          loading={processing}
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
            {currentGuest && (
              <>
                {/* En-tête avec statut */}
                <View style={[
                  styles.statusHeader,
                  { backgroundColor: currentGuest.isPresent ? '#34C759' : '#FF9500' }
                ]}>
                  <Text style={styles.statusIcon}>
                    {currentGuest.isPresent ? '✅' : '⚠️'}
                  </Text>
                  <Text style={styles.statusTitle}>
                    {currentGuest.isPresent ? 'Entrée autorisée !' : 'Invité détecté'}
                  </Text>
                </View>

                {/* Informations de l'invité */}
                <View style={styles.guestInfoContainer}>
                  <Text style={styles.welcomeText}>
                    {currentGuest.isPresent ? '🎉 Bienvenue !' : '👤 Invité'}
                  </Text>
                  <Text style={styles.guestName}>{currentGuest.fullName}</Text>
                  
                  <View style={styles.guestDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📍</Text>
                      <Text style={styles.detailLabel}>Table :</Text>
                      <Text style={styles.detailValue}>{currentGuest.tableName}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>👥</Text>
                      <Text style={styles.detailLabel}>Total personnes :</Text>
                      <Text style={styles.detailValue}>
                        {1 + currentGuest.companions} 
                        {currentGuest.companions > 0 && ` (vous + ${currentGuest.companions})`}
                      </Text>
                    </View>
                  </View>

                  {currentGuest.isPresent && (
                    <View style={styles.successBanner}>
                      <Text style={styles.successText}>
                        ✅ Présence enregistrée avec succès !
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.buttonContainer}>
                  <Button 
                    title="Parfait !"
                    onPress={closeModal}
                    icon="👍"
                    variant="primary"
                    size="lg"
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
                  <Text style={[
                    styles.searchResultStatus,
                    { color: item.isPresent ? theme.colors.success : theme.colors.error }
                  ]}>
                    {item.isPresent ? '✅ Déjà présent' : '⏳ Absent'}
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
    padding: 0,
    overflow: 'hidden',
  },
  statusHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  guestInfoContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  welcomeText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  guestName: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  guestDetails: {
    width: '100%',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  successBanner: {
    backgroundColor: '#E8F5E9',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    width: '100%',
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
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