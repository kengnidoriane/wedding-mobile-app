/**
 * Composant optimisé pour afficher un invité dans la liste
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import Card from './Card';
import { LoadingButton } from './LoadingButton';
import Button from './Button';
import { Guest } from '../types/guest';
import { CheckIcon } from './icons/CheckIcon';
import { ClockIcon } from './icons/ClockIcon';
import { QRIcon } from './icons/QRIcon';
import { TrashIcon } from './icons/TrashIcon';

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



  return (
    <View style={styles.guestCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{guest.fullName.charAt(0).toUpperCase()}</Text>
      </View>
      
      <View style={styles.guestContent}>
        <View style={styles.guestHeader}>
          <Text style={styles.guestName}>{guest.fullName}</Text>
          <Text style={styles.timestamp}>Table {guest.tableName}</Text>
        </View>
        
        <View style={styles.guestFooter}>
          <Text style={styles.guestMessage}>
            {guest.companions > 0 ? `${guest.companions} accompagnant(s)` : 'Sans accompagnant'}
          </Text>
          
          <View style={styles.guestActions}>
            <TouchableOpacity 
              style={statusBadgeStyle}
              onPress={() => onTogglePresence(guest.id, guest.fullName, guest.isPresent)}
              disabled={isLoading('markPresent') || isLoading('markAbsent')}
            >
              {guest.isPresent ? (
                <CheckIcon size={16} color="#FFFFFF" />
              ) : (
                <ClockIcon size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.qrButton}
              onPress={() => onShareQR(guest.id)}
            >
              <QRIcon size={14} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => onDelete(guest.id, guest.fullName)}
              disabled={isLoading('deleteGuest')}
            >
              <TrashIcon size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
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
  },
  guestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  guestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  timestamp: {
    fontSize: 14,
    color: '#8E8E93',
  },
  guestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guestMessage: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  guestActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  qrButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
  },
});

export default GuestItem;