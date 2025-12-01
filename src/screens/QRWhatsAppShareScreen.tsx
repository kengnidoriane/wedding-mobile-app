import React, { useState, useRef, useCallback, memo, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

// Memoized Guest Info Component
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

// Memoized QR Code Component
const QRCodeDisplay = memo(({ qrData, guestName, captureRef }: { 
  qrData: string; 
  guestName: string;
  captureRef: React.RefObject<ViewShot | null>;
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
  
  const {
    guests,
    loading,
  } = useFirebaseGuests();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharingOther, setSharingOther] = useState(false);
  const captureRef = useRef<ViewShot>(null);
  
  const tempImageUris = useRef<Set<string>>(new Set());
  
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const overlayScale = useRef(new Animated.Value(0.8)).current;

  // Find guest index if guestId is provided
  useEffect(() => {
    if (guestIdParam && guests.length > 0) {
      const guestIndex = guests.findIndex((guest: Guest) => guest.id === guestIdParam);
      if (guestIndex !== -1) {
        setCurrentIndex(guestIndex);
      }
    }
  }, [guestIdParam, guests]);

  // Animate loading overlay
  useEffect(() => {
    const isLoading = sharing || saving || sharingOther;
    
    if (isLoading) {
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

  // Cleanup temporary images
  const cleanupTempImages = useCallback(() => {
    if (tempImageUris.current.size > 0) {
      tempImageUris.current.clear();
    }
  }, []);

  // Navigation functions
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

  // Standardized error handling
  const handleError = useCallback((error: any, context: string, retryAction?: () => void) => {
    console.error(`Error in ${context}:`, error);

    const buttons = retryAction ? [
      { text: 'Réessayer', onPress: retryAction, style: 'default' as const },
      { text: 'Annuler', style: 'cancel' as const }
    ] : [{ text: 'OK', style: 'default' as const }];

    const errorMessage = error?.message || 'Une erreur inattendue est survenue. Veuillez réessayer.';
    Alert.alert('Erreur', errorMessage, buttons);
  }, []);

  // Share via WhatsApp
  const handleShareWhatsApp = useCallback(async () => {
    const currentGuest = guests?.[currentIndex];
    
    if (!currentGuest) {
      Alert.alert('Erreur', 'Aucun invité sélectionné');
      return;
    }
    
    try {
      setSharing(true);
      
      if (!captureRef?.current) {
        Alert.alert('Erreur', 'Le composant QR code n\'est pas prêt');
        return;
      }
      
      const imageUri = await qrSharingService.captureQRCode(captureRef);
      tempImageUris.current.add(imageUri);
      
      const guestData = {
        id: currentGuest.id,
        fullName: currentGuest.fullName,
        tableName: currentGuest.tableName,
        companions: currentGuest.companions,
        type: 'wedding_invitation' as const,
        timestamp: new Date().toISOString()
      };
      
      await qrSharingService.shareViaWhatsApp(imageUri, guestData);
      qrSharingService.cleanupTempImage(imageUri);
      tempImageUris.current.delete(imageUri);
      
      Alert.alert('Succès', 'QR code partagé avec succès !');
      
    } catch (error: any) {
      handleError(error, 'WhatsApp sharing', handleShareWhatsApp);
    } finally {
      setSharing(false);
    }
  }, [guests, currentIndex, handleError]);

  // Share via other methods
  const handleShareOther = useCallback(async () => {
    const currentGuest = guests?.[currentIndex];
    
    if (!currentGuest) {
      Alert.alert('Erreur', 'Aucun invité sélectionné');
      return;
    }
    
    try {
      setSharingOther(true);
      
      if (!captureRef?.current) {
        Alert.alert('Erreur', 'Le composant QR code n\'est pas prêt');
        return;
      }
      
      const imageUri = await qrSharingService.captureQRCode(captureRef);
      tempImageUris.current.add(imageUri);
      
      const guestData = {
        id: currentGuest.id,
        fullName: currentGuest.fullName,
        tableName: currentGuest.tableName,
        companions: currentGuest.companions,
        type: 'wedding_invitation' as const,
        timestamp: new Date().toISOString()
      };
      
      await qrSharingService.shareViaOther(imageUri, guestData);
      qrSharingService.cleanupTempImage(imageUri);
      tempImageUris.current.delete(imageUri);
      
      Alert.alert('Succès', 'QR code partagé avec succès !');
      
    } catch (error: any) {
      handleError(error, 'other sharing', handleShareOther);
    } finally {
      setSharingOther(false);
    }
  }, [guests, currentIndex, handleError]);

  // Save to Gallery
  const handleSaveToGallery = useCallback(async () => {
    const currentGuest = guests?.[currentIndex];
    
    if (!currentGuest) {
      Alert.alert('Erreur', 'Aucun invité sélectionné');
      return;
    }
    
    qrSharingService.showSharingWarning(currentGuest.fullName, async () => {
      try {
        setSaving(true);
      
        if (!captureRef?.current) {
          Alert.alert('Erreur', 'Le composant QR code n\'est pas prêt');
          return;
        }
        
        const imageUri = await qrSharingService.captureQRCode(captureRef);
        tempImageUris.current.add(imageUri);
        
        const guestData = {
          id: currentGuest.id,
          fullName: currentGuest.fullName,
          tableName: currentGuest.tableName,
          companions: currentGuest.companions,
          type: 'wedding_invitation' as const,
          timestamp: new Date().toISOString()
        };
        
        await qrSharingService.saveToGallery(imageUri, guestData);
        qrSharingService.cleanupTempImage(imageUri);
        tempImageUris.current.delete(imageUri);
        
        Alert.alert('Succès', 'QR code sauvegardé dans la galerie !');
        
      } catch (error: any) {
        handleError(error, 'gallery saving', handleSaveToGallery);
      } finally {
        setSaving(false);
      }
    });
  }, [guests, currentIndex, handleError]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      cleanupTempImages();
    };
  }, [cleanupTempImages]);

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

  if (!guests || guests.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Aucun invité trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentGuest = guests[currentIndex];
  if (!currentGuest) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Invité non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  const qrData = generateQRData(currentGuest);

  // @ts-ignore
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Text style={styles.title}>QR Code - Invitation</Text>
          
          <GuestInfoDisplay guest={currentGuest} />
          
          <QRCodeDisplay 
            qrData={qrData} 
            guestName={currentGuest.fullName}
            captureRef={captureRef}
          />
          
          <View style={styles.navigationContainer}>
            <Button
              title="← Précédent"
              onPress={prevGuest}
              disabled={currentIndex === 0}
              variant="outline"
              style={styles.navButton}
            />
            
            <Text style={styles.counterText}>
              {currentIndex + 1} / {guests.length}
            </Text>
            
            <Button
              title="Suivant →"
              onPress={nextGuest}
              disabled={currentIndex === guests.length - 1}
              variant="outline"
              style={styles.navButton}
            />
          </View>
          
          <View style={styles.actionContainer}>
            <Button
              title="📱 Partager WhatsApp"
              onPress={handleShareWhatsApp}
              disabled={sharing || saving || sharingOther}
            />
            
            <Button
              title="📤 Partager autrement"
              onPress={handleShareOther}
              disabled={sharing || saving || sharingOther}
              variant="outline"
            />
            
            <Button
              title="💾 Sauvegarder"
              onPress={handleSaveToGallery}
              disabled={sharing || saving || sharingOther}
              variant="outline"
            />
          </View>
        </Card>
      </ScrollView>
      
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
    padding: theme.spacing.md,
  },
  card: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  guestInfoContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  guestName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  guestDetailRow: {
    marginBottom: theme.spacing.xs,
  },
  guestDetail: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  guestNameLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  navButton: {
    flex: 0.3,
  },
  counterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  actionContainer: {
    gap: theme.spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.text,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingOverlayText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
});