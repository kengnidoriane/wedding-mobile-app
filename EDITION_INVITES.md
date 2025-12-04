# Édition des informations d'un invité

## 🎯 Fonctionnalité ajoutée

Possibilité de modifier les informations d'un invité directement depuis l'écran de détails.

## ✏️ Informations modifiables

1. **Nom complet**
2. **Table**
3. **Nombre d'accompagnants**

## 🎨 Design et UX

### Mode consultation (par défaut)
- Affichage en lecture seule
- Bouton "✏️ Modifier" en haut à droite de la section "Informations"

### Mode édition
- Champs de texte éditables avec validation en temps réel
- Messages d'erreur sous chaque champ si invalide
- Deux boutons :
  - **Annuler** : Annule les modifications
  - **Enregistrer** : Sauvegarde les changements

## 🔒 Validations

### Validation en temps réel
- **Nom complet** : 2-100 caractères
- **Table** : 2-50 caractères
- **Accompagnants** : 0-20 personnes

### Validation des doublons
- Si le nom est modifié et qu'un invité avec ce nom existe déjà
- Affiche une alerte de confirmation
- L'utilisateur peut choisir de continuer ou annuler

### Messages d'erreur
- Affichés en rouge sous chaque champ
- Clairs et explicites
- Basés sur le service de validation existant

## 📱 Flux utilisateur

### Modification simple
```
Détails invité → Bouton "Modifier" → Modifier les champs
→ Bouton "Enregistrer" → Confirmation → Retour en mode consultation
```

### Modification avec doublon
```
Détails invité → Bouton "Modifier" → Changer le nom
→ Bouton "Enregistrer" → Alerte doublon détecté
→ Choix : Annuler ou Continuer → Sauvegarde
```

### Annulation
```
Détails invité → Bouton "Modifier" → Modifier les champs
→ Bouton "Annuler" → Retour en mode consultation (sans sauvegarder)
```

## 🎨 Bonnes pratiques appliquées

### 1. **Édition inline**
- ✅ Pas de navigation vers un nouvel écran
- ✅ Contexte préservé
- ✅ Expérience fluide

### 2. **Validation en temps réel**
- ✅ Feedback immédiat
- ✅ Prévention des erreurs
- ✅ Messages clairs

### 3. **Confirmation des actions critiques**
- ✅ Alerte si doublon détecté
- ✅ Message de succès après sauvegarde
- ✅ Possibilité d'annuler

### 4. **Design cohérent**
- ✅ Utilise les composants existants
- ✅ Respecte le thème de l'app
- ✅ Interface iOS native

### 5. **Gestion des états**
- ✅ Loading state pendant la sauvegarde
- ✅ Désactivation des boutons pendant l'opération
- ✅ Gestion des erreurs

## 🔧 Implémentation technique

### État local
```typescript
const [isEditing, setIsEditing] = useState(false);
const [editedFullName, setEditedFullName] = useState('');
const [editedTableName, setEditedTableName] = useState('');
const [editedCompanions, setEditedCompanions] = useState('');
```

### Fonctions principales
- `startEditing()` : Active le mode édition
- `cancelEditing()` : Annule et réinitialise
- `saveChanges()` : Valide et sauvegarde
- `performUpdate()` : Effectue la mise à jour Firebase

### Validation
- Utilise `validationService` existant
- Validation champ par champ
- Validation globale avant sauvegarde
- Vérification des doublons

## 📊 Exemple d'interface

### Mode consultation
```
┌─────────────────────────────────┐
│ Informations      ✏️ Modifier   │
├─────────────────────────────────┤
│ Nom complet                     │
│ M. FEUJIO Joseph et Mme         │
├─────────────────────────────────┤
│ Table                           │
│ genese                          │
├─────────────────────────────────┤
│ Accompagnants                   │
│ 1 personne                      │
├─────────────────────────────────┤
│ Total personnes                 │
│ 2                               │
└─────────────────────────────────┘
```

### Mode édition
```
┌─────────────────────────────────┐
│ Informations                    │
├─────────────────────────────────┤
│ Nom complet *                   │
│ ┌─────────────────────────────┐ │
│ │ M. FEUJIO Joseph et Mme     │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Table *                         │
│ ┌─────────────────────────────┐ │
│ │ genese                      │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Accompagnants *                 │
│ ┌─────────────────────────────┐ │
│ │ 1                           │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ [Annuler]  [Enregistrer]        │
└─────────────────────────────────┘
```

## ✅ Avantages

1. **Flexibilité** : Correction facile des erreurs de saisie
2. **Pas de suppression/recréation** : Préserve l'historique et les relations
3. **Validation robuste** : Empêche les données invalides
4. **UX moderne** : Édition inline intuitive
5. **Sécurité** : Confirmation pour les actions critiques

## 🔄 Intégration avec l'existant

- ✅ Utilise `updateGuest` du hook `useFirebaseGuests`
- ✅ Utilise `validationService` pour la validation
- ✅ Respecte le système de loading states
- ✅ Compatible avec le mode hors-ligne
- ✅ Synchronisation Firebase automatique

## 📝 Fichiers modifiés

1. **src/screens/GuestDetailScreen.tsx**
   - Ajout du mode édition
   - Gestion des états d'édition
   - Validation et sauvegarde
   - Interface utilisateur

## 🎯 Résultat

Une fonctionnalité d'édition **complète**, **intuitive** et **sécurisée**, respectant les meilleures pratiques de design mobile !
