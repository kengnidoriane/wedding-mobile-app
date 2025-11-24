/**
 * Tests unitaires pour le composant ValidatedTextInput
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import ValidatedTextInput from '../ValidatedTextInput';

describe('ValidatedTextInput', () => {
  it('devrait afficher le label', () => {
    const { getByText } = render(
      <ValidatedTextInput label="Nom" />
    );
    
    expect(getByText('Nom')).toBeTruthy();
  });

  it('devrait afficher l\'astérisque pour les champs requis', () => {
    const { getByText } = render(
      <ValidatedTextInput label="Nom" required />
    );
    
    expect(getByText('*')).toBeTruthy();
  });

  it('devrait afficher le message d\'erreur', () => {
    const { getByText } = render(
      <ValidatedTextInput 
        label="Nom" 
        error="Ce champ est requis" 
      />
    );
    
    expect(getByText('Ce champ est requis')).toBeTruthy();
  });

  it('ne devrait pas afficher d\'erreur quand error est null', () => {
    const { queryByText } = render(
      <ValidatedTextInput 
        label="Nom" 
        error={null}
      />
    );
    
    expect(queryByText('Ce champ est requis')).toBeNull();
  });

  it('devrait passer les props au TextInput', () => {
    const { getByDisplayValue } = render(
      <ValidatedTextInput 
        label="Nom"
        value="Test Value"
        placeholder="Entrez votre nom"
      />
    );
    
    expect(getByDisplayValue('Test Value')).toBeTruthy();
  });
});