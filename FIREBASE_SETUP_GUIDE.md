# 🔥 Guide de Configuration Firebase
## Configuration complète pour Wedding App

---

## 🚀 **Étape 1 : Créer le projet Firebase**

### **1.1 Aller sur Firebase Console**
- Ouvrir [console.firebase.google.com](https://console.firebase.google.com)
- Se connecter avec votre compte Google
- Cliquer sur "Créer un projet"

### **1.2 Configuration du projet**
```
Nom du projet: wedding-app-[votre-nom]
Exemple: wedding-app-martin-sophie

☑️ Activer Google Analytics (optionnel)
☑️ Accepter les conditions
```

---

## 🗄️ **Étape 2 : Configurer Firestore**

### **2.1 Créer la base de données**
1. Dans la console Firebase, aller à **"Firestore Database"**
2. Cliquer **"Créer une base de données"**
3. Choisir **"Commencer en mode test"** (pour commencer)
4. Sélectionner la région la plus proche (Europe-west1 pour la France)

### **2.2 Règles de sécurité**
Remplacer les règles par défaut par :
```javascript
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
      allow create: if request.auth != null;
    }
  }
}
```

---

## 🔐 **Étape 3 : Configurer l'authentification**

### **3.1 Activer l'authentification anonyme**
1. Aller à **"Authentication"**
2. Cliquer sur **"Commencer"**
3. Onglet **"Sign-in method"**
4. Activer **"Connexion anonyme"**
5. Cliquer **"Enregistrer"**

---

## 📱 **Étape 4 : Ajouter l'application Android**

### **4.1 Enregistrer l'app**
1. Cliquer sur l'icône Android dans la console
2. **Nom du package Android** : `com.weddingapp.firebase`
3. **Surnom de l'app** : `Wedding App`
4. Cliquer **"Enregistrer l'app"**

### **4.2 Télécharger google-services.json**
1. Télécharger le fichier `google-services.json`
2. **NE PAS** le mettre dans votre projet (Expo gère ça différemment)
3. Garder les informations de configuration pour l'étape suivante

---

## ⚙️ **Étape 5 : Configuration dans votre app**

### **5.1 Récupérer les clés de configuration**
Dans la console Firebase, aller à **"Paramètres du projet"** > **"Général"** > **"Vos applications"**

Copier ces valeurs :
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDug_hY3owvc5SfrjJP2jLTCSEuQLl4L7M",
  authDomain: "wedding-app-yves-monique.firebaseapp.com",
  projectId: "wedding-app-yves-monique",
  storageBucket: "wedding-app-yves-monique.appspot.com",
  messagingSenderId: "159879208340",
  appId: "1:159879208340:android:742f33b0c257cefa4b0381"
};
```

### **5.2 Mettre à jour app.json**
Remplacer les valeurs dans `app.json` :
```json
{
  "expo": {
    "extra": {
      "firebaseApiKey": "VOTRE_API_KEY",
      "firebaseAuthDomain": "VOTRE_PROJECT.firebaseapp.com",
      "firebaseProjectId": "VOTRE_PROJECT_ID",
      "firebaseStorageBucket": "VOTRE_PROJECT.appspot.com",
      "firebaseMessagingSenderId": "VOTRE_SENDER_ID",
      "firebaseAppId": "VOTRE_APP_ID",
      "useFirebaseEmulator": false
    }
  }
}
```

---

## 🧪 **Étape 6 : Test de la configuration**

### **6.1 Démarrer l'application**
```bash
npm start
```

### **6.2 Vérifier les logs**
Vous devriez voir dans la console :
```
🔥 Firebase initialized successfully
🔥 Firebase service initialized with user: [user-id]
```

### **6.3 Test d'ajout d'invité**
1. Ouvrir l'app
2. Aller dans "Liste des invités"
3. Ajouter un invité de test
4. Vérifier dans la console Firebase que l'invité apparaît

---

## 🔄 **Étape 7 : Migration des données existantes**

### **7.1 Exporter depuis SQLite**
Si vous avez déjà des invités dans SQLite :

```typescript
// Fonction à ajouter temporairement dans votre app
const exportSQLiteData = async () => {
  const guests = await getAllGuests();
  const guestsData = guests.map(guest => ({
    fullName: guest.fullName,
    tableName: guest.tableName,
    companions: guest.companions
  }));
  
  console.log('Données à migrer:', JSON.stringify(guestsData, null, 2));
  // Copier ces données pour l'import Firebase
};
```

### **7.2 Importer dans Firebase**
```typescript
// Utiliser la fonction importGuests du hook
const migrateData = async () => {
  const guestsToImport = [
    { fullName: "Jean Dupont", tableName: "Table 1", companions: 1 },
    { fullName: "Marie Martin", tableName: "Table 2", companions: 0 },
    // ... autres invités
  ];
  
  await importGuests(guestsToImport);
};
```

---

## 🛡️ **Étape 8 : Sécurité Production**

### **8.1 Règles Firestore strictes**
Pour la production, utiliser des règles plus strictes :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /guests/{guestId} {
      allow read, write: if request.auth != null 
        && request.auth.token.firebase.sign_in_provider == 'anonymous';
    }
  }
}
```

### **8.2 Limites de sécurité**
- Activer **"App Check"** pour la production
- Configurer des **quotas** pour éviter les abus
- Surveiller l'utilisation dans **"Usage and billing"**

---

## 📊 **Étape 9 : Monitoring**

### **9.1 Tableau de bord Firebase**
Surveiller :
- **Firestore** : Nombre de lectures/écritures
- **Authentication** : Nombre d'utilisateurs
- **Performance** : Temps de réponse

### **9.2 Alertes**
Configurer des alertes pour :
- Usage élevé
- Erreurs fréquentes
- Problèmes de performance

---

## 🚨 **Dépannage**

### **Erreur : "Firebase configuration incomplete"**
```
Solution: Vérifier que toutes les clés dans app.json sont correctes
```

### **Erreur : "Permission denied"**
```
Solution: Vérifier les règles Firestore et l'authentification
```

### **Erreur : "Network request failed"**
```
Solution: Vérifier la connexion internet et les permissions réseau
```

### **Les données ne se synchronisent pas**
```
Solution: 
1. Vérifier les logs de la console
2. Redémarrer l'app
3. Vérifier la configuration Firebase
```

---

## ✅ **Checklist de validation**

- [ ] Projet Firebase créé
- [ ] Firestore configuré avec les bonnes règles
- [ ] Authentification anonyme activée
- [ ] App Android enregistrée
- [ ] Configuration copiée dans app.json
- [ ] App démarre sans erreur
- [ ] Ajout d'invité fonctionne
- [ ] Synchronisation temps réel fonctionne
- [ ] Données visibles dans la console Firebase

---

## 🎯 **Résultat Final**

Après cette configuration, vous aurez :

✅ **Synchronisation temps réel** entre tous les appareils
✅ **Sauvegarde cloud** automatique
✅ **Gestion d'erreurs** robuste
✅ **Interface utilisateur** avec indicateurs de sync
✅ **Audit trail** de toutes les actions

**Temps estimé de configuration : 30-45 minutes**

---

## 📞 **Support**

Si vous rencontrez des problèmes :
1. Vérifier les logs de la console
2. Consulter la documentation Firebase
3. Tester avec un projet Firebase vide
4. Vérifier la configuration réseau

**Votre app sera maintenant synchronisée sur tous les appareils ! 🚀**