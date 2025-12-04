# Nouvelles fonctionnalités ajoutées

## ✅ 1. Sélection multiple pour suppression (style WhatsApp)

### Fonctionnalité
- Possibilité de sélectionner plusieurs invités à la fois
- Suppression groupée en une seule action
- Interface intuitive avec **appui long** (long press)

### Utilisation
1. **Appuyez longuement** (500ms) sur un invité pour activer le mode sélection
2. L'invité est automatiquement sélectionné
3. Tapez sur d'autres invités pour les ajouter/retirer de la sélection
4. Utilisez les boutons dans l'en-tête :
   - **Compteur** : Affiche le nombre d'invités sélectionnés
   - **"Tout"** : Sélectionner tous les invités visibles
   - **"Annuler"** : Quitter le mode sélection
5. Cliquez sur le bouton rouge flottant avec l'icône poubelle pour supprimer

### Détails techniques
- Activation par appui long (500ms) comme WhatsApp
- État de sélection géré avec `Set<string>` pour performance optimale
- Confirmation avant suppression groupée
- Suppression en parallèle avec `Promise.all()`
- Indicateurs visuels :
  - Fond bleu clair pour les invités sélectionnés
  - Checkboxes circulaires qui apparaissent en mode sélection
  - Désélection automatique si aucun invité n'est sélectionné

## ✅ 2. Confirmation de changement de statut

### Fonctionnalité
- Confirmation obligatoire avant de marquer un invité présent/absent
- Évite les changements accidentels de statut
- Message clair avec le nom de l'invité et l'action

### Comportement
Lorsqu'on clique sur le badge de statut (✅/⏳) :
1. Une alerte de confirmation s'affiche
2. Le message indique : *"Voulez-vous marquer [Nom] comme présent/absent ?"*
3. Deux options :
   - **Annuler** : Aucun changement
   - **✅ Marquer présent** ou **⏳ Marquer absent** : Confirme l'action

### Exemple
```
Invité : "M. FEUJIO Joseph et Mme" (actuellement absent)
Clic sur le badge → Confirmation
→ "Voulez-vous marquer M. FEUJIO Joseph et Mme comme présent ?"
→ Boutons : Annuler | ✅ Marquer présent
```

## ✅ 3. Validation des doublons

### Fonctionnalité
- Empêche l'ajout d'un invité si le même nom existe déjà
- Vérification insensible à la casse (majuscules/minuscules)
- Message d'erreur clair indiquant le doublon

### Comportement
Lors de l'ajout d'un invité :
1. Le système vérifie si un invité avec le même nom existe
2. Si oui → Message d'erreur : *"Un invité avec le nom "XXX" existe déjà"*
3. Si non → L'invité est ajouté normalement

### Exemple
```
Invité existant : "M. FEUJIO Joseph et Mme"
Tentative d'ajout : "m. feujio joseph et mme"
→ Rejeté (même nom, casse différente)
```

## ✅ 4. Amélioration de l'import CSV

### Corrections apportées
- Migration vers la nouvelle API `expo-file-system` (File/Paths)
- Meilleure gestion d'erreur avec messages explicites
- Support des colonnes en français ET anglais
- Logs de débogage pour faciliter le diagnostic
- Validation que le fichier n'est pas vide

### Format CSV supporté
```csv
fullName,tableName,companions
M. FEUJIO Joseph et Mme,genese,1
```

OU

```csv
nom,table,accompagnants
M. FEUJIO Joseph et Mme,genese,1
```

## 🎨 Interface utilisateur

### Mode normal
- Bouton **"+"** flottant pour ajouter un invité
- Boutons : Export | Import
- **Appui long** sur un invité pour activer la sélection

### Mode sélection (activé par appui long)
- Checkboxes circulaires apparaissent automatiquement
- Compteur dans l'en-tête : "X sélectionné(s)"
- Boutons : Tout | Annuler
- Bouton rouge flottant avec compteur pour supprimer
- Tap simple pour sélectionner/désélectionner

### Indicateurs visuels
- ✅ Fond bleu clair pour les invités sélectionnés
- 🔴 Badge rouge avec le nombre d'invités sélectionnés sur le bouton flottant
- ⚪ Checkbox circulaire vide/cochée pour chaque invité
- 📱 Expérience similaire à WhatsApp

## 📝 Composants modifiés

1. **src/screens/GuestListScreen.tsx**
   - Ajout du mode sélection par appui long
   - Confirmation de changement de statut
   - Validation des doublons
   - Amélioration de l'import CSV

2. **src/components/GuestItem.tsx**
   - Support des checkboxes
   - Style de sélection
   - Props optionnelles pour le mode sélection

3. **src/services/pdfExportService.ts**
   - Migration vers nouvelle API File

4. **src/screens/DashboardScreen.tsx**
   - Migration vers nouvelle API File

## 🚀 Prochaines améliorations possibles

- [ ] Filtrer les invités sélectionnés
- [ ] Exporter uniquement les invités sélectionnés
- [ ] Marquer présent/absent en masse
- [ ] Déplacer les invités sélectionnés vers une autre table
- [ ] Historique des suppressions avec possibilité d'annuler
