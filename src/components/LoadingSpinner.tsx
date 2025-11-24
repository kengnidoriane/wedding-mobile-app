/**
 * Composant standardisé pour les indicateurs de chargement
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  variant?: 'overlay' | 'inline' | 'fullscreen';
  color?: string;
}

export const LoadingSpinner = memo<LoadingSpinnerProps>(function LoadingSpinner({
  size = 'large',
  text,
  variant = 'inline',
  color = theme.colors.primary
}) {
  const containerStyle = useMemo(() => [
    styles.container,
    variant === 'overlay' && styles.overlay,
    variant === 'fullscreen' && styles.fullscreen,
    variant === 'inline' && styles.inline
  ], [variant]);

  const textColor = useMemo(() => ({ color }), [color]);

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={[styles.text, textColor]}>{text}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
  fullscreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  inline: {
    paddingVertical: theme.spacing.md,
  },
  text: {
    ...theme.typography.body,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});