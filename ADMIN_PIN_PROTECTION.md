# 🔐 Protection par Code PIN Administrateur

## ✅ Implémentation Complète

### Fonctionnalités

1. **Code PIN à 4 chiffres** pour protéger les actions sensibles
2. **Actions protégées** :
   - ❌ Supprimer un invité
   - ⏰ Marquer un invité comme absent
3. **Code par défaut** : `1234`
4. **Modal de saisie** élégant et intuitif
5. **Messages d'erreur** clairs

## 📄 Fichiers Créés

### 1. Service d'Authentification Admin
**Fichier** : `src/services/adminAuthService.ts`

**Fonctionnalités** :
- Stockage sécurisé du code PIN (AsyncStorage)
- Vérification du code
- Modification du code
- Réinitialisation au code par défaut

**API** :
```typescript
// Initialiser
await adminAuthService.initialize();

// Vérifier un code
const isValid = await adminAuthService.verifyPin('1234');

// Changer le code
await adminAuthService.setPin('5678');

// Réinitialiser
await adminAuthService.resetPin();
```

### 2. Modal de Saisie du Code
**Fichier** : `src/components/PinCodeModal.tsx`

**Caractéristiques** :
- 4 champs pour les chiffres
- Auto-focus sur le champ suivant
- Validation automatique
- Messages d'erreur
- Design moderne

**Props** :
```typescript
<PinCodeModal
  visible={showPinModal}
  onClose={() => setShowPinModal(false)}
  onSuccess={() => performAction()}
  title="🔐 Code Administrateur"
  message="Entrez le code à 4 chiffres"
/>
```

## 🔧 Modifications à Appliquer

### Dans `src/screens/GuestListScreen.tsx`

#### 1. Imports
```typescript
import { PinCodeModal } from '../components/PinCodeModal';
import { adminAuthService } from '../services/adminAuthService';
```

#### 2. États
```typescript
const [showPinModal, setShowPinModal] = useState(false);
const [pendingAction, setPendingAction] = useState<{
  type: 'delete' | 'markAbsent';
  guestId: string;
  guestName: string;
} | null>(null);
```

#### 3. Initialisation
```typescript
useEffect(() => {
  adminAuthService.initialize();
}, []);
```

#### 4. Fonction de Vérification
```typescript
const requireAdminAuth = (
  action: 'delete' | 'markAbsent',
  guestId: string,
  guestName: string
) => {
  setPendingAction({ type: action, guestId, guestName });
  setShowPinModal(true);
};

const executePendingAction = async () => {
  if (!pendingAction) return;

  const { type, guestId, guestName } = pendingAction;

  if (type === 'delete') {
    await deleteGuestFirebase(guestId);
  } else if (type === 'markAbsent') {
    await markAbsent(guestId);
  }

  setPendingAction(null);
};
```

#### 5. Modifier handleDeleteGuest
```typescript
const handleDeleteGuest = async (id: string, name: string) => {
  Alert.alert(
    'Confirmer la suppression',
    `Voulez-vous vraiment supprimer ${name} ?`,
    [
      { text: 'Annuler', style: 'cancel' },
      { 
        text: 'Supprimer', 
        style: 'destructive',
        onPress: () => requireAdminAuth('delete', id, name)  // CHANGEMENT ICI
      }
    ]
  );
};
```

#### 6. Modifier toggleGuestPresence
```typescript
const toggleGuestPresence = async (id: string, name: string, isCurrentlyPresent: boolean) => {
  const action = isCurrentlyPresent ? 'marquer comme absent' : 'marquer comme présent';
  
  // Si on marque comme absent, demander le code
  if (isCurrentlyPresent) {
    Alert.alert(
      'Changer le statut',
      `Voulez-vous ${action} ${name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer',
          onPress: () => requireAdminAuth('markAbsent', id, name)  // CHANGEMENT ICI
        }
      ]
    );
  } else {
    // Marquer comme présent ne nécessite pas de code
    Alert.alert(
      'Changer le statut',
      `Voulez-vous ${action} ${name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer',
          onPress: async () => {
            try {
              await markPresent(id);
            } catch (error) {
              console.error('Error in toggleGuestPresence:', error);
            }
          }
        }
      ]
    );
  }
};
```

#### 7. Ajouter le Modal
```tsx
{/* Modal de code PIN */}
<PinCodeModal
  visible={showPinModal}
  onClose={() => {
    setShowPinModal(false);
    setPendingAction(null);
  }}
  onSuccess={executePendingAction}
  title="🔐 Code Administrateur"
  message="Cette action nécessite un code administrateur"
/>
```

## 🎨 Design du Modal

### Apparence
```
┌─────────────────────────────┐
│   🔐 Code Administrateur    │
│                             │
│ Entrez le code à 4 chiffres │
│                             │
│   [_] [_] [_] [_]          │
│                             │
│  [Annuler]    [Valider]    │
│                             │
│  💡 Code par défaut : 1234  │
└─────────────────────────────┘
```

### États
- **Vide** : Champs gris clair
- **Rempli** : Champs blancs avec bordure bleue
- **Erreur** : Champs avec bordure rouge + message

## 🔐 Sécurité

### Code PIN
- **Format** : 4 chiffres uniquement
- **Stockage** : AsyncStorage (local)
- **Par défaut** : 1234
- **Modifiable** : Via écran de paramètres

### Actions Protégées
- ❌ **Supprimer** : Toujours protégé
- ⏰ **Marquer absent** : Toujours protégé
- ✅ **Marquer présent** : PAS protégé (scan QR)

### Flux de Protection
```
1. Utilisateur clique sur "Supprimer" ou "Marquer absent"
2. Confirmation standard (Alert)
3. Si confirmé → Modal de code PIN
4. Utilisateur entre le code
5. Si correct → Action exécutée
6. Si incorrect → Message d'erreur + réessayer
```

## 📱 Expérience Utilisateur

### Scénario 1 : Supprimer un Invité
```
1. Clic sur 🗑️
2. "Voulez-vous vraiment supprimer Alice ?"
3. Clic sur "Supprimer"
4. Modal de code PIN apparaît
5. Entre "1234"
6. ✅ Invité supprimé
```

### Scénario 2 : Code Incorrect
```
1. Clic sur 🗑️
2. Confirmation
3. Modal de code PIN
4. Entre "0000"
5. ❌ "Code incorrect"
6. Champs réinitialisés
7. Peut réessayer ou annuler
```

### Scénario 3 : Marquer Présent (Pas de Code)
```
1. Scan QR code
2. ✅ Directement marqué présent
3. Pas de code demandé
```

## ⚙️ Configuration du Code

### Changer le Code (À implémenter)

Dans l'écran de paramètres :

```typescript
import { adminAuthService } from '../services/adminAuthService';

const changeAdminPin = async (oldPin: string, newPin: string) => {
  // Vérifier l'ancien code
  const isValid = await adminAuthService.verifyPin(oldPin);
  
  if (!isValid) {
    Alert.alert('Erreur', 'Code actuel incorrect');
    return;
  }
  
  // Définir le nouveau code
  const success = await adminAuthService.setPin(newPin);
  
  if (success) {
    Alert.alert('Succès', 'Code administrateur modifié');
  } else {
    Alert.alert('Erreur', 'Impossible de modifier le code');
  }
};
```

## 🎯 Avantages

### Sécurité
- ✅ Empêche les suppressions accidentelles
- ✅ Empêche les abus (marquer absent sans raison)
- ✅ Contrôle d'accès simple mais efficace

### UX
- ✅ Interface intuitive
- ✅ Feedback immédiat
- ✅ Messages clairs
- ✅ Possibilité de réessayer

### Flexibilité
- ✅ Code modifiable
- ✅ Réinitialisable
- ✅ Actions sélectives (présent pas protégé)

## 📝 Notes Importantes

### Code Par Défaut
Le code par défaut est **1234**. Il est recommandé de :
1. Le changer lors de la première utilisation
2. L'afficher dans l'écran de paramètres
3. Permettre la réinitialisation si oublié

### Actions Non Protégées
- ✅ Marquer présent (scan QR)
- ✅ Ajouter un invité
- ✅ Modifier un invité
- ✅ Voir la liste
- ✅ Filtrer

### Stockage
Le code est stocké en clair dans AsyncStorage. Pour une sécurité renforcée, on pourrait :
- Hasher le code (SHA-256)
- Utiliser Expo SecureStore
- Ajouter un délai après X tentatives

## 🚀 Prochaines Étapes

1. ✅ Service créé
2. ✅ Modal créé
3. ⏳ Intégrer dans GuestListScreen
4. ⏳ Ajouter écran de configuration du code
5. ⏳ Tester le flux complet

## 💡 Améliorations Futures

- Ajouter un délai après 3 tentatives échouées
- Hasher le code PIN
- Ajouter la biométrie (Touch ID / Face ID)
- Logs des tentatives d'accès
- Code temporaire pour invités
