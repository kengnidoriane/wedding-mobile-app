# 📱 Guide Complet des Tests en Mobile React Native

## 🎯 Pourquoi Tester en Mobile ?

Les tests en mobile sont **ESSENTIELS** car :
- **Fiabilité** : Éviter les bugs en production
- **Confiance** : Refactorer sans casser l'existant  
- **Documentation** : Les tests documentent le comportement attendu
- **Qualité** : Maintenir un code de haute qualité

## 🛠️ Types de Tests en Mobile

### 1. **Tests Unitaires** 
- Testent des fonctions/composants isolés
- Rapides à exécuter (millisecondes)
- Faciles à déboguer

### 2. **Tests d'Intégration**
- Testent l'interaction entre composants
- Vérifient les flux de données

### 3. **Tests E2E (End-to-End)**
- Testent l'application complète
- Simulent l'utilisateur réel
- Plus lents mais plus réalistes

## 🔧 Configuration des Tests

### Installation des Dépendances
```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest jest-expo
```

### Configuration Jest (jest.config.js)
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*)'
  ]
};
```

## 📝 Comment Écrire des Tests

### Structure d'un Test
```javascript
describe('NomDuComposant', () => {
  it('devrait faire quelque chose', () => {
    // Arrange (Préparer)
    const props = { title: 'Test' };
    
    // Act (Agir)
    const { getByText } = render(<Button {...props} />);
    
    // Assert (Vérifier)
    expect(getByText('Test')).toBeTruthy();
  });
});
```

### Tests de Composants React Native
```javascript
import { render, fireEvent } from '@testing-library/react-native';

// Test d'affichage
it('devrait afficher le titre', () => {
  const { getByText } = render(<Button title="Cliquer" />);
  expect(getByText('Cliquer')).toBeTruthy();
});

// Test d'interaction
it('devrait appeler onPress', () => {
  const mockPress = jest.fn();
  const { getByText } = render(<Button title="Test" onPress={mockPress} />);
  
  fireEvent.press(getByText('Test'));
  expect(mockPress).toHaveBeenCalled();
});
```

### Tests de Hooks
```javascript
import { renderHook, act } from '@testing-library/react-native';

it('devrait gérer l\'état', () => {
  const { result } = renderHook(() => useCounter());
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

### Tests de Services/Utilitaires
```javascript
// Test de fonction pure
it('devrait valider un email', () => {
  expect(validateEmail('test@example.com')).toBe(true);
  expect(validateEmail('invalid')).toBe(false);
});

// Test avec mock
jest.mock('../api');
it('devrait récupérer les données', async () => {
  const mockData = { id: 1, name: 'Test' };
  api.getData.mockResolvedValue(mockData);
  
  const result = await fetchUserData();
  expect(result).toEqual(mockData);
});
```

## 🎭 Mocking en React Native

### Mock des Modules Natifs
```javascript
// Mock d'Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn()
  }
}));

// Mock d'AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn()
}));
```

### Mock des Navigations
```javascript
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));
```

## 🚀 Commandes de Test

```bash
# Lancer tous les tests
npm test

# Tests en mode watch (re-exécute automatiquement)
npm run test:watch

# Tests avec couverture de code
npm run test:coverage

# Tests d'un fichier spécifique
npm test Button.test.tsx

# Tests en mode verbose (détaillé)
npm test -- --verbose
```

## 📊 Couverture de Code

### Seuils Recommandés
- **Lignes** : 70-80%
- **Fonctions** : 70-80%  
- **Branches** : 60-70%
- **Statements** : 70-80%

### Configuration dans jest.config.js
```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

## 🎯 Bonnes Pratiques

### ✅ À Faire
- **Tester le comportement**, pas l'implémentation
- **Noms de tests descriptifs** : "devrait faire X quand Y"
- **Tests isolés** : chaque test indépendant
- **Arrange-Act-Assert** : structure claire
- **Mock les dépendances externes**

### ❌ À Éviter
- Tests trop complexes
- Tester les détails d'implémentation
- Tests dépendants les uns des autres
- Ignorer les tests qui échouent
- Pas de tests pour le code critique

## 🔍 Debugging des Tests

### Techniques Utiles
```javascript
// Afficher le DOM rendu
const { debug } = render(<Component />);
debug();

// Attendre un élément asynchrone
await waitFor(() => {
  expect(getByText('Chargé')).toBeTruthy();
});

// Vérifier les logs
console.log = jest.fn();
// ... code qui log
expect(console.log).toHaveBeenCalledWith('message');
```

## 📱 Spécificités Mobile

### Tests de Permissions
```javascript
jest.mock('expo-camera', () => ({
  useCameraPermissions: () => [
    { granted: true },
    jest.fn()
  ]
}));
```

### Tests de Navigation
```javascript
it('devrait naviguer vers l\'écran suivant', () => {
  const { getByText } = render(<HomeScreen />);
  
  fireEvent.press(getByText('Aller à la liste'));
  expect(mockNavigate).toHaveBeenCalledWith('GuestList');
});
```

### Tests de Formulaires
```javascript
it('devrait valider le formulaire', () => {
  const { getByPlaceholderText, getByText } = render(<AddGuestForm />);
  
  fireEvent.changeText(getByPlaceholderText('Nom'), 'Jean Dupont');
  fireEvent.press(getByText('Ajouter'));
  
  expect(mockAddGuest).toHaveBeenCalledWith({
    fullName: 'Jean Dupont'
  });
});
```

## 🎪 Tests E2E avec Detox (Avancé)

### Installation
```bash
npm install --save-dev detox
```

### Test E2E Exemple
```javascript
describe('App E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('devrait ajouter un invité', async () => {
    await element(by.text('Ajouter')).tap();
    await element(by.id('nameInput')).typeText('Jean Dupont');
    await element(by.text('Confirmer')).tap();
    
    await expect(element(by.text('Jean Dupont'))).toBeVisible();
  });
});
```

## 🏆 Exemple Complet

Voici un exemple complet de test pour votre app :

```javascript
// GuestListScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import GuestListScreen from '../GuestListScreen';

// Mocks
jest.mock('../hooks/useFirebaseGuests', () => ({
  useFirebaseGuests: () => ({
    guests: [
      { id: '1', fullName: 'Jean Dupont', tableName: 'Table 1', companions: 2 }
    ],
    addGuest: jest.fn(),
    loading: false,
    error: null
  })
}));

describe('GuestListScreen', () => {
  it('devrait afficher la liste des invités', () => {
    const { getByText } = render(<GuestListScreen />);
    
    expect(getByText('Jean Dupont')).toBeTruthy();
    expect(getByText('Table 1')).toBeTruthy();
  });

  it('devrait ouvrir le modal d\'ajout', () => {
    const { getByText } = render(<GuestListScreen />);
    
    fireEvent.press(getByText('+'));
    
    expect(getByText('Ajouter un invité')).toBeTruthy();
  });
});
```

## 🎯 Résumé

Les tests en mobile suivent les mêmes principes que les tests web, mais avec des spécificités :
- **Mocking des modules natifs** (caméra, stockage, etc.)
- **Tests de navigation** entre écrans
- **Tests de permissions** et d'accès aux fonctionnalités
- **Tests de formulaires** et validation

**Commencez petit** : testez d'abord vos fonctions utilitaires, puis vos composants, et enfin vos écrans complets !