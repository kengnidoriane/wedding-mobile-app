# 🧪 Tests Simplifiés pour Wedding App

## ❌ Problème Rencontré

Les tests unitaires ont des **conflits de versions** entre :
- React Native 0.81.5 (ancien)
- React 19.1.0 (récent)
- Jest/Testing Library (incompatibilités)

## ✅ Solution Recommandée

### **Option 1 : Tests Manuels (Recommandé pour ce projet)**

Au lieu des tests automatisés, utilisez ces **tests manuels** :

#### **1. Test de Validation**
```javascript
// Dans la console du navigateur ou un fichier test simple
import { validationService } from './src/services/validationService';

// Test 1 : Validation correcte
const validGuest = {
  fullName: 'Jean Dupont',
  tableName: 'Table 1', 
  companions: 2
};
console.log('✅ Valid:', validationService.validateCreateGuest(validGuest));

// Test 2 : Validation incorrecte
const invalidGuest = {
  fullName: 'A', // Trop court
  tableName: '',  // Vide
  companions: -1  // Négatif
};
console.log('❌ Invalid:', validationService.validateCreateGuest(invalidGuest));
```

#### **2. Test des Composants**
- **Ouvrir l'app** et tester manuellement chaque écran
- **Ajouter un invité** avec des données valides/invalides
- **Tester la navigation** entre les écrans
- **Vérifier les états de chargement** et erreurs

#### **3. Test du QR Scanner**
- **Scanner un QR code** valide
- **Tester avec un QR invalide**
- **Vérifier la recherche manuelle**

### **Option 2 : Tests Unitaires Simples (Sans React Native Testing Library)**

Créer des tests basiques pour les **fonctions pures** :

```javascript
// test-validation.js (fichier simple)
const { validationService } = require('./src/services/validationService');

function testValidation() {
  console.log('🧪 Tests de Validation');
  
  // Test 1
  const result1 = validationService.validateCreateGuest({
    fullName: 'Jean Dupont',
    tableName: 'Table 1',
    companions: 2
  });
  console.log('Test 1 (valide):', result1.isValid ? '✅' : '❌');
  
  // Test 2  
  const result2 = validationService.validateCreateGuest({
    fullName: 'A',
    tableName: '',
    companions: -1
  });
  console.log('Test 2 (invalide):', !result2.isValid ? '✅' : '❌');
  
  // Test 3 - Sanitisation
  const sanitized = validationService.sanitizeGuestData({
    fullName: '  Jean   Dupont  ',
    tableName: '  Table 1  ',
    companions: -2
  });
  console.log('Test 3 (sanitisation):', 
    sanitized.fullName === 'Jean Dupont' && 
    sanitized.companions === 0 ? '✅' : '❌'
  );
}

// Lancer les tests
testValidation();
```

### **Option 3 : Mise à Jour Complète (Plus complexe)**

Si vous voulez vraiment des tests automatisés :

1. **Mettre à jour React Native** vers une version récente (0.74+)
2. **Downgrader React** vers 18.x
3. **Reconfigurer Jest** avec les bonnes versions

```bash
# Commandes pour mise à jour (ATTENTION : peut casser l'app)
npm install react@18.2.0 react-dom@18.2.0
npx expo install --fix
```

## 🎯 Recommandation Finale

Pour votre projet de mariage, je recommande **l'Option 1 (Tests Manuels)** car :

- ✅ **Rapide à implémenter**
- ✅ **Pas de conflits de versions**
- ✅ **Suffisant pour un projet personnel**
- ✅ **Focus sur les fonctionnalités importantes**

## 📋 Checklist de Tests Manuels

### **Validation**
- [ ] Ajouter invité avec nom valide
- [ ] Rejeter nom trop court (< 2 caractères)
- [ ] Rejeter table vide
- [ ] Rejeter accompagnants négatifs
- [ ] Sanitiser espaces en trop

### **Navigation**
- [ ] Accueil → Liste invités
- [ ] Accueil → Scanner QR
- [ ] Liste → Détails invité
- [ ] Retour navigation fonctionne

### **QR Scanner**
- [ ] Scanner QR valide
- [ ] Gérer QR invalide
- [ ] Recherche manuelle fonctionne
- [ ] Marquer présence fonctionne

### **Gestion d'Erreurs**
- [ ] Erreurs réseau affichées
- [ ] Erreurs validation affichées
- [ ] Boutons désactivés pendant chargement

### **Performance**
- [ ] App fluide avec 50+ invités
- [ ] Pas de lag lors du scroll
- [ ] Chargement rapide des écrans

## 🚀 Conclusion

Les tests manuels sont **parfaitement adaptés** pour votre app de mariage. Concentrez-vous sur les **fonctionnalités critiques** plutôt que sur la configuration complexe des tests automatisés.

**L'important** : que l'app fonctionne parfaitement le jour J ! 💍