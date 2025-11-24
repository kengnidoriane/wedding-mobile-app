/**
 * Hook standardisé pour la gestion des erreurs
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

export interface ErrorState {
  message: string | null;
  code?: string;
  context?: string;
}

interface UseErrorHandlerReturn {
  error: ErrorState | null;
  showError: (error: unknown, context?: string) => void;
  showAlert: (error: unknown, context?: string) => void;
  clearError: () => void;
  hasError: boolean;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<ErrorState | null>(null);

  const formatError = useCallback((error: unknown, context?: string): ErrorState => {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: (error as any).code,
        context
      };
    }
    
    if (typeof error === 'string') {
      return { message: error, context };
    }
    
    return { 
      message: 'Une erreur inconnue est survenue', 
      context 
    };
  }, []);

  const showError = useCallback((error: unknown, context?: string) => {
    const formattedError = formatError(error, context);
    console.error(`❌ Error${context ? ` in ${context}` : ''}:`, error);
    setError(formattedError);
  }, [formatError]);

  const showAlert = useCallback((error: unknown, context?: string) => {
    const formattedError = formatError(error, context);
    console.error(`❌ Error${context ? ` in ${context}` : ''}:`, error);
    
    Alert.alert(
      'Erreur',
      formattedError.message || 'Une erreur est survenue',
      [{ text: 'OK', onPress: () => setError(null) }]
    );
  }, [formatError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    showError,
    showAlert,
    clearError,
    hasError: error !== null
  };
};