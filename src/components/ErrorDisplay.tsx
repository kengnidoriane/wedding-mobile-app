/**
 * Composant standardisé pour afficher les erreurs
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import { ErrorState } from '../hooks/useErrorHandler';

interface ErrorDisplayProps {
  error: ErrorState;
  onDismiss?: () => void;
  onRetry?: () => void;
  variant?: 'banner' | 'card' | 'inline';
}

export const ErrorDisplay = memo<ErrorDisplayProps>(function ErrorDisplay({
  error,
  onDismiss,
  onRetry,
  variant = 'card'
}) {
  const containerStyle = useMemo(() => [
    styles.container,
    variant === 'banner' && styles.banner,
    variant === 'card' && styles.card,
    variant === 'inline' && styles.inline
  ], [variant]);

  return (
    <View style={containerStyle}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <View style={styles.textContainer}>
          <Text style={styles.message}>{error.message}</Text>
          {error.context && (
            <Text style={styles.context}>Contexte: {error.context}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.actions}>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.error + '15',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  banner: {
    borderRadius: 0,
    marginVertical: 0,
  },
  card: {
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.lg,
  },
  inline: {
    marginVertical: theme.spacing.xs,
    marginHorizontal: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.error,
    fontWeight: '500',
  },
  context: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  retryButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.sm,
  },
  retryText: {
    ...theme.typography.caption,
    color: theme.colors.surface,
    fontWeight: '600',
  },
  dismissButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  dismissText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
});