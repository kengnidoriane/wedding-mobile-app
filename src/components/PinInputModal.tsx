/**
 * Modal pour saisie du PIN admin (compatible Android/iOS)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';

interface PinInputModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: (pin: string) => void;
  onCancel: () => void;
}

export default function PinInputModal({ 
  visible, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}: PinInputModalProps) {
  const [pin, setPin] = useState('');

  const handleConfirm = () => {
    onConfirm(pin);
    setPin('');
  };

  const handleCancel = () => {
    onCancel();
    setPin('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            placeholder="Entrez le PIN"
            secureTextEntry
            keyboardType="numeric"
            maxLength={10}
            autoFocus
          />
          
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmButton, !pin && styles.disabledButton]} 
              onPress={handleConfirm}
              disabled={!pin}
            >
              <Text style={styles.confirmText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#C7C7CC',
  },
  cancelText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  confirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});