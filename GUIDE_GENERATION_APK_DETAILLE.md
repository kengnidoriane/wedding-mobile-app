# 📱 Guide Complet : Générer l'APK de Wedding App

## 🎯 Étapes Principales

### **Étape 1 : Vérifier les Prérequis**

#### **1.1 Vérifier Node.js et npm**
```bash
node --version    # Doit être 16+ 
npm --version     # Doit être 8+
```

#### **1.2 Vérifier Expo CLI**
```bash
npx expo --version
```

#### **1.3 Installer EAS CLI (si pas installé)**
```bash
npm install -g @expo/eas-cli
```

### **Étape 2 : Configurer le Projet**

#### **2.1 Vérifier app.json**
```bash
# Ouvrir app.json et vérifier la configuration
```

#### **2.2 Créer/Vérifier eas.json**
```bash
npx eas build:configure
```

### **Étape 3 : Se Connecter à Expo**

#### **3.1 Login Expo**
```bash
npx expo login
# Ou créer un compte : npx expo register
```

### **Étape 4 : Générer l'APK**

#### **4.1 Build de développement (APK)**
```bash
npx eas build --platform android --profile preview
```

#### **4.2 Build de production (AAB pour Play Store)**
```bash
npx eas build --platform android --profile production
```

### **Étape 5 : Télécharger l'APK**

Une fois le build terminé :
1. **Aller sur** : https://expo.dev/accounts/[votre-username]/projects/wedding-app-fixed/builds
2. **Télécharger** le fichier APK
3. **Installer** sur votre téléphone Android

---

## 🔧 Configuration Détaillée

### **app.json Configuration**
```json
{
  "expo": {
    "name": "Wedding App",
    "slug": "wedding-app-fixed",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.wedding.app",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### **eas.json Configuration**
```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🚀 Commandes Pas à Pas

### **Commande 1 : Préparation**
```bash
cd "C:\Users\SOP TECH\wedding-app-fixed"
npm install
```

### **Commande 2 : Configuration EAS**
```bash
npx eas build:configure
```

### **Commande 3 : Login Expo**
```bash
npx expo login
```

### **Commande 4 : Build APK**
```bash
npx eas build --platform android --profile preview
```

---

## ⚠️ Problèmes Courants et Solutions

### **Problème 1 : Erreur de Login**
```bash
# Solution
npx expo logout
npx expo login
```

### **Problème 2 : Erreur de Build**
```bash
# Nettoyer le cache
npx expo install --fix
npm install
```

### **Problème 3 : Erreur Firebase**
- Vérifier que les clés Firebase sont correctes dans `app.json`
- Ou désactiver Firebase temporairement pour le build

### **Problème 4 : Erreur de Permissions**
```bash
# Lancer en tant qu'administrateur
# Ou utiliser :
npx eas build --platform android --profile preview --non-interactive
```

---

## 📋 Checklist Avant Build

- [ ] **Node.js** installé (16+)
- [ ] **Expo CLI** installé
- [ ] **EAS CLI** installé
- [ ] **Compte Expo** créé
- [ ] **app.json** configuré
- [ ] **Assets** présents (icon.png, etc.)
- [ ] **Code** fonctionne en développement
- [ ] **Firebase** configuré (ou désactivé)

---

## 🎯 Types de Build

### **1. APK de Développement**
```bash
npx eas build --platform android --profile development
```
- Pour tester sur votre téléphone
- Plus rapide à générer
- Inclut les outils de debug

### **2. APK de Prévisualisation**
```bash
npx eas build --platform android --profile preview
```
- Version optimisée
- Pas de debug
- Prêt pour distribution

### **3. AAB de Production**
```bash
npx eas build --platform android --profile production
```
- Pour Google Play Store
- Format AAB (Android App Bundle)
- Version finale optimisée

---

## 📱 Installation sur Téléphone

### **Méthode 1 : Téléchargement Direct**
1. **Aller** sur le lien fourni par EAS
2. **Télécharger** l'APK sur votre téléphone
3. **Autoriser** l'installation depuis sources inconnues
4. **Installer** l'APK

### **Méthode 2 : QR Code**
1. **Scanner** le QR code avec votre téléphone
2. **Suivre** les instructions
3. **Installer** l'application

---

## 🔍 Vérification Post-Build

### **Tests à Faire**
- [ ] **Lancement** de l'app
- [ ] **Navigation** entre écrans
- [ ] **Ajout** d'invités
- [ ] **Scanner QR** (si caméra disponible)
- [ ] **Gestion** des erreurs
- [ ] **Performance** générale

### **Si Problèmes**
1. **Vérifier** les logs dans Expo Dev Tools
2. **Tester** en mode développement d'abord
3. **Corriger** les erreurs
4. **Rebuilder** l'APK

---

## 🎉 Félicitations !

Une fois l'APK généré et testé, vous avez votre **application de mariage** prête à utiliser ! 💍

**Prochaines étapes** :
- Distribuer l'APK aux organisateurs
- Tester avec de vrais invités
- Préparer les QR codes
- Profiter de votre mariage ! ✨