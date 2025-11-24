import React, { memo, useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof theme.spacing;
}

const Card = memo<CardProps>(function Card({ children, style, padding = 'lg' }: CardProps) {
  const cardStyle = useMemo(() => [
    styles.card, 
    { padding: theme.spacing[padding] }, 
    style
  ], [padding, style]);

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
});

export default Card;

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
    marginBottom: theme.spacing.md,
  },
});