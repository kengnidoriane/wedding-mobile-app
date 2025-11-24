import React, { useState, useRef, useCallback, memo, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert, ScrollView, Animated } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';
import { generateQRData } from '../utils/qrUtils';
import { theme } from '../styles/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import * as qrSharingService from '../services/qrSharingService';
import { useFirebaseGuests } from '../hooks/useFirebaseGuests';
import { Guest } from '../types/guest';

type QRWhatsAppShareScreenParams = {
  guestId?: string;
};

// Memoized Guest Info Component to prevent unnecessary re-renders
const GuestInfoDisplay = memo(({ guest }: { guest: Guest }) => (
  <View style={styles.guestInfoContainer}>
    <Text style={styles.guestName}>{guest.fullName}</Text>
    <View style={styles.guestDetailRow}>
      <Text style={styles.guestDetail}>📍 Table : {guest.tableName}</Text>
    </View>
    <View style={styles.guestDetailRow}>
      <Text style={styles.guestDetail}>👥 Accompagnants : {guest.companions}</Text>
    </View>
  </View>
));

GuestInfoDisplay.displayName = 'GuestInfoDisplay';

// Memoized QR Code Component to prevent unnecessary re-renders
const QRCodeDisplay = memo(({ qrData, guestName, captureRef }: { 
  qrData: string; 
  guestName: string;
  captureRef: React.RefObject<ViewShot>;
}) => (
  <ViewShot
    ref={captureRef}
    options={{
      format: 'png',
      quality: 0.9,
      result: 'tmpfile',
    }}
    style={styles.qrContainer}
  >
    <View style={styles.qrWrapper}>
      <QRCode
        value={qrData}
        size={250}
        color="#000000"
        backgroundColor="#FFFFFF"
      />
      <Text style={styles.guestNameLabel}>{guestName}</Text>
    </View>
  </ViewShot>
));

QRCodeDisplay.displayName = 'QRCodeDisplay';

// Memoized Loading Overlay Component
const LoadingOverlay = memo(({ 
  visible, 
  saving, 
  overlayOpacity, 
  overlayScale 
}: { 
  visible: boolean; 
  saving: boolean;
  overlayOpacity: Animated.Value;
  overlayScale: Animated.Value;
}) => {
  if (!visible) return null;
  
  return (
    <Animated.View 
      style={[
        styles.loadingOverlay,
        {
          opacity: overlayOpacity,
        }
      ]}
    >
      <Animated.View 
        style={[
          styles.loadingContainer,
          {
            transform: [{ scale: overlayScale }],
          }
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingOverlayText}>
          {saving ? 'Sauvegarde en cours...' : 'Partage en cours...'}
        </Text>
      </Animated.View>
    </Animated.View>
  );
});

LoadingOverlay.displayName = 'LoadingOverlay';

export default function QRWhatsAppShareScreen() {
  const route = useRoute<RouteProp<{ params: QRWhatsAppShareScreenParams }, 'params'>>();
  const guestIdParam = route.params?.guestId;
  
  // Hook Firebase pour la gestion des invités
  const {
    guests,
    loading,
    findGuestById
  } = useFirebaseGuests();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharingOther, setSharingOther] = useState(false);
  const captureRef = useRef<ViewShot>(null);
  
  // Track temporary image URIs for cleanup
  const tempImageUris = useRef<Set<string>>(new Set());
  
  // Animation values for loading overlay
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const overlayScale = useRef(new Animated.Value(0.8)).current;

  // Trouver l'index de l'invité si guestId est fourni
  useEffect(() => {
    if (guestIdParam && guests.length > 0) {
      const guestIndex = guests.findIndex((guest: Guest) => guest.id === guestIdParam);
      if (guestIndex !== -1) {
        setCurrentIndex(guestIndex);
        console.log(`Set current index to ${guestIndex} for guest ID ${guestIdParam}`);
      } else {
        console.warn(`Guest with ID ${guestIdParam} not found in the list`);
      }
    }
  }, [guestIdParam, guests]);

  // Animate loading overlay when loading state changes
  useEffect(() => {
    const isLoading = sharing || saving || sharingOther;
    
    if (isLoading) {
      // Show overlay with animation
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(overlayScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide overlay with animation
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(overlayScale, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [sharing, saving, sharingOther, overlayOpacity, overlayScale]);

  // Cleanup temporary image URIs
  const cleanupTempImages = useCallback(() => {
    if (tempImageUris.current.size > 0) {
      console.log(`Cleaning up ${tempImageUris.current.size} temporary image(s)`);
      tempImageUris.current.clear();
    }
  }, []);

  // Navigation functions - memoized to prevent unnecessary re-renders
  const nextGuest = useCallback(() => {
    if (currentIndex < guests.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, guests.length]);

  const prevGuest = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Share via WhatsApp handler - memoized to prevent unnecessary re-renders
  const handleShareWhatsApp = useCallback(async () => {
    const currentGuest = guests[currentIndex];
    
    try {
      setSharing(true);
      
      // Vérifier que la référence ViewShot est disponible
      if (!captureRef || !captureRef.current) {
        console.error('ViewShot reference is not available');
        Alert.alert(
          'Erreur',
          'Le composant QR code n\'est pas prêt. Veuillez réessayer dans un instant.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
      
      // Vérifier qu'un invité est sélectionné
      if (!currentGuest) {
        console.error('No guest selected');
        Alert.alert(
          'Erreur',
          'Aucun invité sélectionné. Veuillez réessayer.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
      
      // Capture the QR code as an image
      const imageUri = await qrSharingService.captureQRCode(captureRef);
      
      // Track temporary image URI for cleanup
      tempImageUris.current.add(imageUri);
      
      // Prepare guest data for sharing (convertir l'ID en number pour compatibilité)
      const guestData = {
        id: parseInt(currentGuest.id),
        fullName: currentGuest.fullName,
        tableName: currentGuest.tableName,
        companions: currentGuest.companions,
        type: 'wedding_invitation' as const,
        timestamp: new Date().toISOString()
      };
      
      // Share via WhatsApp
      await qrSharingService.shareViaWhatsApp(imageUri, guestData);
      
      // Cleanup temporary image after successful share
      qrSharingService.cleanupTempImage(imageUri);
      tempImageUris.current.delete(imageUri);
      
      // Show success feedback
      Alert.alert(
        'Succès',
        'QR code partagé avec succès !',
        [{ text: 'OK', style: 'default' }]
      );
      
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message === qrSharingService.QRSharingError.CAPTURE_FAILED) {
          Alert.alert(
            'Erreur de capture',
            qrSharingService.ERROR_MESSAGES.CAPTURE_FAILED,
            [
              { 
                text: 'Réessayer', 
                onPress: () => handleShareWhatsApp(),
                style: 'default'
              },
              { 
                text: 'Annuler', 
                style: 'cancel'
              }
            ]
          );
        } else if (error.message === qrSharingService.QRSharingError.WHATSAPP_NOT_AVAILABLE) {
          Alert.alert(
            'WhatsApp non disponible',
            qrSharingService.ERROR_MESSAGES.WHATSAPP_NOT_AVAILABLE,
            [
              { 
                text: 'Partager autrement', 
                onPress: () => handleShareOther(),
                style: 'default'
              },
              { 
                text: 'Annuler', 
                style: 'cancel'
              }
            ]
          );
        } else if (error.message === qrSharingService.QRSharingError.SHARE_FAILED) {
          Alert.alert(
            'Erreur de partage',
            qrSharingService.ERROR_MESSAGES.SHARE_FAILED,
            [
              { 
                text: 'Partager autrement', 
                onPress: () => handleShareOther(),
                style: 'default'
              },
              { 
                text: 'Annuler', 
                style: 'cancel'
              }
            ]
          );
        } else {
          Alert.alert(
            'Erreur',
            'Une erreur est survenue lors du partage. Veuillez réessayer.',
            [{ text: 'OK', style: 'default' }]
          );
        }
      } else {
        Alert.alert(
          'Erreur',
          'Une erreur inattendue est survenue. Veuillez réessayer.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } finally {
      setSharing(false);
    }
  }, [guests, currentIndex]);

  // Save to Gallery handler - memoized to prevent unnecessary re-renders
  const handleSaveToGallery = useCallback(async () => {
    const currentGuest = guests[currentIndex];
    
    try {
      setSaving(true);
      
      // Vérifier que la référence ViewShot est disponible
      if (!captureRef || !captureRef.current) {
        console.error('ViewShot reference is not available');
        Alert.alert(
          'Erreur',
          'Le composant QR code n\'est pas prêt. Veuillez réessayer dans un instant.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
      
      // Vérifier qu'un invité est sélectionné
      if (!currentGuest) {
        console.error('No guest selected');
        Alert.alert(
          'Erreur',
          'Aucun invité sélectionné. Veuillez réessayer.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
      
      // Capture the QR code as an image
      const imageUri = await qrSharingService.captureQRCode(captureRef);
      
      // Track temporary image URI for cleanup
      tempImageUris.current.add(imageUri);
      
      // Prepare guest data for saving (convertir l'ID en number pour compatibilité)
      const guestData = {
        id: parseInt(currentGuest.id),
        fullName: currentGuest.fullName,
        tableName: currentGuest.tableName,
        companions: currentGuest.companions,
        type: 'wedding_invitation' as const,
        timestamp: new Date().toISOString()
      };
      
      // Save to gallery
      await qrSharingService.saveToGallery(imageUri, guestData);
      
      // Cleanup temporary image after successful save
      qrSharingService.cleanupTempImage(imageUri);
      tempImageUris.current.delete(imageUri);
      
      // Show success notification
      Alert.alert(
        'Succès',
        `QR code de ${currentGuest.fullName} sauvegardé dans votre galerie !`,
        [{ text: 'OK', style: 'default' }]
      );
      
    } catch (error) {
      console.error('Error saving to gallery:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message === qrSharingService.QRSharingError.CAPTURE_FAILED) {
          Alert.alert(
            'Erreur de capture',
            qrSharingService.ERROR_MESSAGES.CAPTURE_FAILED,
            [
              { 
                text: 'Réessayer', 
                onPress: () => handleSaveToGallery(),
                style: 'default'
              },
              { 
                text: 'Annuler', 
                style: 'cancel'
              }
            ]
          );
        } else if (error.message === qrSharingService.QRSharingError.PERMISSION_DENIED) {
          Alert.alert(
            'Permission refusée',
            "L'accès à la galerie est nécessaire pour sauvegarder le QR code. Veuillez activer l'accès dans les paramètres de votre téléphone.",
            [
              { 
                text: 'Ouvrir les paramètres', 
                onPress: () => {
                  console.log('User should open settings to grant permissions');
                  // Note: On pourrait utiliser Linking.openSettings() ici
                },
                style: 'default'
              },
              { 
                text: 'Annuler', 
                style: 'cancel'
              }
            ]
          );
        } else if (error.message === qrSharingService.QRSharingError.SAVE_FAILED) {
          Alert.alert(
            'Erreur de sauvegarde',
            qrSharingService.ERROR_MESSAGES.SAVE_FAILED,
            [
              { 
                text: 'Réessayer', 
                onPress: () => handleSaveToGallery(),
                style: 'default'
              },
              { 
                text: 'Annuler', 
                style: 'cancel'
              }
            ]
          );
        } else {
          Alert.alert(
            'Erreur',
            'Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.',
            [{ text: 'OK', style: 'default' }]
          );
        }
      } else {
        Alert.alert(
          'Erreur',
          'Une erreur inattendue est survenue. Veuillez réessayer.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } finally {
      setSaving(false);
    }
  }, [guests, currentIndex]);

  // Share via System handler - memoized to prevent unnecessary re-renders
  const handleShareOther = useCallback(async () => {
    const currentGuest = guests[currentIndex];
    
    try {
      setSharingOther(true);
      
      // Vérifier que la référence ViewShot est disponible
      if (!captureRef || !captureRef.current) {
        console.error('ViewShot reference is not available');
        Alert.alert(
          'Erreur',
          'Le composant QR code n\'est pas prêt. Veuillez réessayer dans un instant.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
      
      // Vérifier qu'un invité est sélectionné
      if (!currentGuest) {
        console.error('No guest selected');
        Alert.alert(
          'Erreur',
          'Aucun invité sélectionné. Veuillez réessayer.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
      
      // Capture the QR code as an image
      const imageUri = await qrSharingService.captureQRCode(captureRef);
      
      // Prepare guest data for sharing (convertir l'ID en number pour compatibilité)
      const guestData = {
        id: parseInt(currentGuest.id),
        fullName: currentGuest.fullName,
        tableName: currentGuest.tableName,
        companions: currentGuest.companions,
        type: 'wedding_invitation' as const,
        timestamp: new Date().toISOString()
      };
      
      // Share via system native share menu
      await qrSharingService.shareViaSystem(imageUri, guestData);
      
      // Cleanup temporary image after successful share
      qrSharingService.cleanupTempImage(imageUri);
      tempImageUris.current.delete(imageUri);
      
    } catch (error) {
      console.error('Error sharing via system:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message === qrSharingService.QRSharingError.CAPTURE_FAILED) {
          Alert.alert(
            'Erreur de capture',
            qrSharingService.ERROR_MESSAGES.CAPTURE_FAILED,
            [
              { 
                text: 'Réessayer', 
                onPress: () => handleShareOther(),
                style: 'default'
              },
              { 
                text: 'Annuler', 
                style: 'cancel'
              }
            ]
          );
        } else if (error.message === qrSharingService.QRSharingError.SHARE_FAILED) {
          Alert.alert(
            'Erreur de partage',
            'Impossible de partager le QR code. Veuillez réessayer.',
            [
              { 
                text: 'Réessayer', 
                onPress: () => handleShareOther(),
                style: 'default'
              },
              { 
                text: 'Annuler', 
                style: 'cancel'
              }
            ]
          );
        } else {
          Alert.alert(
            'Erreur',
            'Une erreur est survenue lors du partage. Veuillez réessayer.',
            [{ text: 'OK', style: 'default' }]
          );
        }
      } else {
        Alert.alert(
          'Erreur',
          'Une erreur inattendue est survenue. Veuillez réessayer.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } finally {
      setSharingOther(false);
    }
  }, [guests, currentIndex]);

  // Empty state when no guests are available
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Chargement des invités...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (guests.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>Aucun invité trouvé</Text>
          <Text style={styles.emptySubtext}>
            Ajoutez des invités dans la liste pour pouvoir générer et partager leurs QR codes
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentGuest = guests[currentIndex];
  const qrData = generateQRData(currentGuest);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Partage QR Code</Text>
        <Text style={styles.counter}>
          {currentIndex + 1} / {guests.length}
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.contentCard}>
          {/* Guest Information Display - Memoized */}
          <GuestInfoDisplay guest={currentGuest} />

          {/* QR Code Display - Memoized */}
          <QRCodeDisplay 
            qrData={qrData} 
            guestName={currentGuest.fullName}
            captureRef={captureRef as React.RefObject<ViewShot>}
          />

          {/* Share Actions */}
          <View style={styles.actionsContainer}>
            <Button
              title="📱 Partager via WhatsApp"
              onPress={handleShareWhatsApp}
              variant="primary"
              size="lg"
              disabled={sharing || saving || sharingOther}
            />
            <Button
              title="💾 Sauvegarder dans galerie"
              onPress={handleSaveToGallery}
              variant="secondary"
              size="lg"
              disabled={sharing || saving || sharingOther}
            />
            <Button
              title="📤 Partager autrement"
              onPress={handleShareOther}
              variant="outline"
              size="lg"
              disabled={sharing || saving || sharingOther}
            />
          </View>
        </Card>
      </ScrollView>

      {/* Navigation Controls */}
      <View style={styles.navigationContainer}>
        <View style={styles.navigationButton}>
          <Button
            title="Précédent"
            onPress={prevGuest}
            variant="outline"
            size="md"
            disabled={currentIndex === 0}
          />
        </View>
        <View style={styles.navigationButton}>
          <Button
            title="Suivant"
            onPress={nextGuest}
            variant="outline"
            size="md"
            disabled={currentIndex === guests.length - 1}
          />
        </View>
      </View>

      {/* Loading Indicator Overlay - Memoized */}
      <LoadingOverlay 
        visible={sharing || saving || sharingOther}
        saving={saving}
        overlayOpacity={overlayOpacity}
        overlayScale={overlayScale}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  counter: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  contentCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  guestInfoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  guestName: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  guestDetailRow: {
    marginVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  guestDetail: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  qrWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestNameLabel: {
    ...theme.typography.body,
    color: '#000000',
    marginTop: theme.spacing.md,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 250,
  },
  actionsContainer: {
    width: '100%',
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  navigationButton: {
    flex: 1,
    maxWidth: '48%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    minWidth: 200,
    ...theme.shadows.lg,
  },
  loadingOverlayText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    textAlign: 'center',
    fontWeight: '500',
  },
});
