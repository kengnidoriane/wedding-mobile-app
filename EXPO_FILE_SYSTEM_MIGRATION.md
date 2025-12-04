# Migration expo-file-system - Résolution de l'erreur d'import

## 🔍 Problème identifié

L'application affichait une erreur de dépréciation :
```
Method readAsStringAsync imported from "expo-file-system" is deprecated.
You can migrate to the new filesystem API using "File" and "Directory" 
classes or import the legacy API from "expo-file-system/legacy".
```

**Contexte:** Import CSV dans l'écran des invités

## ✅ Solution appliquée

### Migration vers la nouvelle API expo-file-system

Au lieu d'utiliser les méthodes dépréciées comme `readAsStringAsync`, `writeAsStringAsync`, et `copyAsync`, nous avons migré vers les nouvelles classes `File` et `Paths`.

### Fichiers modifiés

#### 1. **src/screens/GuestListScreen.tsx**
- **Avant:**
```typescript
import * as FileSystem from 'expo-file-system';
// ...
const fileContent = await FileSystem.readAsStringAsync(fileUri);
```

- **Après:**
```typescript
import { File } from 'expo-file-system';
// ...
const file = new File(fileUri);
const fileContent = await file.text();
```

#### 2. **src/screens/DashboardScreen.tsx**
- **Avant:**
```typescript
import * as FileSystem from 'expo-file-system';
// ...
const fileUri = `${FileSystem.documentDirectory}wedding-guests-export.json`;
await FileSystem.writeAsStringAsync(fileUri, fileContent);
```

- **Après:**
```typescript
import { File, Paths } from 'expo-file-system';
// ...
const file = new File(Paths.document, 'wedding-guests-export.json');
await file.write(fileContent);
```

#### 3. **src/services/pdfExportService.ts**
- **Avant:**
```typescript
import * as FileSystem from 'expo-file-system';
// ...
await FileSystem.copyAsync({
  from: uri,
  to: newUri
});
```

- **Après:**
```typescript
import { File, Paths } from 'expo-file-system';
// ...
const sourceFile = new File(uri);
const destinationFile = new File(Paths.document, filename);
sourceFile.copy(destinationFile);
```

## 📋 Correspondance des méthodes

| Ancienne API (dépréciée) | Nouvelle API |
|--------------------------|--------------|
| `FileSystem.readAsStringAsync(uri)` | `new File(uri).text()` |
| `FileSystem.writeAsStringAsync(uri, content)` | `new File(uri).write(content)` |
| `FileSystem.copyAsync({from, to})` | `sourceFile.copy(destinationFile)` |
| `FileSystem.documentDirectory` | `Paths.document` |
| `FileSystem.deleteAsync(uri)` | `new File(uri).delete()` |

## 🎯 Avantages de la nouvelle API

1. **Plus orientée objet** - Utilisation de classes au lieu de fonctions
2. **Plus intuitive** - Les opérations sont des méthodes sur les objets File
3. **Meilleure gestion des erreurs** - API plus moderne et cohérente
4. **Support à long terme** - L'ancienne API sera supprimée dans les futures versions

## ✨ Résultat

- ✅ L'erreur de dépréciation a été éliminée
- ✅ L'import CSV fonctionne correctement
- ✅ L'export JSON fonctionne correctement
- ✅ L'export PDF fonctionne correctement
- ✅ Le code est compatible avec les futures versions d'Expo

## 🔗 Références

- [Documentation expo-file-system](https://docs.expo.dev/versions/v54.0.0/sdk/filesystem/)
- [Guide de migration](https://docs.expo.dev/versions/v54.0.0/sdk/filesystem/#migration-guide)
