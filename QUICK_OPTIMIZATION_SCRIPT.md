# 🚀 Script d'optimisation rapide

## Exécutez ces commandes dans l'ordre :

### 1. Supprimer les dépendances inutilisées
```bash
npm uninstall expo-clipboard expo-sqlite react-native-web react-dom
```

### 2. Installer l'outil de suppression des console.log
```bash
npm install --save-dev babel-plugin-transform-remove-console
```

### 3. Créer/Modifier babel.config.js
Ajoutez ce plugin dans votre babel.config.js

### 4. Compresser les images
Allez sur https://tinypng.com/ et compressez :
- assets/icon.png
- assets/adaptive-icon.png
- assets/splash-icon.png
- assets/favicon.png

### 5. Supprimer les fichiers de test
```bash
rm invites_test_corrected.csv
rm assets/invites_test.csv
```

### 6. Activer Hermes
Ajoutez dans app.json :
```json
{
  "expo": {
    "android": {
      "jsEngine": "hermes"
    },
    "ios": {
      "jsEngine": "hermes"
    }
  }
}
```

### 7. Rebuild
```bash
eas build --platform android --profile production
```

## Résultat attendu : 30-40% de réduction !
