import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Platform } from 'react-native';

interface PinPromptProps {
  visible: boolean;
  onConfirm: (pin: string) => void;
  onCancel: () => void;
}

export default function PinPrompt({ visible, onConfirm, onCancel }: PinPromptProps) {
  const [pin, setPin] = useState('');

  const handleConfirm = () => {
    if (pin.trim()) {
      onConfirm(pin.trim());
      setPin('');
    }
  };

  const handleCancel = () => {
    onCancel();
    setPin('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Code PIN Admin</Text>
          <Text style={styles.message}>Entrez le code PIN:</Text>
          
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            placeholder="****"
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
              style={[styles.confirmButton, !pin.trim() && styles.disabledButton]} 
              onPress={handleConfirm}
              disabled={!pin.trim()}
            >
              <Text style={[styles.confirmText, !pin.trim() && styles.disabledText]}>OK</Text>
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
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    marginRight: 6,
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    marginLeft: 6,
  },
  cancelText: {
    fontSize: 16,
    color: '#000',
  },
  confirmText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  disabledText: {
    color: '#999',
  },
});