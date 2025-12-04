# Guide d'importation CSV

## Format requis

Votre fichier CSV doit contenir les colonnes suivantes :

### Colonnes obligatoires :
- `fullName` : Le nom complet de l'invité
- `tableName` : Le nom de la table assignée

### Colonnes optionnelles :
- `companions` : Le nombre d'accompagnants (par défaut : 0)

## Exemple de fichier CSV correct :

```csv
fullName,tableName,companions
Jean Dupont,Table 1,2
Marie Martin,Table 2,1
Pierre Durand,Table 1,0
Sophie Leroy,Table 3,3
```

## Règles importantes :

1. **En-têtes** : La première ligne doit contenir les noms des colonnes
2. **Séparateur** : Utilisez la virgule (,) comme séparateur
3. **Encodage** : Sauvegardez le fichier en UTF-8 pour les caractères accentués
4. **Extension** : Le fichier doit avoir l'extension .csv

## Erreurs courantes :

### "En-têtes manquants"
- Vérifiez que votre première ligne contient : `fullName,tableName,companions`
- Les noms des colonnes doivent être exactement comme indiqué

### "Aucun invité valide trouvé"
- Vérifiez que les colonnes `fullName` et `tableName` ne sont pas vides
- Assurez-vous qu'il n'y a pas d'espaces supplémentaires dans les noms de colonnes

### "Fichier CSV vide"
- Vérifiez que votre fichier contient des données après les en-têtes
- Assurez-vous que le fichier n'est pas corrompu

## Comment créer un fichier CSV :

### Avec Excel :
1. Créez votre tableau avec les colonnes requises
2. Fichier > Enregistrer sous
3. Choisissez le format "CSV (délimité par des virgules)"

### Avec Google Sheets :
1. Créez votre tableau avec les colonnes requises
2. Fichier > Télécharger > Valeurs séparées par des virgules (.csv)

### Avec un éditeur de texte :
1. Créez un nouveau fichier
2. Tapez les en-têtes : `fullName,tableName,companions`
3. Ajoutez vos données ligne par ligne
4. Sauvegardez avec l'extension .csv