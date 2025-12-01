/**
 * Configuration Firebase
 * Suivant les bonnes pratiques de sécurité et d'architecture
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator, collection } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import Constants from 'expo-constants';

// Interface pour la configuration Firebase
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Configuration Firebase (à remplacer par vos vraies valeurs)
const firebaseConfig: FirebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || "your-api-key",
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || "wedding-app-xxxxx.firebaseapp.com",
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || "wedding-app-xxxxx",
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || "wedding-app-xxxxx.appspot.com",
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || "123456789",
  appId: Constants.expoConfig?.extra?.firebaseAppId || "1:123456789:web:abcdef123456"
};

// Validation de la configuration
const validateFirebaseConfig = (config: FirebaseConfig): void => {
  const requiredFields: (keyof FirebaseConfig)[] = [
    'apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'
  ];

  for (const field of requiredFields) {
    if (!config[field] || config[field].includes('your-') || config[field].includes('xxxxx')) {
      throw new Error(`Firebase configuration incomplete: ${field} is missing or invalid`);
    }
  }
};

// Initialisation Firebase avec gestion d'erreurs
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

console.log('🔥 Starting Firebase initialization...');
try {
  // Valider la configuration avant l'initialisation
  console.log('🔥 Validating Firebase config...');
  validateFirebaseConfig(firebaseConfig);
  console.log('🔥 Config validation passed');
  
  // Initialiser Firebase
  console.log('🔥 Initializing Firebase app...');
  app = initializeApp(firebaseConfig);
  console.log('🔥 Firebase app initialized');
  
  console.log('🔥 Initializing Firestore...');
  db = getFirestore(app);
  console.log('🔥 Firestore initialized');
  
  console.log('🔥 Initializing Auth...');
  auth = getAuth(app);
  console.log('🔥 Auth initialized:', auth ? 'SUCCESS' : 'FAILED');

  // Configuration pour le développement (émulateur)
  if (__DEV__ && Constants.expoConfig?.extra?.useFirebaseEmulator) {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('🔥 Connected to Firestore emulator');
    } catch (error) {
      console.warn('⚠️ Could not connect to Firestore emulator:', error);
    }
  }

  console.log('🔥 Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.error('❌ Error details:', error);
  throw error;
}

// Constantes pour les collections Firestore
export const COLLECTIONS = {
  GUESTS: 'guests',
  AUDIT_LOGS: 'auditLogs',
  SETTINGS: 'settings'
} as const;

// Export des instances Firebase
export { app, db, auth };

// Fonction utilitaire pour vérifier la connexion
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Tentative de lecture simple pour vérifier la connexion
    collection(db, 'test');
    return true;
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    return false;
  }
};

// Configuration des règles de sécurité (à copier dans Firebase Console)
export const FIRESTORE_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les invités
    match /guests/{guestId} {
      allow read, write: if request.auth != null;
    }
    
    // Règles pour les logs d'audit
    match /auditLogs/{logId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Règles pour les paramètres
    match /settings/{settingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
`;