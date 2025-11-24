import { RefObject } from 'react';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Paths, File } from 'expo-file-system';
import { Alert } from 'react-native';
import { GuestQRData } from '../utils/qrUtils';

// Types d'erreurs pour le service de partage QR
export enum QRSharingError {
  CAPTURE_FAILED = 'CAPTURE_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SHARE_FAILED = 'SHARE_FAILED',
  SAVE_FAILED = 'SAVE_FAILED',
  NO_GUESTS = 'NO_GUESTS',
  WHATSAPP_NOT_AVAILABLE = 'WHATSAPP_NOT_AVAILABLE'
}

// Messages d'erreur en français
export const ERROR_MESSAGES = {
  CAPTURE_FAILED: 'Impossible de capturer le QR code. Veuillez réessayer.',
  PERMISSION_DENIED: "Permission refusée. Activez l'accès à la galerie dans les paramètres.",
  SHARE_FAILED: 'Impossible de partager. Vérifiez que WhatsApp est installé.',
  SAVE_FAILED: "Impossible de sauvegarder l'image. Vérifiez l'espace disponible.",
  NO_GUESTS: "Aucun invité trouvé. Ajoutez des invités d'abord.",
  WHATSAPP_NOT_AVAILABLE: "WhatsApp n'est pas installé. Utilisez le partage standard."
};

/**
 * Capture le QR code comme image PNG
 * @param viewShotRef - Référence au composant ViewShot
 * @returns URI de l'image capturée
 */
export const captureQRCode = async (
  viewShotRef: RefObject<any>
): Promise<string> => {
  try {
    // Vérifier que la référence ViewShot existe
    if (!viewShotRef) {
      console.error('ViewShot ref is null or undefined');
      throw new Error(QRSharingError.CAPTURE_FAILED);
    }
    
    if (!viewShotRef.current) {
      console.error('ViewShot ref.current is not available');
      throw new Error(QRSharingError.CAPTURE_FAILED);
    }
    
    if (typeof viewShotRef.current.capture !== 'function') {
      console.error('ViewShot capture method is not available');
      throw new Error(QRSharingError.CAPTURE_FAILED);
    }
    
    // Capturer l'image
    const uri = await viewShotRef.current.capture();
    
    // Vérifier que l'URI est valide
    if (!uri || typeof uri !== 'string' || uri.trim() === '') {
      console.error('Capture returned invalid URI:', uri);
      throw new Error(QRSharingError.CAPTURE_FAILED);
    }
    
    console.log('QR code captured successfully:', uri);
    return uri;
  } catch (error) {
    console.error('Error capturing QR code:', error);
    
    // Si c'est déjà notre erreur personnalisée, la relancer
    if (error instanceof Error && error.message === QRSharingError.CAPTURE_FAILED) {
      throw error;
    }
    
    // Sinon, créer une nouvelle erreur
    throw new Error(QRSharingError.CAPTURE_FAILED);
  }
};

/**
 * Génère le message de partage WhatsApp personnalisé
 * @param guest - Données de l'invité
 * @returns Message formaté pour WhatsApp
 */
export const generateShareMessage = (guest: GuestQRData): string => {
  return `🎉 *Invitation de mariage*

Bonjour ${guest.fullName} !

Voici votre QR code d'invitation personnalisé 📱

*Détails de votre invitation :*
📍 Table : ${guest.tableName}
👥 Accompagnants : ${guest.companions}
🆔 ID : #${guest.id}

*Instructions :*
1️⃣ Sauvegardez cette image sur votre téléphone
2️⃣ Présentez-la à l'entrée le jour J
3️⃣ Notre équipe la scannera pour confirmer votre présence

Merci et à très bientôt ! 💒✨`;
};

/**
 * Partage l'image QR code via WhatsApp
 * @param imageUri - URI de l'image capturée
 * @param guest - Données de l'invité
 */
export const shareViaWhatsApp = async (
  imageUri: string,
  guest: GuestQRData
): Promise<void> => {
  try {
    // Valider les paramètres
    if (!imageUri || typeof imageUri !== 'string') {
      console.error('Invalid image URI provided:', imageUri);
      throw new Error(QRSharingError.SHARE_FAILED);
    }
    
    if (!guest || !guest.fullName) {
      console.error('Invalid guest data provided:', guest);
      throw new Error(QRSharingError.SHARE_FAILED);
    }
    
    // Vérifier si le partage est disponible
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      console.error('Sharing is not available on this device');
      throw new Error(QRSharingError.WHATSAPP_NOT_AVAILABLE);
    }
    
    // Partager l'image avec le titre personnalisé
    await Sharing.shareAsync(imageUri, {
      mimeType: 'image/png',
      dialogTitle: `Invitation - ${guest.fullName}`,
      UTI: 'public.png'
    });
    
    console.log('Successfully shared via WhatsApp for guest:', guest.fullName);
    
  } catch (error) {
    console.error('Error sharing via WhatsApp:', error);
    
    // Si c'est déjà notre erreur personnalisée, la relancer
    if (error instanceof Error && 
        (error.message === QRSharingError.SHARE_FAILED || 
         error.message === QRSharingError.WHATSAPP_NOT_AVAILABLE)) {
      throw error;
    }
    
    // Sinon, créer une nouvelle erreur
    throw new Error(QRSharingError.SHARE_FAILED);
  }
};

/**
 * Sauvegarde l'image QR code dans la galerie
 * @param imageUri - URI de l'image capturée
 * @param guest - Données de l'invité
 */
export const saveToGallery = async (
  imageUri: string,
  guest: GuestQRData
): Promise<void> => {
  try {
    // Valider les paramètres
    if (!imageUri || typeof imageUri !== 'string') {
      console.error('Invalid image URI provided:', imageUri);
      throw new Error(QRSharingError.SAVE_FAILED);
    }
    
    if (!guest || !guest.fullName) {
      console.error('Invalid guest data provided:', guest);
      throw new Error(QRSharingError.SAVE_FAILED);
    }
    
    // Demander les permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    
    if (status !== 'granted') {
      console.error('Media library permission denied');
      throw new Error(QRSharingError.PERMISSION_DENIED);
    }
    
    // Créer un nom de fichier unique et sécurisé
    const timestamp = new Date().getTime();
    const sanitizedName = guest.fullName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `QR_${sanitizedName}_${timestamp}.png`;
    const destinationFile = new File(Paths.document, fileName);
    
    // Créer un File à partir de l'URI source
    const sourceFile = new File(imageUri);
    
    // Vérifier que le fichier source existe
    if (!sourceFile.exists) {
      console.error('Source file does not exist:', imageUri);
      throw new Error(QRSharingError.SAVE_FAILED);
    }
    
    // Copier le fichier temporaire vers un emplacement permanent
    sourceFile.copy(destinationFile);
    
    // Vérifier que la copie a réussi
    if (!destinationFile.exists) {
      console.error('Failed to copy file to destination');
      throw new Error(QRSharingError.SAVE_FAILED);
    }
    
    // Créer l'asset dans la galerie
    const asset = await MediaLibrary.createAssetAsync(destinationFile.uri);
    
    if (!asset) {
      console.error('Failed to create media library asset');
      throw new Error(QRSharingError.SAVE_FAILED);
    }
    
    // Essayer de créer ou récupérer l'album "Wedding QR Codes"
    try {
      const album = await MediaLibrary.getAlbumAsync('Wedding QR Codes');
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        console.log('Added to existing album: Wedding QR Codes');
      } else {
        await MediaLibrary.createAlbumAsync('Wedding QR Codes', asset, false);
        console.log('Created new album: Wedding QR Codes');
      }
    } catch (albumError) {
      // Si la création d'album échoue, l'image est quand même sauvegardée dans la galerie
      console.warn('Could not create album, but image was saved:', albumError);
    }
    
    // Nettoyer le fichier temporaire
    try {
      destinationFile.delete();
      console.log('Cleaned up temporary file');
    } catch (cleanupError) {
      console.warn('Could not cleanup temporary file:', cleanupError);
    }
    
    console.log('Successfully saved to gallery for guest:', guest.fullName);
    
  } catch (error) {
    console.error('Error saving to gallery:', error);
    
    // Si c'est déjà notre erreur personnalisée, la relancer
    if (error instanceof Error && 
        (error.message === QRSharingError.PERMISSION_DENIED || 
         error.message === QRSharingError.SAVE_FAILED)) {
      throw error;
    }
    
    // Sinon, créer une nouvelle erreur
    throw new Error(QRSharingError.SAVE_FAILED);
  }
};

/**
 * Partage l'image via le menu de partage natif du système
 * @param imageUri - URI de l'image capturée
 * @param guest - Données de l'invité
 */
export const shareViaSystem = async (
  imageUri: string,
  guest: GuestQRData
): Promise<void> => {
  try {
    // Valider les paramètres
    if (!imageUri || typeof imageUri !== 'string') {
      console.error('Invalid image URI provided:', imageUri);
      throw new Error(QRSharingError.SHARE_FAILED);
    }
    
    if (!guest || !guest.fullName) {
      console.error('Invalid guest data provided:', guest);
      throw new Error(QRSharingError.SHARE_FAILED);
    }
    
    // Vérifier si le partage est disponible
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      console.error('System sharing is not available on this device');
      throw new Error(QRSharingError.SHARE_FAILED);
    }
    
    // Partager via le menu natif
    await Sharing.shareAsync(imageUri, {
      mimeType: 'image/png',
      dialogTitle: `Partager QR Code - ${guest.fullName}`,
      UTI: 'public.png'
    });
    
    console.log('Successfully shared via system for guest:', guest.fullName);
    
  } catch (error) {
    console.error('Error sharing via system:', error);
    
    // Si c'est déjà notre erreur personnalisée, la relancer
    if (error instanceof Error && error.message === QRSharingError.SHARE_FAILED) {
      throw error;
    }
    
    // Sinon, créer une nouvelle erreur
    throw new Error(QRSharingError.SHARE_FAILED);
  }
};

/**
 * Affiche un message d'erreur à l'utilisateur
 * @param errorType - Type d'erreur
 * @param customMessage - Message personnalisé optionnel
 */
export const showErrorAlert = (
  errorType: QRSharingError,
  customMessage?: string
): void => {
  const message = customMessage || ERROR_MESSAGES[errorType];
  
  Alert.alert(
    'Erreur',
    message,
    [{ text: 'OK', style: 'default' }]
  );
};

/**
 * Affiche un message de succès à l'utilisateur
 * @param message - Message de succès
 */
export const showSuccessAlert = (message: string): void => {
  Alert.alert(
    'Succès',
    message,
    [{ text: 'OK', style: 'default' }]
  );
};

/**
 * Nettoie une image temporaire après utilisation
 * @param imageUri - URI de l'image temporaire à supprimer
 */
export const cleanupTempImage = async (imageUri: string): Promise<void> => {
  try {
    if (!imageUri || typeof imageUri !== 'string') {
      console.warn('Invalid image URI provided for cleanup:', imageUri);
      return;
    }
    
    // Créer un File à partir de l'URI
    const tempFile = new File(imageUri);
    
    // Vérifier si le fichier existe avant de le supprimer
    if (tempFile.exists) {
      tempFile.delete();
      console.log('Temporary image cleaned up successfully:', imageUri);
    } else {
      console.log('Temporary image already deleted or does not exist:', imageUri);
    }
  } catch (error) {
    // Ne pas lancer d'erreur pour le nettoyage, juste logger
    console.warn('Could not cleanup temporary image:', imageUri, error);
  }
};
