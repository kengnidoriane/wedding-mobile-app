# 🐛 Guide de Débogage : QR Scan et Marquage de Présence

## 🎯 Objectif

Identifier pourquoi le marquage de présence ne fonctionne pas après le scan QR.

## 📝 Logs Ajoutés

J'ai ajouté des logs de débogage dans 3 fichiers :

1. **src/screens/QRScannerScreen.tsx** - Logs du scanner
2. **src/hooks/useFirebaseGuests.ts** - Logs du hook
3. **src/services/firebaseService.ts** - Logs du service Firebase

## 🔍 Comment Déboguer

### Étape 1 : Redémarrer l'App

```bash
# Arrête Metro (Ctrl+C)
npx expo start -c
```

### Étape 2 : Scanner un QR Code

1. Ouvre l'app sur ton téléphone
2. Va dans "Scanner QR code"
3. Scanne un QR code d'invité
4. **Regarde attentivement les logs dans le terminal**

### Étape 3 : Analyser les Logs

Tu devrais voir cette séquence de logs :

```
📱 QR Scanner: Calling markPresent for guest: [Nom] ID: [ID]
🔵 markPresent called for guestId: [ID]
🌐 isOnline: true/false
👤 Guest found: [Nom]
```

Puis, selon si tu es en ligne ou hors ligne :

#### Si EN LIGNE (isOnline: true)
```
✅ Online mode - calling Firebase
🔥 FirebaseService: markGuestPresent called for: [ID]
🔥 FirebaseService: Authentication OK, user: [user-id]
🔥 FirebaseService: Validation OK
🔥 FirebaseService: Updating document in Firestore...
🔥 FirebaseService: Document updated successfully
✅ Guest marked as present: [ID]
✅ Firebase markGuestPresent completed
📱 QR Scanner: markPresent completed
```

#### Si HORS LIGNE (isOnline: false)
```
⚠️ Offline mode - queuing action
📝 Action queued, pending count: 1
```

## 🚨 Scénarios d'Erreur

### Scénario 1 : Pas de logs du tout

**Symptôme** : Aucun log n'apparaît après le scan

**Cause possible** :
- Le scanner ne détecte pas le QR code
- Le QR code est invalide

**Solution** :
1. Vérifie que le QR code est bien généré
2. Essaie avec un autre QR code
3. Utilise la recherche manuelle

### Scénario 2 : "isOnline: false"

**Symptôme** : Tu vois `⚠️ Offline mode - queuing action`

**Cause** : L'app pense que tu es hors ligne

**Solution** :
1. Vérifie ta connexion Internet
2. Regarde si tu vois "Hors-ligne" en haut de l'écran
3. Tire vers le bas dans "Liste des invités" pour synchroniser

### Scénario 3 : Erreur d'authentification

**Symptôme** : Tu vois `❌ Utilisateur non authentifié`

**Cause** : Firebase Auth n'est pas initialisé

**Solution** :
1. Redémarre l'app complètement
2. Vérifie les logs au démarrage : `🔥 Firebase initialized successfully`
3. Si absent, il y a un problème d'initialisation Firebase

### Scénario 4 : Erreur Firestore

**Symptôme** : Tu vois `❌ Error marking guest present: [erreur]`

**Causes possibles** :
- Règles Firestore trop restrictives
- Document n'existe pas
- Problème de permissions

**Solution** :
1. Va sur Firebase Console
2. Vérifie les règles Firestore
3. Vérifie que le document existe dans la collection `guests`

### Scénario 5 : Logs OK mais dashboard pas à jour

**Symptôme** : Tous les logs sont OK mais le dashboard ne change pas

**Cause** : Problème de synchronisation temps réel

**Solution** :
1. Ferme et rouvre l'app
2. Va dans Dashboard et tire vers le bas pour rafraîchir
3. Vérifie Firebase Console pour voir si les données sont bien mises à jour

## 📋 Checklist de Débogage

Copie cette checklist et coche au fur et à mesure :

```
[ ] 1. Redémarré l'app avec cache vidé (npx expo start -c)
[ ] 2. Vérifié que Firebase est initialisé (log: 🔥 Firebase initialized successfully)
[ ] 3. Scanné un QR code
[ ] 4. Vu les logs du scanner (📱 QR Scanner: Calling markPresent)
[ ] 5. Vu les logs du hook (🔵 markPresent called)
[ ] 6. Vérifié isOnline (🌐 isOnline: true/false)
[ ] 7. Si online: Vu les logs Firebase (🔥 FirebaseService)
[ ] 8. Vu le log de succès (✅ Guest marked as present)
[ ] 9. Vérifié le dashboard
[ ] 10. Vérifié Firebase Console
```

## 🔧 Actions Correctives

### Si isOnline = false mais tu as Internet

Le problème vient du hook `useNetworkStatus`. Vérifie :

```typescript
// Dans src/hooks/useFirebaseGuests.ts
const { isOnline } = useNetworkStatus();
```

**Solution temporaire** : Force le mode online en modifiant temporairement :

```typescript
// TEMPORAIRE - Pour tester
const isOnline = true; // Force online mode
```

### Si Firebase n'est pas initialisé

Vérifie `src/config/firebase.ts` :

```bash
# Regarde les logs au démarrage
# Tu dois voir :
LOG  🔥 Firebase initialized successfully

# Si tu vois :
ERROR  ❌ Firebase initialization failed

# Alors il y a un problème de config
```

### Si les règles Firestore bloquent

Va sur Firebase Console → Firestore → Règles

Vérifie que tu as :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /guests/{guestId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📊 Tableau de Diagnostic

| Symptôme | Cause Probable | Solution |
|----------|----------------|----------|
| Pas de logs | QR code invalide | Régénérer le QR code |
| isOnline: false | Détection réseau | Vérifier useNetworkStatus |
| Auth error | Firebase pas init | Redémarrer l'app |
| Firestore error | Règles/Permissions | Vérifier Firebase Console |
| Logs OK, pas de mise à jour | Sync temps réel | Fermer/rouvrir l'app |

## 🎬 Prochaines Étapes

1. **Redémarre l'app** avec `npx expo start -c`
2. **Scanne un QR code**
3. **Copie TOUS les logs** du terminal
4. **Partage-les** pour qu'on puisse identifier le problème exact

## 💡 Astuce

Pour copier facilement les logs :
1. Clique dans le terminal
2. Ctrl+A (tout sélectionner)
3. Ctrl+C (copier)
4. Colle dans un fichier texte ou partage directement

## 🆘 Si Rien Ne Fonctionne

Si après tout ça, ça ne fonctionne toujours pas :

1. **Sauvegarde ton travail** : `git stash`
2. **Reviens sur un commit qui fonctionnait**
3. **Compare les différences** : `git diff`
4. **Identifie ce qui a changé**

Ou simplement partage les logs complets et on trouvera le problème ensemble !
