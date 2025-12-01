# 🔧 Correction de l'erreur SQLite WASM

## ❌ Erreur

```
Unable to resolve "./wa-sqlite/wa-sqlite.wasm" from "node_modules\expo-sqlite\web\worker.ts"
```

## 🔍 Cause

Metro (le bundler React Native) essaie de résoudre les dépendances web d'expo-sqlite, mais ne sait pas comment gérer les fichiers `.wasm` (WebAssembly).

## ✅ Solutions Appliquées

### 1. Configuration Metro

Ajout du support WASM dans `metro.config.js` :

```javascript
config.resolver = {
  ...config.resolver,
  assetExts: [...(config.resolver?.assetExts || []), 'wasm'],
  sourceExts: [...(config.resolver?.sourceExts || []), 'js', 'json', 'ts', 'tsx', 'jsx'],
};
```

### 2. Redémarrage avec Cache Vidé

Pour appliquer les changements, tu dois redémarrer Metro avec le cache vidé :

```bash
# Arrête le serveur actuel (Ctrl+C)
# Puis relance avec :
npm start -- --reset-cache
```

Ou simplement :

```bash
npx expo start -c
```

## 🎯 Pourquoi cette erreur ?

- `expo-sqlite` a des dépendances pour le web (fichiers WASM)
- Metro essaie de résoudre toutes les dépendances, même celles non utilisées
- Sans configuration, Metro ne sait pas gérer les fichiers `.wasm`

## 📱 Note Importante

Cette erreur n'affecte que le bundling. Ton app mobile fonctionnera correctement car elle utilise la version native de SQLite, pas la version web.

## 🔄 Si l'erreur persiste

1. Arrête complètement Metro (Ctrl+C)
2. Vide le cache :
   ```bash
   npx expo start -c
   ```
3. Si ça ne fonctionne toujours pas, essaie :
   ```bash
   rm -rf node_modules
   npm install
   npx expo start -c
   ```

## ✨ Résultat Attendu

Après le redémarrage avec cache vidé, l'application devrait démarrer sans erreur et tu devrais voir :
- Le QR code pour scanner avec Expo Go
- Aucune erreur WASM
- L'app fonctionne normalement sur mobile
