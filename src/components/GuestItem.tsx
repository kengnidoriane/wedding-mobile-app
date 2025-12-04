/**
 * Composant optimisé pour afficher un invité dans la liste
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Guest } from '../types/guest';
import { CheckIcon } from './icons/CheckIcon';
import { ClockIcon } from './icons/ClockIcon';

interface GuestItemProps {
  guest: Guest;
  selectionMode?: boolean;
  isSelected?: boolean;
  onPress?: (id: string) => void;
  onToggleSelection?: (id: string) => void;
  onLongPress?: (id: string) => void;
}

const GuestItem = memo<GuestItemProps>(function GuestItem({
  guest,
  selectionMode = false,
  isSelected = false,
  onPress,
  onToggleSelection,
  onLongPress
}) {
  const cardStyle = useMemo(() => [
    styles.guestCard,
    isSelected && styles.selectedCard
  ], [isSelected]);

  const statusBadgeStyle = useMemo(() => [
    styles.statusBadge,
    guest.isPresent ? styles.presentBadge : styles.absentBadge
  ], [guest.isPresent]);

  const handlePress = () => {
    if (selectionMode) {
      onToggleSelection?.(guest.id);
    } else {
      onPress?.(guest.id);
    }
  };

  const handleLongPress = () => {
    onLongPress?.(guest.id);
  };

  return (
    <TouchableOpacity 
      style={cardStyle}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={selectionMode ? 0.7 : 1}
      delayLongPress={500}
    >
      {selectionMode && (
        <View style={styles.checkbox}>
          <View style={[styles.checkboxInner, isSelected && styles.checkboxSelected]}>
            {isSelected && <CheckIcon size={16} color="#FFFFFF" />}
          </View>
        </View>
      )}
      
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{guest.fullName.charAt(0).toUpperCase()}</Text>
      </View>
      
      <View style={styles.guestContent}>
        <Text style={styles.guestName}>{guest.fullName}</Text>
        
        <View style={styles.guestFooter}>
          <Text style={styles.guestMessage}>
            {guest.companions > 0 ? `${guest.companions} accompagnant${guest.companions > 1 ? 's' : ''}` : 'Sans accompagnant'}
          </Text>
          
          <View style={statusBadgeStyle}>
            {guest.isPresent ? (
              <CheckIcon size={14} color="#FFFFFF" />
            ) : (
              <ClockIcon size={14} color="#FFFFFF" />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  guestCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  selectedCard: {
    backgroundColor: '#E3F2FD',
  },
  checkbox: {
    marginRight: 12,
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C6C6C8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  guestContent: {
    flex: 1,
    justifyContent: 'center',
  },
  guestName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  guestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  guestMessage: {
    fontSize: 15,
    color: '#8E8E93',
    flex: 1,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
  },
  presentBadge: {
    backgroundColor: '#34C759',
  },
  absentBadge: {
    backgroundColor: '#FF3B30',
  },
});

export default GuestItem;