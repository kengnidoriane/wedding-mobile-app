/**
 * Utilitaires pour nettoyer les données de test et gérer Firebase
 */

import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
import { Alert } from 'react-native';

/**
 * Supprime tous les invités de Firebase (pour nettoyer les données de test)
 */
export const clearAllGuests = async (): Promise<void> => {
  try {
    console.log('🧹 Starting to clear all guests from Firebase...');
    
    // Récupérer tous les documents de la collection guests
    const guestsSnapshot = await getDocs(collection(db, COLLECTIONS.GUESTS));
    
    if (guestsSnapshot.empty) {
      console.log('✅ No guests found to delete');
      return;
    }

    // Utiliser un batch pour supprimer tous les documents
    const batch = writeBatch(db);
    
    guestsSnapshot.forEach((guestDoc) => {
      batch.delete(guestDoc.ref);
    });

    // Exécuter le batch
    await batch.commit();
    
    console.log(`✅ Successfully deleted ${guestsSnapshot.size} guests from Firebase`);
    
    Alert.alert(
      '🧹 Nettoyage terminé',
      `${guestsSnapshot.size} invité(s) supprimé(s) de Firebase`,
      [{ text: 'OK', style: 'default' }]
    );
    
  } catch (error) {
    console.error('❌ Error clearing guests:', error);
    
    Alert.alert(
      '❌ Erreur',
      'Impossible de supprimer les invités. Vérifiez votre connexion.',
      [{ text: 'OK', style: 'default' }]
    );
    
    throw error;
  }
};

/**
 * Supprime tous les logs d'audit de Firebase
 */
export const clearAllAuditLogs = async (): Promise<void> => {
  try {
    console.log('🧹 Starting to clear all audit logs from Firebase...');
    
    // Récupérer tous les documents de la collection auditLogs
    const logsSnapshot = await getDocs(collection(db, COLLECTIONS.AUDIT_LOGS));
    
    if (logsSnapshot.empty) {
      console.log('✅ No audit logs found to delete');
      return;
    }

    // Utiliser un batch pour supprimer tous les documents
    const batch = writeBatch(db);
    
    logsSnapshot.forEach((logDoc) => {
      batch.delete(logDoc.ref);
    });

    // Exécuter le batch
    await batch.commit();
    
    console.log(`✅ Successfully deleted ${logsSnapshot.size} audit logs from Firebase`);
    
  } catch (error) {
    console.error('❌ Error clearing audit logs:', error);
    throw error;
  }
};

/**
 * Nettoie complètement Firebase (invités + logs)
 */
export const clearAllFirebaseData = async (): Promise<void> => {
  try {
    await Promise.all([
      clearAllGuests(),
      clearAllAuditLogs()
    ]);
    
    console.log('✅ Firebase completely cleaned');
    
  } catch (error) {
    console.error('❌ Error during complete cleanup:', error);
    throw error;
  }
};

/**
 * Compte le nombre d'invités dans Firebase
 */
export const countGuests = async (): Promise<number> => {
  try {
    const guestsSnapshot = await getDocs(collection(db, COLLECTIONS.GUESTS));
    return guestsSnapshot.size;
  } catch (error) {
    console.error('❌ Error counting guests:', error);
    return 0;
  }
};

/**
 * Affiche les statistiques Firebase
 */
export const showFirebaseStats = async (): Promise<void> => {
  try {
    const [guestsCount, logsCount] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.GUESTS)).then(snap => snap.size),
      getDocs(collection(db, COLLECTIONS.AUDIT_LOGS)).then(snap => snap.size)
    ]);
    
    Alert.alert(
      '📊 Statistiques Firebase',
      `Invités: ${guestsCount}\nLogs d'audit: ${logsCount}`,
      [
        { text: 'OK', style: 'default' },
        { 
          text: 'Nettoyer tout', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '⚠️ Confirmation',
              'Voulez-vous vraiment supprimer TOUTES les données Firebase ?',
              [
                { text: 'Annuler', style: 'cancel' },
                { 
                  text: 'Supprimer tout', 
                  style: 'destructive',
                  onPress: clearAllFirebaseData
                }
              ]
            );
          }
        }
      ]
    );
    
  } catch (error) {
    console.error('❌ Error getting Firebase stats:', error);
    Alert.alert('❌ Erreur', 'Impossible de récupérer les statistiques');
  }
};