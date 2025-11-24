/**
 * Tests unitaires pour le hook useLoading
 */

import { renderHook, act } from '@testing-library/react-native';
import { useLoading } from '../useLoading';

describe('useLoading', () => {
  it('devrait initialiser sans état de chargement', () => {
    const { result } = renderHook(() => useLoading());
    
    expect(result.current.isLoading()).toBe(false);
    expect(result.current.isLoading('test')).toBe(false);
  });

  it('devrait gérer l\'état de chargement pour une clé', () => {
    const { result } = renderHook(() => useLoading());
    
    act(() => {
      result.current.startLoading('test');
    });
    
    expect(result.current.isLoading('test')).toBe(true);
    expect(result.current.isLoading()).toBe(true);
    
    act(() => {
      result.current.stopLoading('test');
    });
    
    expect(result.current.isLoading('test')).toBe(false);
    expect(result.current.isLoading()).toBe(false);
  });

  it('devrait gérer plusieurs états de chargement', () => {
    const { result } = renderHook(() => useLoading());
    
    act(() => {
      result.current.startLoading('test1');
      result.current.startLoading('test2');
    });
    
    expect(result.current.isLoading('test1')).toBe(true);
    expect(result.current.isLoading('test2')).toBe(true);
    expect(result.current.isLoading()).toBe(true);
    
    act(() => {
      result.current.stopLoading('test1');
    });
    
    expect(result.current.isLoading('test1')).toBe(false);
    expect(result.current.isLoading('test2')).toBe(true);
    expect(result.current.isLoading()).toBe(true);
  });

  it('devrait gérer withLoading avec succès', async () => {
    const { result } = renderHook(() => useLoading());
    const mockFn = jest.fn().mockResolvedValue('success');
    
    let loadingDuringExecution = false;
    
    const promise = act(async () => {
      const resultPromise = result.current.withLoading('test', mockFn);
      
      // Vérifier que le loading est actif pendant l'exécution
      loadingDuringExecution = result.current.isLoading('test');
      
      return await resultPromise;
    });
    
    const returnValue = await promise;
    
    expect(loadingDuringExecution).toBe(true);
    expect(result.current.isLoading('test')).toBe(false);
    expect(returnValue).toBe('success');
    expect(mockFn).toHaveBeenCalled();
  });

  it('devrait gérer withLoading avec erreur', async () => {
    const { result } = renderHook(() => useLoading());
    const mockFn = jest.fn().mockRejectedValue(new Error('Test error'));
    
    await act(async () => {
      try {
        await result.current.withLoading('test', mockFn);
      } catch (error) {
        expect(error.message).toBe('Test error');
      }
    });
    
    expect(result.current.isLoading('test')).toBe(false);
  });
});