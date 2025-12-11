# 📦 Guide d'optimisation de la taille de l'application

## 🎯 Objectif
Réduire la taille de l'APK/IPA de **30-50%** en appliquant les meilleures pratiques.

---

## 1️⃣ Optimisation des dépendances (Impact: 🔴 ÉLEVÉ)

### A. Supprimer les dépendances inutilisées

**Dépendances à vérifier :**
```json
// Potentiellement inutilisées dans votre app
"expo-clipboard": "^8.0.7",        // ❓ Utilisé ?
"expo-sqlite": "~16.0.9",          // ❓ Utilisé ? (vous utilisez Firebase)
"react-native-web": "^0.21.0",     // ❓ Nécessaire si pas de version web
"react-dom": "19.1.0",             // ❓ Nécessaire si pas de version web
```

**Action :**
```bash
# Supprimer les dépendances non utilisées
npm uninstall expo-clipboard expo-sqlite react-native-web react-dom
```

### B. Remplacer Firebase par une version allégée

**Problème :** Firebase complet = ~500KB+

**Solution :** N'importer que les modules nécessaires

```typescript
// ❌ AVANT (import tout Firebase)
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

// ✅ APRÈS (imports modulaires)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
```

### C. Optimiser react-native-chart-kit

**Alternative plus légère :**
```bash
# Remplacer par une lib plus légère
npm uninstall react-native-chart-kit
npm install react-native-svg-charts --save
```

---

## 2️⃣ Optimisation des assets (Impact: 🔴 ÉLEVÉ)

### A. Compresser les images

**Outils recommandés :**
- **TinyPNG** : https://tinypng.com/
- **ImageOptim** (Mac)
- **Squoosh** : https://squoosh.app/

**Actions :**
```bash
# Compresser toutes les images PNG
# Réduction attendue : 60-80%

assets/icon.png          → Compresser
assets/adaptive-icon.png → Compresser
assets/splash-icon.png   → Compresser
assets/favicon.png       → Compresser
```

### B. Supprimer les assets inutilisés

```bash
# Supprimer les fichiers non utilisés
rm assets/erreur.jpg        # Si non utilisé
rm assets/invites_test.csv  # Fichier de test, pas en production
```

### C. Utiliser WebP au lieu de PNG/JPG

**Avantage :** 25-35% plus léger

```bash
# Convertir les images en WebP
# Utiliser https://squoosh.app/ ou cwebp
```

---

## 3️⃣ Configuration Expo/EAS (Impact: 🟡 MOYEN)

### A. Activer Hermes (Android)

**Fichier : `app.json` ou `app.config.js`**

```json
{
  "expo": {
    "android": {
      "jsEngine": "hermes"
    },
    "ios": {
      "jsEngine": "hermes"
    }
  }
}
```

**Bénéfices :**
- ✅ Réduction de 30-40% de la taille
- ✅ Démarrage plus rapide
- ✅ Moins de mémoire utilisée

### B. Activer ProGuard (Android)

**Fichier : `eas.json`**

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease",
        "env": {
          "ANDROID_MINIFY_ENABLED": "true"
        }
      }
    }
  }
}
```

### C. Configurer les splits APK (Android)

**Fichier : `app.json`**

```json
{
  "expo": {
    "android": {
      "enableDangerousExperimentalLeanBuilds": true,
      "versionCode": 1
    }
  }
}
```

---

## 4️⃣ Optimisation du code (Impact: 🟢 FAIBLE-MOYEN)

### A. Lazy loading des écrans

**Avant :**
```typescript
import GuestDetailScreen from '../screens/GuestDetailScreen';
import DashboardScreen from '../screens/DashboardScreen';
```

**Après :**
```typescript
import { lazy, Suspense } from 'react';

const GuestDetailScreen = lazy(() => import('../screens/GuestDetailScreen'));
const DashboardScreen = lazy(() => import('../screens/DashboardScreen'));

// Dans le navigator
<Suspense fallback={<LoadingSpinner />}>
  <Stack.Screen name="Détails invité" component={GuestDetailScreen} />
</Suspense>
```

### B. Supprimer les console.log en production

**Fichier : `babel.config.js`**

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Supprimer les console.log en production
      ['transform-remove-console', { exclude: ['error', 'warn'] }]
    ]
  };
};
```

**Installation :**
```bash
npm install --save-dev babel-plugin-transform-remove-console
```

### C. Minifier les fichiers JSON/CSV

**Supprimer les fichiers de test :**
```bash
rm invites_test_corrected.csv
rm assets/invites_test.csv
```

---

## 5️⃣ Optimisation Firebase (Impact: 🟡 MOYEN)

### A. Utiliser Firestore Lite

**Si vous n'avez pas besoin de listeners en temps réel :**

```typescript
// ❌ AVANT (Firestore complet)
import { getFirestore } from 'firebase/firestore';

// ✅ APRÈS (Firestore Lite - 80% plus léger)
import { getFirestore } from 'firebase/firestore/lite';
```

### B. Désactiver les fonctionnalités non utilisées

```typescript
// Ne pas importer ce que vous n'utilisez pas
// ❌ import { getStorage } from 'firebase/storage';
// ❌ import { getFunctions } from 'firebase/functions';
// ❌ import { getAnalytics } from 'firebase/analytics';
```

---

## 6️⃣ Configuration de build optimale (Impact: 🔴 ÉLEVÉ)

### Créer un fichier `eas.json` optimisé

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease",
        "env": {
          "ANDROID_MINIFY_ENABLED": "true",
          "ANDROID_SHRINK_RESOURCES": "true"
        }
      },
      "ios": {
        "buildConfiguration": "Release",
        "env": {
          "IOS_DEPLOYMENT_TARGET": "13.0"
        }
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## 📊 Résultats attendus

| Optimisation | Réduction | Difficulté |
|--------------|-----------|------------|
| Supprimer dépendances inutilisées | 10-15% | ⭐ Facile |
| Compresser images | 5-10% | ⭐ Facile |
| Activer Hermes | 30-40% | ⭐⭐ Moyen |
| Firebase modulaire | 15-20% | ⭐⭐ Moyen |
| ProGuard/Minification | 10-15% | ⭐⭐ Moyen |
| Lazy loading | 5-10% | ⭐⭐⭐ Avancé |

**Total possible : 40-60% de réduction !**

---

## 🚀 Plan d'action recommandé

### Phase 1 : Quick Wins (1-2h)
1. ✅ Supprimer dépendances inutilisées
2. ✅ Compresser toutes les images
3. ✅ Supprimer fichiers de test
4. ✅ Activer Hermes

### Phase 2 : Optimisations moyennes (2-4h)
5. ✅ Configurer ProGuard
6. ✅ Imports Firebase modulaires
7. ✅ Supprimer console.log

### Phase 3 : Optimisations avancées (4-8h)
8. ✅ Lazy loading des écrans
9. ✅ Firestore Lite (si applicable)
10. ✅ Splits APK

---

## 📝 Checklist d'implémentation

### Immédiat (à faire maintenant)
- [ ] Supprimer `expo-clipboard` si non utilisé
- [ ] Supprimer `expo-sqlite` (vous utilisez Firebase)
- [ ] Supprimer `react-native-web` et `react-dom` si pas de version web
- [ ] Compresser toutes les images PNG
- [ ] Supprimer `assets/invites_test.csv`
- [ ] Supprimer `invites_test_corrected.csv`

### Configuration (30 min)
- [ ] Activer Hermes dans `app.json`
- [ ] Configurer ProGuard dans `eas.json`
- [ ] Installer `babel-plugin-transform-remove-console`

### Code (2-4h)
- [ ] Refactorer imports Firebase (modulaires)
- [ ] Ajouter lazy loading pour écrans secondaires
- [ ] Vérifier et supprimer code mort

---

## 🔍 Outils de mesure

### Analyser la taille du bundle

```bash
# Android
npx react-native-bundle-visualizer

# Analyser l'APK
npx analyze-apk path/to/app.apk

# Expo
npx expo-optimize
```

### Comparer avant/après

```bash
# Avant optimisation
ls -lh android/app/build/outputs/apk/release/app-release.apk

# Après optimisation
# Comparer la taille
```

---

## ⚠️ Précautions

1. **Tester après chaque optimisation**
2. **Garder un backup avant modifications majeures**
3. **Vérifier que toutes les fonctionnalités marchent**
4. **Tester sur devices réels, pas seulement émulateurs**

---

## 💡 Bonus : Optimisations futures

- **Code splitting** par route
- **Tree shaking** automatique
- **Compression Brotli** pour assets
- **CDN** pour assets statiques
- **Progressive loading** des données

---

## 📚 Ressources

- [Expo Optimization Guide](https://docs.expo.dev/guides/optimizing-updates/)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Firebase Modular SDK](https://firebase.google.com/docs/web/modular-upgrade)
- [Hermes Engine](https://hermesengine.dev/)
