import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof theme.spacing;
}

export default function Card({ children, style, padding = 'lg' }: CardProps) {
  return (
    <View style={[styles.card, { padding: theme.spacing[padding] }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
    marginBottom: theme.spacing.md,
  },
});