# Analyse de cohérence de la navigation - Wedding App

## 🔍 Problèmes identifiés

### 1. **Écrans manquants ou non fonctionnels**

#### ❌ Écrans référencés mais inexistants ou vides :
- `ScannerScreen.tsx` - Écran placeholder avec juste un message "bientôt disponible"
- `GuestDetailScreen.tsx` - Écran placeholder (et mal nommé dans le code)
- `DashboardScreen.tsx` - Existe mais pas analysé

#### ❌ Écrans utilisant l'ancienne base SQLite :
- `QRGeneratorScreen.tsx` - Utilise encore `getAllGuests()` de l'ancienne DB SQLite
- Importe `../db/database` qui n'existe probablement plus

### 2. **Incohérences dans la navigation**

#### ❌ Navigation vers des écrans non fonctionnels :
```typescript
// Dans HomeScreen.tsx - Navigation vers des écrans vides
{ title: 'Scanner QR code', screen: 'QRScanner' },  // ✅ Fonctionne
{ title: 'Générer QR codes', screen: 'QRGenerator' }, // ❌ Utilise SQLite
```

#### ❌ Doublons d'écrans :
- `QRScanner` vs `Scanner` - Deux écrans différents pour scanner
- `QRGenerator` vs `QRWhatsAppShare` - Deux approches pour générer des QR codes
- `SettingScreen.tsx` vs `ParametresScreen.tsx` vs `SettingsScreenTest.tsx` - Trois écrans de paramètres

### 3. **Types de navigation incohérents**

#### ❌ Paramètres de navigation mal typés :
```typescript
// Dans AppNavigator.tsx
export type RootStackParamList = {
  'Détails invité': undefined;  // ❌ Devrait accepter un guestId
  QRWhatsAppShare: { guestId?: string } | undefined;  // ✅ Correct
};
```

### 4. **Écrans obsolètes ou redondants**

#### ❌ Écrans qui devraient être supprimés :
- `ScannerScreen.tsx` - Remplacé par `QRScannerScreen.tsx`
- `QRGeneratorScreen.tsx` - Remplacé par `QRWhatsAppShareScreen.tsx`
- `SettingsScreenTest.tsx` - Écran de test qui ne devrait pas être en production

## ✅ Solutions recommandées

### 1. **Nettoyer les écrans obsolètes**

#### Supprimer les écrans inutiles :
- `ScannerScreen.tsx` (remplacé par QRScannerScreen)
- `QRGeneratorScreen.tsx` (remplacé par QRWhatsAppShareScreen)
- `SettingsScreenTest.tsx` (écran de test)

#### Corriger les écrans placeholder :
- Implémenter `GuestDetailScreen.tsx` ou le supprimer
- Implémenter `DashboardScreen.tsx` ou le supprimer

### 2. **Corriger la navigation**

#### Mettre à jour `AppNavigator.tsx` :
```typescript
export type RootStackParamList = {
  Accueil: undefined;
  Invités: undefined;
  'Détails invité': { guestId: string };  // ✅ Ajouter le paramètre
  Paramètres: undefined;
  QRScanner: undefined;
  QRWhatsAppShare: { guestId?: string } | undefined;
  Dashboard: undefined;
  // Supprimer les écrans obsolètes
};
```

#### Supprimer les références aux écrans obsolètes :
```typescript
// Dans HomeScreen.tsx - Supprimer ces lignes
{ title: 'Générer QR codes', screen: 'QRGenerator' }, // ❌ À supprimer
{ title: 'Scanner QR code', screen: 'Scanner' },      // ❌ À supprimer
```

### 3. **Standardiser les écrans de paramètres**

#### Garder un seul écran :
- Conserver `ParametresScreen.tsx` (le plus complet)
- Supprimer `SettingScreen.tsx` et `SettingsScreenTest.tsx`

### 4. **Corriger les imports et dépendances**

#### Mettre à jour les écrans qui utilisent SQLite :
- Remplacer `getAllGuests()` par `useFirebaseGuests()`
- Supprimer les imports vers `../db/database`

## 🎯 Plan d'action prioritaire

### Phase 1 - Nettoyage immédiat
1. Supprimer `ScannerScreen.tsx`
2. Supprimer `SettingsScreenTest.tsx`
3. Mettre à jour `AppNavigator.tsx` pour supprimer les références

### Phase 2 - Correction des écrans
1. Corriger `QRGeneratorScreen.tsx` pour utiliser Firebase
2. Implémenter ou supprimer `GuestDetailScreen.tsx`
3. Vérifier et corriger `DashboardScreen.tsx`

### Phase 3 - Optimisation
1. Standardiser les noms d'écrans
2. Améliorer le typage des paramètres de navigation
3. Tester tous les flux de navigation

## 📊 État actuel de la navigation

### ✅ Écrans fonctionnels :
- `HomeScreen.tsx` - ✅ Fonctionne bien
- `GuestListScreen.tsx` - ✅ Utilise Firebase correctement
- `QRWhatsAppShareScreen.tsx` - ✅ Fonctionne avec Firebase
- `QRScannerScreen.tsx` - ✅ Fonctionne avec Firebase
- `ParametresScreen.tsx` - ✅ Écran de paramètres principal

### ❌ Écrans problématiques :
- `ScannerScreen.tsx` - Placeholder vide
- `QRGeneratorScreen.tsx` - Utilise SQLite obsolète
- `GuestDetailScreen.tsx` - Placeholder vide
- `SettingsScreenTest.tsx` - Écran de test

### ⚠️ Écrans à vérifier :
- `DashboardScreen.tsx` - Non analysé
- `QRBulkGeneratorScreen.tsx` - Non analysé
- `QRImageScreen.tsx` - Non analysé
- `QRShareScreen.tsx` - Non analysé

## 🔧 Recommandations techniques

1. **Utiliser un linter de navigation** pour détecter les écrans non référencés
2. **Implémenter des tests de navigation** pour vérifier tous les flux
3. **Créer une documentation** des écrans et de leurs responsabilités
4. **Standardiser les conventions de nommage** des écrans et paramètres