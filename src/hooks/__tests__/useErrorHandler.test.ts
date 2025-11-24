/**
 * Tests unitaires pour le hook useErrorHandler
 */

import { renderHook, act } from '@testing-library/react-native';
import { useErrorHandler } from '../useErrorHandler';

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn()
  }
}));

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait initialiser sans erreur', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
  });

  it('devrait gérer une erreur avec showError', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.showError(new Error('Test error'), 'test context');
    });
    
    expect(result.current.error).toEqual({
      message: 'Test error',
      context: 'test context'
    });
    expect(result.current.hasError).toBe(true);
  });

  it('devrait gérer une erreur string', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.showError('String error');
    });
    
    expect(result.current.error?.message).toBe('String error');
  });

  it('devrait effacer l\'erreur', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.showError('Test error');
    });
    
    expect(result.current.hasError).toBe(true);
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
  });

  it('devrait afficher une alerte avec showAlert', () => {
    const { Alert } = require('react-native');
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.showAlert(new Error('Alert error'));
    });
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'Erreur',
      'Alert error',
      [{ text: 'OK', onPress: expect.any(Function) }]
    );
  });
});