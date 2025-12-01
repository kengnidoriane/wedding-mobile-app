# 🔥 Correction de l'erreur Firebase Auth

## ❌ Problème Identifié

L'erreur **"Component auth has not been registered yet"** se produisait au démarrage de l'application.

### Cause Racine

Dans `src/services/firebaseService.ts`, les instances Firebase (`db` et `auth`) étaient appelées **immédiatement au chargement du module** :

```typescript
// ❌ PROBLÈME : Appel immédiat des getters
const db = getDb();
const auth = getAuth();
```

Ces appels se produisaient **AVANT** que Firebase soit complètement initialisé, causant l'erreur.

## ✅ Solution Appliquée

### 1. Suppression des Appels Immédiats

Supprimé les lignes qui appelaient immédiatement les getters dans `firebaseService.ts`.

### 2. Appels Lazy des Getters

Modifié chaque méthode pour appeler les getters **uniquement quand nécessaire** :

```typescript
// ✅ SOLUTION : Appel lazy dans chaque méthode
async initialize(): Promise<void> {
  const auth = getAuth(); // Appelé seulement ici
  const userCredential = await signInAnonymously(auth);
  // ...
}

subscribeToGuests(callback: (guests: Guest[]) => void): Unsubscribe {
  const db = getDb(); // Appelé seulement ici
  const guestsQuery = query(collection(db, COLLECTIONS.GUESTS), ...);
  // ...
}
```

### 3. Corrections Supplémentaires

- Corrigé les duplications dans l'interface `UseFirebaseGuestsReturn`
- Supprimé les déclarations en double de `exportToPDF` et `clearError`

## 📋 Fichiers Modifiés

1. **src/config/firebase.ts**
   - Ajout de getters sécurisés avec initialisation lazy
   - Gestion des cas où Firebase n'est pas encore initialisé

2. **src/services/firebaseService.ts**
   - Suppression des appels immédiats aux getters
   - Ajout d'appels lazy dans chaque méthode

3. **src/hooks/useFirebaseGuests.ts**
   - Correction des duplications dans l'interface

## 🧪 Test

Pour tester la correction :

```bash
npm start
```

L'application devrait maintenant démarrer sans l'erreur "Component auth has not been registered yet".

## 📝 Explication Technique

### Avant (Problématique)

```
1. Module firebaseService.ts se charge
2. Ligne 28-29 : const db = getDb(); const auth = getAuth();
3. getAuth() essaie d'accéder à Firebase Auth
4. ❌ Firebase n'est pas encore complètement initialisé
5. ERREUR: "Component auth has not been registered yet"
```

### Après (Solution)

```
1. Module firebaseService.ts se charge
2. Aucun appel immédiat aux getters
3. L'application démarre
4. useFirebaseGuests appelle firebaseService.initialize()
5. ✅ getAuth() est appelé APRÈS l'initialisation complète
6. Tout fonctionne correctement
```

## 🎯 Principe Clé

**Lazy Loading** : Ne jamais appeler les getters Firebase au niveau du module. Toujours les appeler **à l'intérieur des méthodes** qui en ont besoin.

## 🔍 Vérification

Si l'erreur persiste, vérifier :

1. Que `npm start` a bien été relancé
2. Que le cache Metro a été vidé : `npm start -- --reset-cache`
3. Que l'application Expo Go a été fermée et relancée
