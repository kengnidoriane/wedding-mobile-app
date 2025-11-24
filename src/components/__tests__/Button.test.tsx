/**
 * Tests unitaires pour le composant Button
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  it('devrait afficher le titre', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('devrait afficher l\'icône avec le titre', () => {
    const { getByText } = render(
      <Button title="Test" icon="🎉" onPress={() => {}} />
    );
    
    expect(getByText('🎉 Test')).toBeTruthy();
  });

  it('devrait appeler onPress quand pressé', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('ne devrait pas appeler onPress quand désactivé', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('devrait être désactivé quand disabled=true', () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(
      <Button title="Test" onPress={mockOnPress} disabled />
    );
    
    const button = getByRole('button');
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });
});