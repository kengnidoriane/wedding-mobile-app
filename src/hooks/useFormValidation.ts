/**
 * Hook pour la validation de formulaires en temps réel
 */

import { useState, useCallback, useMemo } from 'react';
import { validationService } from '../services/validationService';
import { ValidationError } from '../types/guest';

interface FormField {
  value: string;
  error: string | null;
  touched: boolean;
}

interface UseFormValidationReturn {
  fields: Record<string, FormField>;
  errors: Record<string, string | null>;
  isValid: boolean;
  hasErrors: boolean;
  setValue: (fieldName: string, value: string) => void;
  setTouched: (fieldName: string) => void;
  validateField: (fieldName: string) => void;
  validateAll: () => boolean;
  reset: () => void;
  getFieldProps: (fieldName: string) => {
    value: string;
    onChangeText: (text: string) => void;
    onBlur: () => void;
    error: string | null;
  };
}

export const useFormValidation = (
  initialValues: Record<string, string> = {}
): UseFormValidationReturn => {
  const [fields, setFields] = useState<Record<string, FormField>>(() => {
    const initialFields: Record<string, FormField> = {};
    Object.keys(initialValues).forEach(key => {
      initialFields[key] = {
        value: initialValues[key] || '',
        error: null,
        touched: false
      };
    });
    return initialFields;
  });

  const setValue = useCallback((fieldName: string, value: string) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        error: prev[fieldName]?.touched ? 
          validationService.validateField(fieldName, value)?.message || null : 
          null
      }
    }));
  }, []);

  const setTouched = useCallback((fieldName: string) => {
    setFields(prev => {
      const field = prev[fieldName];
      if (!field) return prev;

      const error = validationService.validateField(fieldName, field.value);
      return {
        ...prev,
        [fieldName]: {
          ...field,
          touched: true,
          error: error?.message || null
        }
      };
    });
  }, []);

  const validateField = useCallback((fieldName: string) => {
    setFields(prev => {
      const field = prev[fieldName];
      if (!field) return prev;

      const error = validationService.validateField(fieldName, field.value);
      return {
        ...prev,
        [fieldName]: {
          ...field,
          error: error?.message || null
        }
      };
    });
  }, []);

  const validateAll = useCallback(() => {
    let allValid = true;
    
    setFields(prev => {
      const newFields = { ...prev };
      
      Object.keys(newFields).forEach(fieldName => {
        const field = newFields[fieldName];
        const error = validationService.validateField(fieldName, field.value);
        
        newFields[fieldName] = {
          ...field,
          touched: true,
          error: error?.message || null
        };
        
        if (error) {
          allValid = false;
        }
      });
      
      return newFields;
    });
    
    return allValid;
  }, []);

  const reset = useCallback(() => {
    setFields(prev => {
      const resetFields: Record<string, FormField> = {};
      Object.keys(prev).forEach(key => {
        resetFields[key] = {
          value: initialValues[key] || '',
          error: null,
          touched: false
        };
      });
      return resetFields;
    });
  }, [initialValues]);

  const getFieldProps = useCallback((fieldName: string) => ({
    value: fields[fieldName]?.value || '',
    onChangeText: (text: string) => setValue(fieldName, text),
    onBlur: () => setTouched(fieldName),
    error: fields[fieldName]?.error || null
  }), [fields, setValue, setTouched]);

  const errors = useMemo(() => {
    const errorMap: Record<string, string | null> = {};
    Object.keys(fields).forEach(key => {
      errorMap[key] = fields[key].error;
    });
    return errorMap;
  }, [fields]);

  const isValid = useMemo(() => {
    return Object.values(fields).every(field => !field.error);
  }, [fields]);

  const hasErrors = useMemo(() => {
    return Object.values(fields).some(field => field.error !== null);
  }, [fields]);

  return {
    fields,
    errors,
    isValid,
    hasErrors,
    setValue,
    setTouched,
    validateField,
    validateAll,
    reset,
    getFieldProps
  };
};