/**
 * Composant optimisé pour afficher un invité dans la liste
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import Card from './Card';
import { LoadingButton } from './LoadingButton';
import Button from './Button';
import { Guest } from '../types/guest';

interface GuestItemProps {
  guest: Guest;
  onTogglePresence: (id: string, name: string, isPresent: boolean) => void;
  onDelete: (id: string, name: string) => void;
  onShareQR: (id: string) => void;
  isLoading: (key?: string) => boolean;
}

const GuestItem = memo<GuestItemProps>(function GuestItem({
  guest,
  onTogglePresence,
  onDelete,
  onShareQR,
  isLoading
}) {
  const statusBadgeStyle = useMemo(() => [
    styles.statusBadge,
    guest.isPresent ? styles.presentBadge : styles.absentBadge
  ], [guest.isPresent]);

  const statusTextStyle = useMemo(() => [
    styles.statusText,
    guest.isPresent ? styles.presentText : styles.absentText
  ], [guest.isPresent]);

  return (
    <Card style={styles.guestCard}>
      <View style={styles.guestHeader}>
        <Text style={styles.guestName}>{guest.fullName}</Text>
        <View style={statusBadgeStyle}>
          <Text style={statusTextStyle}>
            {guest.isPresent ? '✅ Présent' : '⏳ Absent'}
          </Text>
        </View>
      </View>

      <View style={styles.guestInfo}>
        <Text style={styles.infoItem}>📍 Table: {guest.tableName}</Text>
        <Text style={styles.infoItem}>👥 Accompagnants: {guest.companions}</Text>
      </View>

      <View style={styles.guestActions}>
        <LoadingButton
          title={guest.isPresent ? "Marquer absent" : "Marquer présent"}
          onPress={() => onTogglePresence(guest.id, guest.fullName, guest.isPresent)}
          variant={guest.isPresent ? "outline" : "primary"}
          size="sm"
          icon={guest.isPresent ? "❌" : "✅"}
          loading={isLoading('markPresent') || isLoading('markAbsent')}
        />
        <Button
          title="Partager QR"
          onPress={() => onShareQR(guest.id)}
          variant="secondary"
          size="sm"
          icon="💬"
        />
        <LoadingButton
          title="Supprimer"
          onPress={() => onDelete(guest.id, guest.fullName)}
          variant="outline"
          size="sm"
          icon="🗑️"
          loading={isLoading('deleteGuest')}
        />
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  guestCard: {
    marginBottom: theme.spacing.md,
  },
  guestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  guestName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  presentBadge: {
    backgroundColor: theme.colors.success + '20',
  },
  absentBadge: {
    backgroundColor: theme.colors.error + '20',
  },
  statusText: {
    ...theme.typography.small,
    fontWeight: '600',
  },
  presentText: {
    color: theme.colors.success,
  },
  absentText: {
    color: theme.colors.error,
  },
  guestInfo: {
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  infoItem: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  guestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
});

export default GuestItem;