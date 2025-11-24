/**
 * Composant TextInput avec validation intégrée
 */

import React, { memo } from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../styles/theme';

interface ValidatedTextInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string | null;
  required?: boolean;
  containerStyle?: any;
}

const ValidatedTextInput = memo<ValidatedTextInputProps>(function ValidatedTextInput({
  label,
  error,
  required = false,
  containerStyle,
  ...textInputProps
}) {
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <TextInput
        {...textInputProps}
        style={[
          styles.input,
          hasError && styles.inputError,
          textInputProps.editable === false && styles.inputDisabled
        ]}
        placeholderTextColor={theme.colors.textLight}
      />
      
      {hasError && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border || '#E0E0E0',
  },
  inputError: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error + '10',
  },
  inputDisabled: {
    backgroundColor: theme.colors.background,
    opacity: 0.6,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default ValidatedTextInput;