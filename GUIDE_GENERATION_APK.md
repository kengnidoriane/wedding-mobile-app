# 📱 Guide Complet - Génération APK pour Wedding App
## De Développement à Production

---

## 🎯 **Vue d'ensemble**

Ce guide vous explique comment transformer votre application React Native/Expo en un fichier APK installable sur Android. Nous couvrirons deux approches : **Expo Application Services (EAS)** et **Build local**.

---

## 🛠️ **Prérequis - Vérification de l'environnement**

### **1. Outils nécessaires**
```bash
# Vérifier Node.js (version 18+)
node --version

# Vérifier npm/yarn
npm --version

# Vérifier Expo CLI
npx expo --version

# Installer EAS CLI (recommandé)
npm install -g @expo/eas-cli
```

### **2. Compte Expo**
- Créer un compte sur [expo.dev](https://expo.dev)
- Se connecter via CLI : `eas login`

---

## 🚀 **Méthode 1 : EAS Build (Recommandée)**

### **Étape 1 : Configuration EAS**

**Utilité :** EAS Build est le service cloud d'Expo qui compile votre app sur leurs serveurs. Plus simple et plus fiable.

```bash
# Initialiser EAS dans votre projet
eas build:configure
```

**Ce que ça fait :**
- Crée le fichier `eas.json` avec la configuration de build
- Configure les profils de développement/production
- Prépare l'environnement de build

### **Étape 2 : Configurer eas.json**

**Créer/modifier `eas.json` :**
```json
{
  "cli": {
    "version": ">= 13.2.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Utilité de chaque profil :**
- **development** : Pour tester avec Expo Dev Client
- **preview** : Génère un APK pour tests internes
- **production** : Crée un AAB pour Google Play Store

### **Étape 3 : Configurer app.json pour la production**

**Mettre à jour votre `app.json` :**
```json
{
  "expo": {
    "name": "Wedding App",
    "slug": "wedding-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#8B5CF6"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#8B5CF6"
      },
      "package": "com.yourname.weddingapp",
      "versionCode": 1,
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.INTERNET"
      ]
    },
    "plugins": [
      "expo-sqlite",
      "expo-camera",
      "expo-media-library",
      "expo-sharing"
    ],
    "extra": {
      "eas": {
        "projectId": "votre-project-id"
      }
    }
  }
}
```

**Utilité des nouveaux champs :**
- **package** : Identifiant unique de votre app (comme com.facebook.android)
- **versionCode** : Numéro de version pour Google Play
- **projectId** : Identifiant EAS (généré automatiquement)

### **Étape 4 : Générer l'APK**

```bash
# Pour un APK de test (recommandé pour commencer)
eas build --platform android --profile preview

# Pour la production (AAB pour Google Play)
eas build --platform android --profile production
```

**Ce qui se passe :**
1. **Upload du code** : Votre code est envoyé sur les serveurs Expo
2. **Installation des dépendances** : npm install sur le serveur
3. **Compilation native** : Transformation en code Android natif
4. **Signature** : L'APK est signé automatiquement
5. **Téléchargement** : Lien de téléchargement fourni

---

## 🏠 **Méthode 2 : Build Local (Avancée)**

### **Prérequis supplémentaires**
```bash
# Android Studio et SDK
# Java JDK 17
# Variables d'environnement ANDROID_HOME
```

### **Étape 1 : Prebuild**
```bash
# Générer les dossiers android/ios natifs
npx expo prebuild --platform android
```

**Utilité :** Crée le code Android natif à partir de votre code Expo.

### **Étape 2 : Build local**
```bash
# Build en mode debug
npx expo run:android

# Build APK release
cd android
./gradlew assembleRelease
```

---

## 📋 **Roadmap Détaillée - Étape par Étape**

### **Phase 1 : Préparation (30 min)**

#### **Étape 1.1 : Vérification environnement**
```bash
# Vérifier les versions
node --version  # Doit être 18+
npm --version
npx expo --version
```
**Utilité :** S'assurer que tous les outils sont à jour pour éviter les erreurs de build.

#### **Étape 1.2 : Installation EAS CLI**
```bash
npm install -g @expo/eas-cli
eas login
```
**Utilité :** EAS CLI est l'outil officiel pour builder les apps Expo en production.

#### **Étape 1.3 : Nettoyage du projet**
```bash
# Nettoyer les caches
npm run clean  # si disponible
rm -rf node_modules
npm install
```
**Utilité :** Éviter les conflits de dépendances qui peuvent causer des erreurs de build.

### **Phase 2 : Configuration (45 min)**

#### **Étape 2.1 : Configuration EAS**
```bash
eas build:configure
```
**Utilité :** Crée la configuration de build adaptée à votre projet.

#### **Étape 2.2 : Mise à jour app.json**
**Ajouter les champs manquants :**
```json
{
  "expo": {
    "android": {
      "package": "com.votreentreprise.weddingapp",
      "versionCode": 1
    }
  }
}
```
**Utilité :** 
- **package** : Identifiant unique requis pour publier sur Google Play
- **versionCode** : Numéro de version pour les mises à jour

#### **Étape 2.3 : Vérification des assets**
```bash
# Vérifier que ces fichiers existent :
ls assets/icon.png
ls assets/splash-icon.png
ls assets/adaptive-icon.png
```
**Utilité :** Les icônes sont obligatoires pour générer l'APK.

### **Phase 3 : Premier Build (20 min)**

#### **Étape 3.1 : Build de test**
```bash
eas build --platform android --profile preview
```
**Utilité :** Génère un APK de test pour vérifier que tout fonctionne.

#### **Étape 3.2 : Suivi du build**
- Aller sur [expo.dev/builds](https://expo.dev/builds)
- Suivre le progrès en temps réel
- Télécharger l'APK une fois terminé

**Utilité :** Interface web pour monitorer et télécharger vos builds.

### **Phase 4 : Test et Validation (30 min)**

#### **Étape 4.1 : Installation sur appareil**
```bash
# Via ADB (si appareil connecté)
adb install app-release.apk

# Ou transférer l'APK sur le téléphone et installer manuellement
```
**Utilité :** Tester l'app sur un vrai appareil Android.

#### **Étape 4.2 : Tests fonctionnels**
- ✅ Lancement de l'app
- ✅ Navigation entre écrans
- ✅ Fonctionnalités QR code
- ✅ Base de données SQLite
- ✅ Partage WhatsApp
- ✅ Permissions caméra/stockage

**Utilité :** S'assurer que toutes les fonctionnalités marchent en production.

### **Phase 5 : Optimisation (45 min)**

#### **Étape 5.1 : Optimisation des assets**
```bash
# Compresser les images
# Utiliser des formats optimisés (WebP)
# Réduire la taille des icônes si nécessaire
```
**Utilité :** Réduire la taille de l'APK pour un téléchargement plus rapide.

#### **Étape 5.2 : Configuration production**
```json
{
  "expo": {
    "android": {
      "buildType": "app-bundle",
      "minSdkVersion": 21,
      "compileSdkVersion": 34,
      "targetSdkVersion": 34
    }
  }
}
```
**Utilité :** Optimiser pour Google Play Store et compatibilité Android.

---

## 🔧 **Résolution des Problèmes Courants**

### **Erreur : "Package name already exists"**
```json
// Changer le package name dans app.json
"android": {
  "package": "com.votreentreprise.weddingapp.v2"
}
```

### **Erreur : "Missing icon"**
```bash
# Créer les icônes manquantes
# icon.png : 1024x1024
# adaptive-icon.png : 1024x1024
# splash-icon.png : 1284x2778
```

### **Erreur : "Build failed"**
```bash
# Vérifier les logs sur expo.dev
# Nettoyer et réessayer
rm -rf node_modules
npm install
eas build --platform android --profile preview --clear-cache
```

---

## 📊 **Comparaison des Méthodes**

| Critère | EAS Build | Build Local |
|---------|-----------|-------------|
| **Simplicité** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Vitesse** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Contrôle** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Coût** | Gratuit (limité) | Gratuit |
| **Maintenance** | ⭐⭐⭐⭐⭐ | ⭐⭐ |

**Recommandation :** Commencez par EAS Build, passez au build local si vous avez des besoins spécifiques.

---

## 🚀 **Déploiement sur Google Play Store**

### **Étape 1 : Créer un compte développeur**
- Aller sur [Google Play Console](https://play.google.com/console)
- Payer les 25$ d'inscription
- Vérifier votre identité

### **Étape 2 : Préparer l'app**
```bash
# Build production (AAB)
eas build --platform android --profile production
```

### **Étape 3 : Upload sur Play Console**
- Créer une nouvelle app
- Uploader l'AAB
- Remplir les métadonnées
- Ajouter des captures d'écran

---

## 📱 **Distribution Alternative**

### **APK Direct (Sans Play Store)**
```bash
# Générer APK signé
eas build --platform android --profile preview

# Partager le lien de téléchargement
# Les utilisateurs peuvent installer directement
```

**Utilité :** Pour distribution interne ou test beta.

---

## 🔒 **Sécurité et Signature**

### **Signature automatique EAS**
- EAS gère automatiquement la signature
- Certificats stockés de manière sécurisée
- Pas besoin de gérer les keystores

### **Signature manuelle (avancé)**
```bash
# Générer un keystore
keytool -genkey -v -keystore wedding-app.keystore -alias wedding-app -keyalg RSA -keysize 2048 -validity 10000

# Configurer dans eas.json
"android": {
  "credentialsSource": "local"
}
```

---

## 📈 **Monitoring et Analytics**

### **Intégrer des analytics**
```bash
# Ajouter Expo Analytics
npx expo install expo-analytics-amplitude

# Ou Google Analytics
npm install @react-native-google-analytics/google-analytics
```

### **Crash Reporting**
```bash
# Sentry pour le monitoring d'erreurs
npx expo install @sentry/react-native
```

---

## 🎯 **Checklist Finale**

### **Avant le build :**
- [ ] Toutes les fonctionnalités testées
- [ ] Icons et splash screen créés
- [ ] Package name unique défini
- [ ] Permissions configurées
- [ ] Version et versionCode mis à jour

### **Après le build :**
- [ ] APK téléchargé et testé
- [ ] Installation sur plusieurs appareils
- [ ] Tests de performance
- [ ] Vérification des permissions
- [ ] Test des fonctionnalités critiques

---

## 🚀 **Commandes Rapides - Résumé**

```bash
# Setup initial
npm install -g @expo/eas-cli
eas login
eas build:configure

# Build APK de test
eas build --platform android --profile preview

# Build production
eas build --platform android --profile production

# Suivi des builds
eas build:list
```

---

## 💡 **Conseils Pro**

### **1. Versioning**
```json
// Incrémentez à chaque build
"version": "1.0.1",
"android": {
  "versionCode": 2
}
```

### **2. Environnements**
```json
// Utilisez des profils différents
"build": {
  "development": { ... },
  "staging": { ... },
  "production": { ... }
}
```

### **3. Automatisation**
```bash
# Script pour build automatique
npm run build:android
```

---

## 🎓 **Ressources Supplémentaires**

- [Documentation EAS Build](https://docs.expo.dev/build/introduction/)
- [Guide Google Play Store](https://developer.android.com/distribute/google-play)
- [Optimisation APK](https://developer.android.com/topic/performance/reduce-apk-size)
- [Signature d'apps Android](https://developer.android.com/studio/publish/app-signing)

---

**Temps total estimé :** 2-3 heures pour le premier build complet
**Difficulté :** Intermédiaire
**Coût :** Gratuit (EAS Build a des limites gratuites généreuses)

Suivez cette roadmap étape par étape et vous aurez votre APK prêt à distribuer ! 🚀