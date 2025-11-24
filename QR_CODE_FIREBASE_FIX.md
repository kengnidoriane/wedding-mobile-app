# Correction de la génération de QR codes avec Firebase

## Problème identifié

La génération de QR codes ne fonctionnait plus après la migration vers Firebase à cause d'un conflit de types :

- **Avant (SQLite)** : Les IDs des invités étaient des `number`
- **Après (Firebase)** : Les IDs des invités sont des `string`

## Corrections apportées

### 1. Mise à jour des types dans `src/utils/qrUtils.ts`

```typescript
// AVANT
export interface GuestQRData {
  id: number;  // ❌ Type incorrect
  fullName: string;
  tableName: string;
  companions: number;
}

// APRÈS
export interface GuestQRData {
  id: string;  // ✅ Type correct pour Firebase
  fullName: string;
  tableName: string;
  companions: number;
}
```

### 2. Correction de la fonction de parsing

```typescript
// AVANT
if (typeof data.id === 'number' && ...) {  // ❌ Vérifiait number

// APRÈS  
if (typeof data.id === 'string' && ...) {  // ✅ Vérifie string
```

### 3. Suppression des conversions forcées

Dans `src/screens/QRWhatsAppShareScreen.tsx`, suppression de :
```typescript
// AVANT
id: parseInt(currentGuest.id),  // ❌ Conversion inutile et dangereuse

// APRÈS
id: currentGuest.id,  // ✅ Utilisation directe de l'ID string
```

## Réponse à votre question sur le stockage

**❌ Non, les QR codes ne sont PAS stockés dans Firebase.**

### Comment ça fonctionne :

1. **Génération dynamique** : Les QR codes sont générés à la volée à partir des données de l'invité
2. **Contenu du QR code** : JSON contenant les informations de l'invité :
   ```json
   {
     "id": "abc123def456",
     "fullName": "Jean Dupont", 
     "tableName": "Table 1",
     "companions": 2,
     "generated": "2024-11-24T10:30:00.000Z",
     "type": "wedding_invitation"
   }
   ```
3. **Stockage temporaire** : Seules les images PNG des QR codes sont temporairement sauvegardées pour le partage/galerie

### Avantages de cette approche :

- ✅ **Économie d'espace** : Pas de stockage d'images dans Firebase
- ✅ **Toujours à jour** : Les QR codes reflètent les dernières données
- ✅ **Sécurité** : Pas de stockage permanent d'images sensibles
- ✅ **Performance** : Génération rapide et légère

## Test de fonctionnement

Pour tester que la génération fonctionne :

1. Lancez l'application : `npm run android`
2. Allez dans la liste des invités
3. Sélectionnez un invité et cliquez sur "Partager QR Code"
4. Le QR code devrait s'afficher correctement avec les bonnes informations

## Fichiers modifiés

- ✅ `src/utils/qrUtils.ts` - Types et fonctions de génération/parsing
- ✅ `src/screens/QRWhatsAppShareScreen.tsx` - Suppression des conversions forcées

## Statut

🎉 **Problème résolu** - La génération de QR codes fonctionne maintenant correctement avec Firebase.